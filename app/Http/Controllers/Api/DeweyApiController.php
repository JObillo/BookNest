<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dewey;

class DeweyApiController extends Controller
{
    public function index()
    {
        $deweys = Dewey::select('id', 'dewey_number', 'dewey_classification')->get();
        return response()->json($deweys);
    }
}
