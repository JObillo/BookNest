<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Books;

class BooksController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('books',[
            'books' => Books::all()
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
        $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'required|string|max:255|unique:books',
            'publisher' => 'required|string|max:255',
            'book_copies' => 'required|integer',
            'call_number' => 'required|integer',
            'book_cover' => 'nullable|image|max:2048'
        ]);

        $data = $request->only([
            'title',
            'author',
            'isbn',
            'publisher',
            'book_copies',
            'call_number'
        ]);
        if ($request->hasFile('book_cover')) 
        {
            $file = $request->file('book_cover');
            $filename = time() . '_' . $file->getClientOriginalExtension();
            $path = $file->storeAs('uploads', $filename, 'public');
            $data['book_cover'] = '/storage/'.$path;
        }

        Books::create($data);
        return redirect()->route('books.index')->with('success', 'Book Added successfully.');
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
    public function update(Request $request, $id)
    {
        // Fetch the book by ID
        $book = Books::findOrFail($id);

        // Validation rules
        $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'required|string|max:255|unique:books,isbn,' . $book->id, // Exclude current book from unique validation
            'publisher' => 'required|string|max:255',
            'book_copies' => 'required|integer',
            'call_number' => 'required|integer',
            'book_cover' => 'nullable|image|max:2048'
        ]);

        // Prepare the data for updating
        $data = $request->only([
            'title',
            'author',
            'isbn',
            'publisher',
            'book_copies',
            'call_number'
        ]);

        // Check if the user uploaded a new book cover image
        if ($request->hasFile('book_cover')) {
            // Delete the old image from storage if necessary
            if ($book->book_cover) {
                $oldCover = public_path($book->book_cover);
                if (file_exists($oldCover)) {
                    unlink($oldCover);
                }
            }

            // Save the new cover image
            $file = $request->file('book_cover');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('uploads', $filename, 'public');
            $data['book_cover'] = '/storage/'.$path;
        }

        // Update the book with the new data
        $book->update($data);

        return redirect()->route('books.index')->with('success', 'Book Updated successfully.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Books $book)
    {
        $book->delete();
        return redirect()->route('books.index')->with('success', 'Book Deleted successfully.');
    }

}
