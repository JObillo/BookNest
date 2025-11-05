import React, { forwardRef } from "react";
import { Book } from "./MostBorrowed";

interface SemesterInfo {
  name?: string;
  start_date?: string;
  end_date?: string;
}

interface PrintProps {
  books: Book[];
  semester?: SemesterInfo;
}

const PrintMostBorrowed = forwardRef<HTMLDivElement, PrintProps>(
  ({ books, semester }, ref) => {
    const formatDate = (dateString?: string) =>
      dateString
        ? new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A";

    const schoolYear =
      semester?.start_date && semester?.end_date
        ? `${new Date(semester.start_date).getFullYear()} - ${new Date(
            semester.end_date
          ).getFullYear()}`
        : "N/A";

    return (
      <div
        ref={ref}
        className="p-8 text-gray-900 font-sans text-[14px] flex flex-col min-h-[100vh]"
      >
        {/* ===== MAIN CONTENT (flex-1 pushes footer to bottom) ===== */}
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
              MOST BORROWED BOOKS REPORT
            </h2>
            <h2 className="font-semibold text-[15px] text-gray-800">
              PhilCST Library
            </h2>
            <p className="text-sm text-gray-700 mt-1">
              Date Generated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* ===== SEMESTER INFO ===== */}
          {semester && (
            <div className="text-right text-sm mb-4">
              <p>
                <strong>Semester:</strong>{" "}
                {semester.name || "All Semesters"}
              </p>
              {semester.start_date && semester.end_date && (
                <p>
                  <strong>School Year:</strong> {schoolYear}
                </p>
              )}
            </div>
          )}

          {/* ===== TABLE ===== */}
          <table className="w-full border border-gray-400 border-collapse text-[13px]">
            <thead className="bg-purple-100 text-purple-900">
              <tr>
                <th className="border border-gray-400 p-2 text-left font-semibold">
                  Title & Author
                </th>
                <th className="border border-gray-400 p-2 text-left font-semibold">
                  Publisher
                </th>
                <th className="border border-gray-400 p-2 text-center font-semibold">
                  Borrowed Times
                </th>
              </tr>
            </thead>
            <tbody>
              {books.length > 0 ? (
                books.map((item) => (
                  <tr
                    key={item.book?.id}
                    className="odd:bg-white even:bg-gray-50"
                  >
                    <td className="border border-gray-300 p-2 align-top">
                      <strong>{item.book?.title}</strong>
                      <div className="text-xs italic text-gray-600">
                        by {item.book?.author || "Unknown"}
                      </div>
                    </td>
                    <td className="border border-gray-300 p-2 align-top">
                      {item.book?.publisher || "N/A"}
                    </td>
                    <td className="border border-gray-300 p-2 text-center align-top font-medium">
                      {item.borrow_count}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center border border-gray-300 p-4 text-gray-500 italic"
                  >
                    No borrowed books found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ===== FOOTER (Prepared by) ===== */}
          {/* <div className="mt-12 text-right mr-16">
            <p className="text-sm mb-10">Prepared by:</p>
            <p className="font-semibold underline decoration-gray-700">
              ___________________________
            </p>
            <p className="text-sm italic text-gray-700">Librarian</p>
          </div> */}
        </div>

        {/* ===== ACCREDITATION LOGOS (ALWAYS BOTTOM) ===== */}
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

export default PrintMostBorrowed;
