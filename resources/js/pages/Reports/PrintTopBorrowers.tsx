import React, { forwardRef } from "react";
import { Borrower } from "./TopBorrowed";

interface BorrowedBook {
  id: number;
  title: string;
  author: string;
  issued_date?: string;
  returned_at?: string;
}

interface PrintProps {
  mode: "topBorrowers" | "borrowerHistory";
  borrowers?: Borrower[];
  borrower?: {
    name?: string;
    email?: string;
    course?: string;
    year?: string;
    patron_type?: string;
    borrow_count?: number;
  } | null;
  borrowedBooks?: BorrowedBook[];
  borrow_count?: number;
}

const PrintLibraryReport = forwardRef<HTMLDivElement, PrintProps>(
  ({ mode, borrowers = [], borrower, borrowedBooks = [] }, ref) => {
    const isTopBorrowers = mode === "topBorrowers";

    return (
      <div ref={ref} className="text-black font-sans p-6">
        {/* Header */}
        <div className="flex items-center mb-6 gap-4">
          <img
            src="/philcstlogo.png"
            alt="School Logo"
            className="w-20 h-20 object-contain"
          />
          <div className="text-center flex-1">
            <h2 className="font-bold text-lg">
              PHILIPPINE COLLEGE OF SCIENCE AND TECHNOLOGY
            </h2>
            <p className="text-sm">
              Old Nalsian Road, Nalsian, Calasiao, Pangasinan
            </p>
            <h3 className="font-semibold mt-2">PhilCST Library</h3>
            <h2 className="font-bold text-lg mt-1">
              {isTopBorrowers
                ? "Top Borrowers Report"
                : "Library Borrower Report"}
            </h2>
            <p className="text-sm mt-1">
              Printed on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Borrower Info (for borrowerHistory mode) */}
        {!isTopBorrowers && borrower && (
          <div className="mb-4 border-b pb-2 text-sm">
            <p>
              <strong>Name:</strong> {borrower.name}
            </p>
            <p>
              <strong>Email:</strong> {borrower.email}
            </p>
            <p>
              <strong>Course & Year:</strong> {borrower.course} — {borrower.year}
            </p>
            <p>
              <strong>Patron Type:</strong> {borrower.patron_type}
            </p>
            <p>
            <strong>Borrowed Times:</strong> {borrower.borrow_count ?? borrowedBooks.length ?? 0}
            </p>
          </div>
        )}

        {/* Top Borrowers Table */}
        {isTopBorrowers && (
          <table className="w-full border-collapse border text-sm">
            <thead className="bg-purple-900 text-white">
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2 text-left">Name & Email</th>
                <th className="border p-2 text-left">Course & Year</th>
                <th className="border p-2 text-left">Type</th>
                <th className="border p-2 text-center">Borrowed Times</th>
              </tr>
            </thead>
            <tbody>
              {borrowers.length > 0 ? (
                borrowers.map((b, i) => (
                  <tr key={b.patron?.id || i} className="border">
                    <td className="border p-2 text-center">{i + 1}</td>
                    <td className="border p-2">
                      <div className="font-semibold">{b.patron?.name}</div>
                      <div className="text-xs text-gray-600">
                        {b.patron?.email}
                      </div>
                    </td>
                    <td className="border p-2">
                      {b.patron?.course} — {b.patron?.year}
                    </td>
                    <td className="border p-2">{b.patron?.patron_type}</td>
                    <td className="border p-2 text-center font-semibold text-purple-700">
                      {b.borrow_count} 
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-4 text-gray-600 italic"
                  >
                    No borrowers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Borrower History Table */}
        {!isTopBorrowers && (
          <table className="w-full border-collapse border text-sm mt-4">
            <thead className="bg-purple-900 text-white">
              <tr>
                <th className="border p-2 text-left">#</th>
                <th className="border p-2 text-left">Title</th>
                <th className="border p-2 text-left">Author</th>
              </tr>
            </thead>
            <tbody>
              {borrowedBooks.length > 0 ? (
                borrowedBooks.map((book, i) => (
                  <tr key={book.id} className="border">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{book.title}</td>
                    <td className="p-2">{book.author}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="p-4 text-center text-gray-500 italic"
                  >
                    No borrowed books found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  }
);

export default PrintLibraryReport;
