<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Ebook;
use Inertia\Response;
use App\Models\Book;
use App\Models\Section;
use App\Models\Dewey;

class EbooksController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ebooks = Ebook::all();
        return Inertia::render('Ebooks', [
            'ebooks' => $ebooks,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
            $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publisher' => 'required|string|max:255',
            'year' => 'nullable|string|max:255',
            'book_cover' => 'nullable|image|max:2048',
            'file_url' => 'nullable|file|mimes:pdf,epub|max:10240',
        ]);

        // Handle file upload
        if ($request->hasFile('book_cover')) {
            $file = $request->file('book_cover');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('uploads', $filename, 'public');
            $validated['book_cover'] = '/storage/' . $path;
        }

        // Handle ebook file upload
        if ($request->hasFile('file_url')) {
            $file = $request->file('file_url');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('uploads', $filename, 'public');
            $validated['file_url'] = '/storage/' . $path;
        }

        return redirect()->route('ebooks.index')->with('success', 'EBook Added successfully.');

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
