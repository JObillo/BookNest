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
      <div
        ref={ref}
        className="p-8 text-gray-900 font-sans text-[14px] flex flex-col min-h-[100vh]"
      >
        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1">
          {/* ===== HEADER ===== */}
          <div className="flex items-center justify-between border-b-4 border-purple-800 pb-4 mb-6">
            <div className="flex items-center gap-4">
              <img
                src="/philcstlogo.png"
                alt="School Logo"
                className="w-20 h-20 object-contain"
              />
              <div className="leading-tight">
                <h1 className="text-xl font-extrabold text-purple-800">
                  PHILIPPINE COLLEGE OF
                  <br />
                  SCIENCE AND TECHNOLOGY
                </h1>
                <p className="text-[13px] text-gray-700 mt-1">
                  Old Nalsian Road, Nalsian, Calasiao, Pangasinan
                </p>
              </div>
            </div>

            <div className="w-px h-10 bg-purple-700 mx-6"></div>

            <div className="text-right">
              <h2 className="text-purple-800 font-bold text-lg tracking-wide">
                YOUR FUTURE STARTS HERE
              </h2>
            </div>
          </div>

          {/* ===== REPORT TITLE ===== */}
          <div className="text-center mb-6">
            <h2 className="font-extrabold text-[17px] text-purple-800 mt-1">
              {isTopBorrowers
                ? "TOP BORROWERS REPORT"
                : "BORROWER HISTORY REPORT"}
            </h2>
            <h2 className="font-semibold text-[15px] text-gray-800">
              PhilCST Library
            </h2>
            <p className="text-sm text-gray-700 mt-1">
              Date Generated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* ===== BORROWER INFO (History Mode) ===== */}
          {!isTopBorrowers && borrower && (
            <div className="mb-4 pb-2 text-sm flex justify-between border-b border-gray-300">
              <div className="flex flex-col gap-1">
                <p>
                  <strong>Name:</strong> {borrower.name}
                </p>
                <p>
                  <strong>Email:</strong> {borrower.email}
                </p>
              </div>

              <div className="flex flex-col gap-1 text-right">
                <p>
                  <strong>Course & Year:</strong> {borrower.course} —{" "}
                  {borrower.year}
                </p>
                <p>
                  <strong>Patron Type:</strong> {borrower.patron_type}
                </p>
              </div>
            </div>
          )}

          {/* ===== TABLE ===== */}
          {isTopBorrowers ? (
            <table className="w-full border border-gray-400 border-collapse text-[13px]">
              <thead className="bg-purple-100 text-purple-900">
                <tr>
                  <th className="border border-gray-400 p-2 text-center font-semibold w-[40px]">
                    #
                  </th>
                  <th className="border border-gray-400 p-2 text-left font-semibold">
                    Name & Email
                  </th>
                  <th className="border border-gray-400 p-2 text-left font-semibold">
                    Course & Year
                  </th>
                  <th className="border border-gray-400 p-2 text-left font-semibold">
                    Type
                  </th>
                  <th className="border border-gray-400 p-2 text-center font-semibold">
                    Borrowed Times
                  </th>
                </tr>
              </thead>
              <tbody>
                {borrowers.length > 0 ? (
                  borrowers.map((b, i) => (
                    <tr
                      key={b.patron?.id || i}
                      className="odd:bg-white even:bg-gray-50"
                    >
                      <td className="border border-gray-300 p-2 text-center">
                        {i + 1}
                      </td>
                      <td className="border border-gray-300 p-2 align-top">
                        <strong>{b.patron?.name}</strong>
                        <div className="text-xs italic text-gray-600">
                          {b.patron?.email || "N/A"}
                        </div>
                      </td>
                      <td className="border border-gray-300 p-2 align-top">
                        {b.patron?.course} — {b.patron?.year}
                      </td>
                      <td className="border border-gray-300 p-2 align-top">
                        {b.patron?.patron_type}
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-medium text-purple-800">
                        {b.borrow_count}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center border border-gray-300 p-4 text-gray-500 italic"
                    >
                      No borrowers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full border border-gray-400 border-collapse text-[13px]">
              <thead className="bg-purple-100 text-purple-900">
                <tr>
                  <th className="border border-gray-400 p-2 text-center font-semibold w-[40px]">
                    #
                  </th>
                  <th className="border border-gray-400 p-2 text-left font-semibold">
                    Title
                  </th>
                  <th className="border border-gray-400 p-2 text-left font-semibold">
                    Author
                  </th>
                  <th className="border border-gray-400 p-2 text-center font-semibold">
                    Borrowed Times
                  </th>
                </tr>
              </thead>
              <tbody>
                {borrowedBooks.length > 0 ? (
                  borrowedBooks.map((book, i) => (
                    <tr key={book.id} className="odd:bg-white even:bg-gray-50">
                      <td className="p-2 border text-center">{i + 1}</td>
                      <td className="p-2 border">{book.title}</td>
                      <td className="p-2 border">{book.author}</td>
                      <td className="p-2 border text-center">
                        {borrower?.borrow_count ?? borrowedBooks.length ?? 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-4 text-center text-gray-500 italic border"
                    >
                      No borrowed books found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* ===== FOOTER (Prepared by) ===== */}
          {/* <div className="mt-12 text-right mr-16">
            <p className="text-sm mb-10">Prepared by:</p>
            <p className="font-semibold underline decoration-gray-700">
              ___________________________
            </p>
            <p className="text-sm italic text-gray-700">Librarian</p>
          </div> */}
        </div>

        {/* ===== ACCREDITATION LOGOS (BOTTOM) ===== */}
        <div className="mt-12 pt-6 border-t border-gray-300 print:fixed print:bottom-8 print:left-0 print:right-0">
          <p className="text-center text-sm text-gray-700 mb-3 font-semibold">
            A TRADITION OF EXCELLENCE CONTINUES
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6">
            <img
              src="/image.png"
              alt="Accreditation Logos"
              className="h-12 object-contain mx-auto"
            />
          </div>
        </div>
      </div>
    );
  }
);

export default PrintLibraryReport;
