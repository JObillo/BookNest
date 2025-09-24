<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ebook;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Dompdf\Dompdf;

class EbookController extends Controller
{
    // Display homepage latest 5 ebooks
    public function latest()
    {
        $ebooks = Ebook::orderBy('created_at', 'desc')->take(5)->get();
        return Inertia::render('Welcome', [
            'ebooks' => $ebooks,
        ]);
    }

    // Manage ebooks page
    public function manage()
    {
        $ebooks = Ebook::orderBy('created_at', 'desc')->get();
        return Inertia::render('Ebooks', [
            'ebooks' => $ebooks,
        ]);
    }

    // Index page (See All eBooks)
    public function index()
    {
        $ebooks = Ebook::orderBy('created_at', 'desc')->get();
        return Inertia::render('EbooksBySection', [
            'ebooks' => $ebooks,
        ]);
    }

    // Store uploaded or fetched ebooks
    public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|string',
        'author' => 'required|string',
        'publisher' => 'nullable|string',
        'year' => 'nullable|string',
        'description' => 'nullable|string',

        // Allow file or URL for cover
        'cover' => 'nullable',
        // Allow file or URL for ebook file
        'file_url' => 'nullable',
    ]);

    // Handle uploaded cover file
    if ($request->hasFile('cover')) {
        $validated['cover'] = $request->file('cover')->store('covers', 'public');
    } elseif ($request->cover && filter_var($request->cover, FILTER_VALIDATE_URL)) {
        // If it's a URL (fetched)
        try {
            $contents = file_get_contents($request->cover);
            $filename = 'covers/' . uniqid() . '.jpg';
            Storage::disk('public')->put($filename, $contents);
            $validated['cover'] = $filename;
        } catch (\Exception $e) {
            $validated['cover'] = $request->cover; // fallback keep URL
        }
    }

    // Handle uploaded ebook file
    if ($request->hasFile('file_url')) {
        $validated['file_url'] = $request->file('file_url')->store('ebooks', 'public');
    } elseif ($request->file_url && filter_var($request->file_url, FILTER_VALIDATE_URL)) {
        // Keep external URL if provided
        $validated['file_url'] = $request->file_url;
    }

    // Save to DB
    // Ebook::create($validated);?
        $ebook = Ebook::create($validated);
    // ✅ Return Inertia with new ebook
    return response()->json([
        'newEbook' => $ebook
    ]);
    }
    // Download local ebooks
    public function download($id)
    {
        $ebook = Ebook::findOrFail($id);

        if (filter_var($ebook->file_url, FILTER_VALIDATE_URL)) {
            // External URL
            return redirect($ebook->file_url);
        }

        $path = storage_path('app/public/' . $ebook->file_url);
        if (!file_exists($path)) {
            abort(404, 'File not found.');
        }

        return response()->download($path, $ebook->title . '.pdf');
    }

    // Delete ebook
    public function destroy($id)
    {
        $ebook = Ebook::findOrFail($id);

        if ($ebook->file_url && Storage::disk('public')->exists($ebook->file_url)) {
            Storage::disk('public')->delete($ebook->file_url);
        }

        if ($ebook->cover && Storage::disk('public')->exists($ebook->cover)) {
            Storage::disk('public')->delete($ebook->cover);
        }

        $ebook->delete();
        return back()->with('success', 'EBook deleted successfully.');
    }

//     public function bulkDelete(Request $request)
// {
//     $ids = $request->input('ids', []);

//     if (empty($ids)) {
//         return back()->with('error', 'No e-books selected for deletion.');
//     }

//     // delete from DB
//     \App\Models\Ebook::whereIn('id', $ids)->delete();

//     return back()->with('success', count($ids) . ' e-books deleted successfully.');
// }

    

}

#controller ebook