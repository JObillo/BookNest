<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EbookCache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MobileEbookController extends Controller
{
    public function index(Request $request)
    {
        $perPage = intval($request->input('perPage', 5));
        $page = intval($request->input('page', 1));
        $search = $request->input('search', '');
        $filter = $request->input('filter', 'all');

        $query = EbookCache::query();

        if ($search) {
            $query->where(function ($q) use ($search, $filter) {
                if ($filter === 'title') {
                    $q->where('title', 'like', "%$search%");
                } elseif ($filter === 'author') {
                    $q->where('author', 'like', "%$search%");
                } else {
                    $q->where('title', 'like', "%$search%")
                      ->orWhere('author', 'like', "%$search%");
                }
            });
        }

        $ebooks = $query->orderBy('created_at', 'desc')
                        ->paginate($perPage, ['*'], 'page', $page);

return response()->json([
    'data' => $ebooks->items(),
    'total' => $ebooks->total(),
    'per_page' => $ebooks->perPage(),
    'current_page' => $ebooks->currentPage(),
    'last_page' => $ebooks->lastPage(),
    'next_page_url' => $ebooks->nextPageUrl(),
    'prev_page_url' => $ebooks->previousPageUrl(),
]);

    }

    // 🧠 Optional: cache refetch route (same as web)
    public function fetchNew(Request $request)
    {
        $query = $request->input('query', 'classic literature');
        $limit = $request->input('limit', 100);

        $apiRes = Http::get("http://openlibrary.org/search.json?q=" . urlencode($query) . "&limit={$limit}");
        $data = $apiRes->json();

        if (!isset($data['docs'])) return response()->json(['message' => 'No ebooks found.']);

        $ebooksToCache = [];
        foreach ($data['docs'] as $doc) {
            if (!isset($doc['ia'][0])) continue;
            $iaId = $doc['ia'][0];
            $ebooksToCache[] = [
                'title' => $doc['title'] ?? 'Unknown',
                'author' => $doc['author_name'][0] ?? 'Unknown',
                'year' => $doc['first_publish_year'] ?? null,
                'cover' => isset($doc['cover_i']) ? "https://covers.openlibrary.org/b/id/{$doc['cover_i']}-M.jpg" : null,
                'file_url' => "http://archive.org/download/$iaId/$iaId.pdf",
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (!empty($ebooksToCache)) {
            EbookCache::insert($ebooksToCache);
        }

        return response()->json(['message' => 'Cached new ebooks', 'count' => count($ebooksToCache)]);
    }
}
