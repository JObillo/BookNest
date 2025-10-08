import { useEffect, useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Toaster } from "sonner";
import { type BreadcrumbItem } from "@/types";
import { useReactToPrint } from "react-to-print";
import PrintTopBorrower from "./PrintTopBorrowers";
import { useRef } from "react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Report - Top Borrowers", href: "/reports/top-borrowers" },
];

export type Borrower = {
  patron?: {
    id?: number;
    name?: string;
    email?: string;
    course?: string;
    year?: string;
    patron_type?: string;
  };
  borrow_count?: number;
};

type Semester = {
  id: number;
  name: string;
  school_year: string;
  start_date: string;
  end_date: string;
};

export default function TopBorrowers() {
  const {
    borrowers: backendBorrowers = [],
    semesters: backendSemesters = [],
    selectedSemester: backendSelectedSemester,
  } = usePage<{
    borrowers: Borrower[];
    semesters: Semester[];
    selectedSemester?: number | "All";
  }>().props;

  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState<number | "All">(
    backendSelectedSemester || "All"
  );

  const [semesters] = useState<Semester[]>(backendSemesters);

  const [showModal, setShowModal] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower["patron"] | null>(null);
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);

  const handleViewDetails = async (patronId?: number) => {
    if (!patronId) return;

    try {
      const response = await fetch(`/reports/top-borrowers/${patronId}/books`);
      const data = await response.json();

      setSelectedBorrower(data.patron);
      setBorrowedBooks(data.borrowedBooks);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch borrowed books", err);
    }
  };

  // --- Consistent filter handler like MostBorrowed ---
  const handleFilterChange = (
    newLimit: number,
    newSemester: number | "All" = selectedSemester
  ) => {
    router.get(
      "/reports/top-borrowers",
      { limit: newLimit, semester_id: newSemester },
      { preserveState: true, replace: true }
    );
  };

  // --- Pagination ---
  const borrowersPerPage = limit;
  const totalPages = Math.ceil(backendBorrowers.length / borrowersPerPage);
  const startIndex = (currentPage - 1) * borrowersPerPage;
  const endIndex = startIndex + borrowersPerPage;
  const displayedBorrowers = backendBorrowers.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [backendBorrowers, limit, selectedSemester]);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  // ADD below existing imports
const mainPrintRef = useRef<HTMLDivElement>(null);
const handleMainPrint = useReactToPrint({
  contentRef: mainPrintRef,
});
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Top Borrowers" />
      <Toaster position="top-right" richColors />

      {/* Filters and Print Button */}
<div className="flex flex-wrap items-center gap-4 mt-10">
  <label className="flex items-center">
    Limit
    <select
      value={limit}
      onChange={(e) => {
        const newLimit = Number(e.target.value);
        setLimit(newLimit);
        handleFilterChange(newLimit, selectedSemester);
      }}
      className="ml-2 border rounded px-2 py-2 h-10 w-[110px]"
    >
      <option value={10}>Top 10</option>
      <option value={20}>Top 20</option>
      <option value={50}>Top 50</option>
      <option value={100}>Top 100</option>
    </select>
  </label>

  <label className="flex items-center">
    Semester
    <select
      value={selectedSemester}
      onChange={(e) => {
        const semId =
          e.target.value === "All" ? "All" : Number(e.target.value);
        setSelectedSemester(semId);
        handleFilterChange(limit, semId);
      }}
      className="ml-2 border rounded px-2 py-2 h-10 w-[180px]"
    >
      <option value="All">All</option>
      {semesters.map((sem) => (
        <option key={sem.id} value={sem.id}>
          {sem.name} ({sem.school_year})
        </option>
      ))}
    </select>
  </label>

  <button
    onClick={handleMainPrint}
    disabled={!backendBorrowers.length}
    className={`font-medium rounded-lg px-4 py-2 h-10 shadow-md transition-all duration-200 cursor-pointer ${
      backendBorrowers.length
        ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg"
        : "bg-gray-300 text-gray-600 cursor-not-allowed"
    }`}
  >
    Print Report
  </button>
</div>

{/* No Report Available Block
{!backendBorrowers.length && (
  <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-sm">
    No report available to print.
  </div>
)} */}
      {/* Table */}
      <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded mt-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
            <thead>
              <tr className="bg-purple-900 text-white border-b">
                {["Name & Email", "Course & Year", "Borrowed Times", "Actions"].map(
                  (header) => (
                    <th key={header} className="border p-3 text-left">
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {displayedBorrowers.length ? (
                displayedBorrowers.map((item) => (
                  <tr
                    key={item.patron?.id}
                    className="border-b hover:bg-gray-100"
                  >
                    <td className="p-3">
                      <div className="font-semibold">{item.patron?.name}</div>
                      <div className="text-sm text-gray-600">
                        {item.patron?.email}
                      </div>
                      <div className="text-sm text-gray-400">
                        {item.patron?.patron_type}
                      </div>
                    </td>
                    <td className="p-3">
                      {item.patron?.course} — {item.patron?.year}
                    </td>
                    <td className="p-3 text-purple-700 font-semibold">
                      {item.borrow_count} Times
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleViewDetails(item.patron?.id)}
                        className="px-3 py-1 bg-purple-700 text-white rounded hover:bg-purple-800 cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-600">
                    No borrowers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 px-4 py-3 text-sm text-gray-700 cursor-pointer">
          <span>
            Page {currentPage} — {displayedBorrowers.length} borrower
            {displayedBorrowers.length !== 1 && "s"} on this page
          </span>

          <div className="flex items-center gap-1">
            <button
              className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="px-3 py-1 bg-purple-700 text-white rounded">
              {currentPage}
            </span>

            <button
              className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {/* Hidden printable report for main Top Borrowers */}
      <div className="hidden">
        <PrintTopBorrower
          ref={mainPrintRef}
          mode="topBorrowers"
          borrowers={backendBorrowers}
        />
      </div>

      {/* Modal */}
      {showModal && selectedBorrower && (
        <div className="fixed inset-0 flex items-center justify-center border border-black rounded-lg overflow-y-auto bg-black/50 z-50">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl p-6 relative">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {selectedBorrower?.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedBorrower?.course} — {selectedBorrower?.year}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-800 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            {/* Table */}
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-purple-900 text-white">
                  <tr>
                    <th className="p-2 text-left">Title</th>
                    <th className="p-2 text-left">Author</th>
                    {/* <th className="p-2 text-left">Borrowed At</th>
                    <th className="p-2 text-left">Returned At</th> */}
                  </tr>
                </thead>
                <tbody>
                  {borrowedBooks.length ? (
                    borrowedBooks.map((book) => (
                      <tr
                        key={book.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="p-2">{book.title}</td>
                        <td className="p-2">{book.author}</td>
                        {/* <td className="p-2">{book.issued_date}</td>
                        <td className="p-2">
                          {book.returned_at || (
                            <span className="text-red-500 font-medium">
                              Not yet returned
                            </span>
                          )}
                        </td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center p-6 text-gray-500 italic"
                      >
                        No books borrowed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-4 gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
              >
                Print
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-purple-900 text-white hover:bg-purple-700 transition"
              >
                Close
              </button>
            </div>

            {/* Hidden printable content */}
            <div className="hidden">
              <PrintTopBorrower
                ref={printRef}
                mode="borrowerHistory"
                borrower={selectedBorrower}
                borrowedBooks={borrowedBooks}
              />
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
