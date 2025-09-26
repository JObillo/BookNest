<?php

namespace App\Http\Controllers;

use App\Models\EbookCache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class EbookController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('perPage', 5);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        $random = $request->input('random', false);

        if (EbookCache::count() > 0) {
            // Filter by search if provided
            $query = EbookCache::query();
            if ($search) {
                $query->where('title', 'like', "%$search%")
                      ->orWhere('author', 'like', "%$search%")
                      ->orWhere('publisher', 'like', "%$search%");
            }

            // Return random ebooks if requested
            if ($random) {
                $ebooks = $query->inRandomOrder()->take($perPage)->get();

                return response()->json([
                    'data' => $ebooks,
                    'total' => $ebooks->count(),
                    'per_page' => $perPage,
                    'current_page' => 1,
                ]);
            }

            // Default: paginate
            $ebooks = $query->orderBy('created_at', 'desc')
                            ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'data' => $ebooks->items(),
                'total' => $ebooks->total(),
                'per_page' => $ebooks->perPage(),
                'current_page' => $ebooks->currentPage(),
            ]);
        } else {
            return response()->json([
                'data' => [],
                'total' => 0,
                'per_page' => $perPage,
                'current_page' => $page,
            ]);
        }
    }

    public function manage()
    {
        $ebooks = EbookCache::orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Ebooks', [
            'ebooks' => $ebooks->items(),
            'total' => $ebooks->total(),
            'per_page' => $ebooks->perPage(),
            'current_page' => $ebooks->currentPage(),
        ]);
    }

    public function studentView()
    {
        return Inertia::render('EbooksBySection', [
            'limit' => 5,
        ]);
    }

    public function adminView()
    {
        return Inertia::render('Ebooks');
    }

    // Return ebooks per section with admin-controlled limit
    public function getBySection(Request $request, $sectionId)
    {
        $limit = $request->input('limit', 5);
        $ebooks = EbookCache::where('section_id', $sectionId)
                        ->where('available', true)
                        ->take($limit)
                        ->get();

        return response()->json($ebooks);
    }

        /**
     * Reset: Delete all cached ebooks
     */
public function reset()
    {
        try {
            // Truncate the table
            DB::table('ebooks_cache')->truncate();

            return response()->json(['message' => '✅ Cache reset successfully.']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    /**
     * Fetch: Get 100 new ebooks from OpenLibrary and cache them
     */
    public function fetchNew()
    {
        try {
            $query = 'classic literature';
            $apiRes = Http::get("http://openlibrary.org/search.json?q=" . urlencode($query) . "&limit=100");
            $data = $apiRes->json();

            if (!isset($data['docs'])) {
                return response()->json(['message' => 'No ebooks found from API.']);
            }

            $ebooksToCache = [];

            foreach ($data['docs'] as $doc) {
                if (!isset($doc['ia']) || count($doc['ia']) === 0) continue;

                $iaId = $doc['ia'][0];
                $pdfFileUrl = "http://archive.org/download/$iaId/$iaId.pdf";

                $ebooksToCache[] = [
                    'title' => $doc['title'] ?? 'Unknown',
                    'author' => isset($doc['author_name']) ? implode(', ', $doc['author_name']) : 'Unknown',
                    'publisher' => $doc['publisher'][0] ?? 'Unknown',
                    'year' => $doc['first_publish_year'] ?? 'Unknown',
                    'cover' => isset($doc['cover_i']) ? "https://covers.openlibrary.org/b/id/{$doc['cover_i']}-M.jpg" : null,
                    'file_url' => $pdfFileUrl,
                    'description' => $doc['first_sentence'][0] ?? $doc['subtitle'] ?? 'No description',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($ebooksToCache)) {
                EbookCache::insert($ebooksToCache);
            }

            return response()->json([
                'message' => '✅ Successfully fetched new ebooks.',
                'count' => count($ebooksToCache)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => '❌ Failed to fetch new ebooks',
                'details' => $e->getMessage()
            ], 500);
        }
    }

}

