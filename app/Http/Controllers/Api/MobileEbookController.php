<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EbookCache;
use Illuminate\Http\Request;

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
            if ($filter === 'title') {
                $query->where('title', 'like', "%$search%");
            } elseif ($filter === 'author') {
                $query->where('author', 'like', "%$search%");
            } else {
                // IMPORTANT: wrap OR in a closure
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%$search%")
                      ->orWhere('author', 'like', "%$search%");
                });
            }
        }

        $ebooks = $query->orderBy('created_at', 'desc')
                        ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $ebooks->items(),
            'total' => $ebooks->total(),
            'per_page' => $ebooks->perPage(),
            'current_page' => $ebooks->currentPage(),
            'last_page' => $ebooks->lastPage(),
        ]);
    }
}
