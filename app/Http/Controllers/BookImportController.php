<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Section;
use App\Models\Dewey;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class BookImportController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt,xlsx',
        ]);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $rows = [];

        // Read CSV or TXT
        if ($extension === 'csv' || $extension === 'txt') {
            $handle = fopen($file->getPathname(), 'r');
            $header = fgetcsv($handle);
            while ($row = fgetcsv($handle)) {
                $rows[] = array_combine($header, $row);
            }
            fclose($handle);
        } else { // Read Excel
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $allRows = $sheet->toArray();
            $header = array_shift($allRows);
            foreach ($allRows as $row) {
                $rows[] = array_combine($header, $row);
            }
        }

        $errors = [];
        $imported = 0;

        foreach ($rows as $index => $data) {
            try {
                // Ensure Section exists
                $section = Section::firstOrCreate(['section_name' => $data['section'] ?? 'Unknown Section']);

                // Ensure Dewey exists
                $dewey = Dewey::firstOrCreate(
                    ['dewey_number' => $data['ddc'] ?? '000'],
                    ['dewey_classification' => $data['ddc'] ?? '000']
                );

                // Prepare book data
                $isbn = $data['isbn'] ?: 'TEMP-' . uniqid();
                $book = Book::firstOrCreate(
                    ['isbn' => $isbn],
                    [
                        'title' => $data['title'] ?? 'Untitled',
                        'author' => $data['author'] ?? 'Unknown',
                        'publisher' => $data['publisher'] ?? null,
                        'year' => $data['year'] ?? null,
                        'section_id' => $section->id,
                        'dewey_id' => $dewey->id,
                        'book_cover' => $data['book_cover'] ?? null,
                        'call_number' => $data['call_number'] ?? 'IMPORT-' . rand(1000, 9999),
                        'book_copies' => !empty($data['accession_numbers']) ? count(explode('|', $data['accession_numbers'])) : 1,
                        'copies_available' => !empty($data['accession_numbers']) ? count(explode('|', $data['accession_numbers'])) : 1,
                        'status' => 'Available',
                    ]
                );

                // Add Book Copies
                if (!empty($data['accession_numbers'])) {
                    foreach (explode('|', $data['accession_numbers']) as $acc) {
                        BookCopy::firstOrCreate([
                            'book_id' => $book->id,
                            'accession_number' => trim($acc),
                        ]);
                    }
                }

                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row " . ($index + 2) . ": " . $e->getMessage();
            }
        }

        // Redirect back like BooksController with plain flash messages
        return redirect()->route('books.index')->with([
            'success' => $imported > 0 ? "$imported books imported successfully!" : null,
            'imported' => $imported,
            'errors_import' => $errors, // just plain array, Inertia can read as flash
        ]);
    }
}
