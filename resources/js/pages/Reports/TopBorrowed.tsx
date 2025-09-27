import { useEffect, useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Toaster } from "sonner";
import { type BreadcrumbItem } from "@/types";

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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Top Borrowers" />
      <Toaster position="top-right" richColors />

      {/* Filters */}
      <div className="flex gap-4 mt-10">
        <label>
          Limit
          <select
            value={limit}
            onChange={(e) => {
              const newLimit = Number(e.target.value);
              setLimit(newLimit);
              handleFilterChange(newLimit, selectedSemester);
            }}
            className="ml-2 border rounded px-2 py-1"
          >
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={50}>Top 50</option>
            <option value={100}>Top 100</option>
          </select>
        </label>

        <label>
          Semester
          <select
            value={selectedSemester}
            onChange={(e) => {
              const semId =
                e.target.value === "All" ? "All" : Number(e.target.value);
              setSelectedSemester(semId);
              handleFilterChange(limit, semId);
            }}
            className="ml-2 border rounded px-2 py-1"
          >
            <option value="All">All</option>
            {semesters.map((sem) => (
              <option key={sem.id} value={sem.id}>
                {sem.name} ({sem.school_year})
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Table */}
      <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded mt-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
            <thead>
              <tr className="bg-purple-900 text-white border-b">
                {["Name & Email", "Course & Year", "Borrowed Times"].map(
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center p-4 text-gray-600"
                  >
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
    </AppLayout>
  );
}
