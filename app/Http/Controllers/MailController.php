<?php

namespace App\Http\Controllers;

use App\Notifications\OverdueBooks;
use App\Models\IssuedBook;
use Illuminate\Http\Request;

class MailController extends Controller
{
    public function index()
    {
        // Get all issued books with status 'overdue'
        $overdueBooks = IssuedBook::where('status', 'overdue')->get();

        foreach ($overdueBooks as $issuedBook) {
            $patron = $issuedBook->patron; // Make sure IssuedBook has a 'patron' relationship
            $book   = $issuedBook->book;   // Make sure IssuedBook has a 'book' relationship

            // Pass only the book title
            $data = [
                'title' => $book->title,
            ];

            $patron->notify(new OverdueBooks($data));
        }

        dd("Overdue notifications sent!");
    }
}
