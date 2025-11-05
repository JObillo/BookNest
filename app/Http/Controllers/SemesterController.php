<?php

namespace App\Http\Controllers;

use App\Models\Semester;
use Illuminate\Http\Request;

class SemesterController extends Controller
{
    public function start(Request $request)
    {
        // End any active semester first
        Semester::whereNull('end_date')->update(['end_date' => now()]);

        $semester = Semester::create([
            'name' => $request->name,
            'start_date' => $request->start_date,
            'end_date' => null,
        ]);

        return redirect()->back()->with('success', $semester->name . ' started.');
    }

    public function end(Request $request)
    {
        $semester = Semester::findOrFail($request->id);
        $semester->update([
            'end_date' => $request->end_date,
        ]);

        return redirect()->back()->with('success', $semester->name . ' ended.');
    }
public function getActive()
{
    $semester = Semester::where('status', 'Active')->first();

    if (!$semester) {
        return response()->json(['message' => 'No active semester found.'], 404);
    }

    return response()->json($semester);
}


}

