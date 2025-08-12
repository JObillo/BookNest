<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ebook;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EbookController extends Controller
{
    public function index()
        {
            $ebooks = Ebook::all();
            return Inertia::render('Ebooks', [
                'ebooks' => $ebooks,
            ]);
        }

    public function store(Request $request)
    {
        // Validate inputs
        $validated = $request->validate([
            'title' => 'required|string',
            'author' => 'required|string',
            'publisher' => 'nullable|string',
            'year' => 'nullable|string',
            'cover' => 'nullable|file|image|max:2048',
            'file_url' => 'nullable|file|mimes:pdf,epub|max:102400',
        ]);

        // Store cover file if it exists
        if ($request->hasFile('cover')) {
            $validated['cover'] = $request->file('cover')->store('covers', 'public');
        }

        // Store eBook file if it exists
        if ($request->hasFile('file_url')) {
            $validated['file_url'] = $request->file('file_url')->store('ebooks', 'public');
        }
        

        // Create ebook entry in the database
        $ebook = Ebook::create($validated);

        // Return the saved ebook as a JSON response
        //return response()->json($ebook, 201);
        return redirect()->route('ebooks.index')->with('success', 'EBook Added successfully.');

        
    }
    public function destroy($id)
{
    $ebook = Ebook::findOrFail($id);

    // Delete eBook file from the public disk
    if ($ebook->file_url && Storage::disk('public')->exists($ebook->file_url)) {
        Storage::disk('public')->delete($ebook->file_url);
    }

    // Delete cover image from the public disk
    if ($ebook->cover && Storage::disk('public')->exists($ebook->cover)) {
        Storage::disk('public')->delete($ebook->cover);
    }

    $ebook->delete();

    return back();
}



}

