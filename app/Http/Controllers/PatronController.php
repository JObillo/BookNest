<?php

namespace App\Http\Controllers;

use App\Models\Patron;
use Illuminate\Http\Request;

class PatronController extends Controller
{
    /**
     * Fetch all Patrons.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // Fetch all patrons from the database
        $patrons = Patron::all();

        // Return the patrons as a JSON response
        return response()->json($patrons);
    }

    /**
     * Fetch a single Patron by ID.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        // Find patron by ID or return 404 if not found
        $patron = Patron::find($id);

        if (!$patron) {
            return response()->json(['message' => 'Patron not found'], 404);
        }

        // Return the patron as a JSON response
        return response()->json($patron);
    }
}
