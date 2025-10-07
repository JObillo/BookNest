<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\Book;
use Illuminate\Http\Request;

class SectionApiController extends Controller
{
    // GET /api/sections
    public function index()
    {
        // Get all sections with all books
        $sections = Section::with(['books' => function ($query) {
            $query->get(['id', 'title', 'author', 'status', 'book_cover', 'section_id']);
        }])->get(['id', 'section_name']);

        return response()->json($sections);
    }


    // GET /api/sections/{id}/books
    public function books(Section $section)
    {
        $books = $section->books()->get(['id', 'title', 'author', 'isbn', 'publisher', 'status', 'book_cover']);

        return response()->json([
            'section' => [
                'id' => $section->id,
                'section_name' => $section->section_name
            ],
            'books' => $books
        ]);
    }


}
//original code