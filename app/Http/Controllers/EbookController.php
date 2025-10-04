<?php

namespace App\Http\Controllers;

use App\Models\EbookCache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class EbookController extends Controller
{
    /**
     * Admin view: return cached ebooks
     * If cache is empty, fetch automatically.
     */
    public function adminView()
    {
        $ebooksCount = EbookCache::count();

        // If cache is empty, fetch from OpenLibrary
        if ($ebooksCount === 0) {
            $this->fetchNewEbooksInternal("classic literature", 100);
        }

        $ebooks = EbookCache::orderBy('created_at', 'desc')->get();

        return Inertia::render('Ebooks', [
            'ebooks' => $ebooks,
        ]);
    }

    /**
     * API endpoint to return ebooks (used by frontend)
     */
public function index(Request $request)
{
    $query = EbookCache::query();

    // Search filter
    $search = $request->input('search', '');
    $searchBy = $request->input('searchBy', 'title'); // title or author
    if ($search) {
        $query->where($searchBy, 'like', "%{$search}%");
    }

    // Year filter
    $startYear = $request->input('startYear');
    $endYear = $request->input('endYear');

    if ($startYear) {
        $query->where('year', '>=', $startYear);
    }

    if ($endYear) {
        $query->where('year', '<=', $endYear);
    }

    $ebooks = $query->orderBy('created_at', 'desc')->get();

    return response()->json([
        'data' => $ebooks,
        'total' => $ebooks->count(),
    ]);
}


    /**
     * Internal method to fetch and cache ebooks from OpenLibrary
     */
private function fetchNewEbooksInternal($limitPerCategory = 50)
{
    $categories = [
        "classic literature",
        "science fiction",
        "romance",
        "fantasy",
        "history",
        "technology",
        "philosophy",
        "art",
        "poetry",
        "biography"
    ];

    foreach ($categories as $category) {
        try {
            $apiRes = Http::get("http://openlibrary.org/search.json?q=" . urlencode($category) . "&limit={$limitPerCategory}");
            $data = $apiRes->json();

            if (!isset($data['docs'])) continue;

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

        } catch (\Exception $e) {
            Log::error("Failed to fetch category '{$category}': " . $e->getMessage());
        }
    }
}

    public function manage()
{
    // Check if cache is empty
    if (EbookCache::count() === 0) {
        $this->fetchNewEbooksInternal("classic literature", 100);
    }

    // Get all cached ebooks
    $ebooks = EbookCache::orderBy('created_at', 'desc')->get();

    // Return Inertia view without buttons or dropdowns
    return Inertia::render('Ebooks', [
        'ebooks' => $ebooks,
    ]);
}
public function studentView()
{
    return Inertia::render('EbooksBySection', [
        'limit' => 5,
    ]);
}
public function freeEbooks()
{
    $ebooks = EbookCache::orderBy('created_at', 'desc')
        ->take(5)
        ->get();

    return response()->json($ebooks);
}
}
