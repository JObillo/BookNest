<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Section;

class SectionApiController extends Controller
{
    public function index()
    {
        $sections = Section::with(['books' => function ($query) {
            $query->limit(3); // Limit books per section preview
        }])->get();

        return response()->json([
            'status' => true,
            'message' => 'Sections fetched successfully.',
            'data' => $sections
        ]);
    }
}
