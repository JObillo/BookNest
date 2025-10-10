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
    // Format date helper
    const formatDate = (dateString?: string) =>
      dateString
        ? new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A";

    // Compute school year
    const schoolYear =
      semester?.start_date && semester?.end_date
        ? `${new Date(semester.start_date).getFullYear()} - ${new Date(
            semester.end_date
          ).getFullYear()}`
        : "N/A";

    return (
      <div ref={ref} className="print-container text-black">
        {/* Center Header */}
       

        {/* Semester Info (right-aligned under header) */}
        

        {/* Table */}
        <table className="print-table w-full border-collapse">
  <thead>
    <tr>
      <th colSpan={4} className="border-b-2 pb-2">
        <div className="relative mb-2 text-center">
          <img
            src="/philcstlogo.png"
            alt="School Logo"
            className="w-16 h-16 object-contain absolute left-0 top-0"
          />
          <h2 className="font-bold text-lg text-purple-800">
            PHILIPPINE COLLEGE OF SCIENCE AND TECHNOLOGY
          </h2>
          <p className="text-sm">
            Old Nalsian Road, Nalsian, Calasiao, Pangasinan
          </p>
          <h3 className="font-semibold mt-2">PhilCST Library</h3>
          <h2 className="font-bold mt-1 text-base">
            Most Borrowed Books Report
          </h2>
          <p className="text-sm">
            Date Generated: {new Date().toLocaleDateString()}
          </p>
        </div>
        {semester && (
          <div className="text-right text-sm mb-4 mr-2">
            <p>
              <strong>Semester:</strong> {semester.name || "All Semesters"}
            </p>
            {semester.start_date && semester.end_date && (
              <>
                <p>
                  {/* <strong>Duration:</strong>{" "} */}
                  {/* {formatDate(semester.start_date)} –{" "} */}
                  {/* {formatDate(semester.end_date)} */}
                </p>
                <p>
                  <strong>School Year:</strong> {schoolYear}
                </p>
              </>
            )}
          </div>
        )}
      </th>
    </tr>
    <tr>
      <th className="border p-2">Title & Author</th>
      <th className="border p-2">Publisher</th>
      <th className="border p-2">Catalog Info</th>
      <th className="border p-2">Borrowed Times</th>
    </tr>
  </thead>

          <tbody>
            {books.map((item) => (
              <tr key={item.book?.id}>
                <td className="border p-2 align-top">
                  <strong>{item.book?.title}</strong>
                  <div className="author text-sm">
                    by {item.book?.author || "Unknown"}
                  </div>
                </td>
                <td className="border p-2 align-top">
                  {item.book?.publisher || "N/A"}
                </td>
                <td className="border p-2 align-top">
                  Acc#: {item.book?.accession_number || "N/A"} <br />
                  Call#: {item.book?.call_number || "N/A"} <br />
                  Year: {item.book?.year || "N/A"} <br />
                  Place: {item.book?.publication_place || "N/A"}
                </td>
                <td className="border p-2 text-center align-top">
                  {item.borrow_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

export default PrintMostBorrowed;