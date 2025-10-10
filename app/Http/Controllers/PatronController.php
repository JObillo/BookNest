<?php

namespace App\Http\Controllers;

use App\Models\Patron;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatronController extends Controller
{
    public function index()
    {
        return Inertia::render('Borrowers', [
            'patrons' => Patron::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'school_id' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($request) {
                    if (in_array($request->patron_type, ['Student', 'Faculty']) && !preg_match('/^\d{5}$/', $value)) {
                        $fail('School ID must be 6 digits.');
                    }
                    if ($request->patron_type === 'Guest' && !preg_match('/^G-\d+$/', $value)) {
                        $fail('Guest ID must be in format G-xxxxx.');
                    }
                },
            ],
            'name' => ['required', 'string', 'regex:/^[a-zA-Z\s]+$/'],
            'email' => 'required|email|unique:patrons,email',
            'course' => function ($attribute, $value, $fail) use ($request) {
                if ($request->patron_type === 'Student' && empty($value)) $fail('Course is required.');
            },
            'year' => function ($attribute, $value, $fail) use ($request) {
                if ($request->patron_type === 'Student' && empty($value)) $fail('Year is required.');
            },
            'department' => function ($attribute, $value, $fail) use ($request) {
                if ($request->patron_type === 'Faculty' && empty($value)) $fail('Department is required.');
            },
            'contact_number' => function ($attribute, $value, $fail) use ($request) {
                if ($request->patron_type === 'Guest' && !preg_match('/^\d+$/', $value)) {
                    $fail('Contact Number must contain numbers only.');
                }
            },
            'address' => 'nullable|string|max:255',
            'patron_type' => 'required|in:Student,Faculty,Guest',
        ]);

        if ($validated['patron_type'] === 'Guest') {
            $validated['school_id'] = 'G-' . rand(10000, 99999);
        }

        Patron::create($validated);

        return redirect()->back()->with('success', 'Borrower added successfully.');
    }

    public function update(Request $request, $id)
    {
        $patron = Patron::findOrFail($id);

        $validated = $request->validate([
            'school_id' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($request) {
                    if (in_array($request->patron_type, ['Student', 'Faculty']) && !preg_match('/^\d{5}$/', $value)) {
                        $fail('School ID must be 6 digits.');
                    }
                    if ($request->patron_type === 'Guest' && !preg_match('/^G-\d+$/', $value)) {
                        $fail('Guest ID must be in format G-xxxxx.');
                    }
                },
            ],
            'name' => ['required', 'string', 'regex:/^[a-zA-Z\s]+$/'],
            'email' => 'required|email|unique:patrons,email,' . $patron->id,
            'course' => function ($attribute, $value, $fail) use ($request) {
                if ($request->patron_type === 'Student' && empty($value)) $fail('Course is required.');
            },
            'year' => function ($attribute, $value, $fail) use ($request) {
                if ($request->patron_type === 'Student' && empty($value)) $fail('Year is required.');
            },
            'department' => function ($attribute, $value, $fail) use ($request) {
                if ($request->patron_type === 'Faculty' && empty($value)) $fail('Department is required.');
            },
            'contact_number' => function ($attribute, $value, $fail) use ($request) {
                if ($request->patron_type === 'Guest' && !preg_match('/^\d+$/', $value)) {
                    $fail('Contact Number must contain numbers only.');
                }
            },
            'address' => 'nullable|string|max:255',
            'patron_type' => 'required|in:Student,Faculty,Guest',
        ]);

        $patron->update($validated);

        return redirect()->back()->with('success', 'Borrower updated successfully.');
    }

    public function show($id)
    {
        $patron = Patron::find($id);
        if (!$patron) return response()->json(['message' => 'Patron not found'], 404);
        return response()->json($patron);
    }

    public function destroy($id)
    {
        $patron = Patron::findOrFail($id);
        try {
            $patron->delete();
            return redirect()->back()->with('success', 'Borrower deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete borrower.');
        }
    }
}
