<?php

namespace App\Http\Controllers;

use App\Models\Dewey;
use Inertia\Response;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeweyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Dewey', [
            'deweys' => Dewey::all()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'dewey_number' => 'required|string|max:255',
            'dewey_classification' => 'required|string|max:255',
        ]);

        $data = $request->only(['dewey_number', 'dewey_classification']);
        Dewey::create($data);
        
        return redirect()->route('deweys.index')->with('success', 'Dewey Added successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // Edit logic here if needed
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $dewey = Dewey::findOrFail($id);
        
        $request->validate([
            'dewey_number' => 'required|string|max:255',
            'dewey_classification' => 'required|string|max:255',
        ]);

        $dewey->update($request->only(['dewey_number', 'dewey_classification']));

        return redirect()->route('deweys.index')->with('success', 'Dewey Updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Dewey::destroy($id);
        return redirect()->route('deweys.index')->with('success', 'Dewey Deleted successfully.');
    }
}
