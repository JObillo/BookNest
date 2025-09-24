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

export default function TopBorrowers() {
  const { borrowers: backendBorrowers = [] } = usePage<{ borrowers: Borrower[] }>().props;

  // States
  const [limit, setLimit] = useState(10);
  const [range, setRange] = useState("month");
  const [currentPage, setCurrentPage] = useState(1);

  // Whenever filters change, request backend
  const handleFilterChange = (newLimit: number, newRange: string) => {
    router.get(
      "/reports/top-borrowers",
      {
        limit: newLimit,
        range: newRange,
      },
      { preserveState: true, replace: true }
    );
  };

  // Pagination
  const borrowersPerPage = limit;
  const totalPages = Math.ceil(backendBorrowers.length / borrowersPerPage);
  const startIndex = (currentPage - 1) * borrowersPerPage;
  const endIndex = startIndex + borrowersPerPage;
  const displayedBorrowers = backendBorrowers.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [backendBorrowers, limit, range]);

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
              handleFilterChange(newLimit, range);
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
          Range
          <select
            value={range}
            onChange={(e) => {
              const newRange = e.target.value;
              setRange(newRange);
              handleFilterChange(limit, newRange);
            }}
            className="ml-2 border rounded px-2 py-1"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="semester">Semester</option>
          </select>
        </label>
      </div>

      {/* Table */}
      <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded mt-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
            <thead>
              <tr className="bg-purple-900 text-white border-b">
                {["Name & Email", "Course & Year", "Borrowed Times"].map((header) => (
                  <th key={header} className="border p-3 text-left">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedBorrowers.length ? (
                displayedBorrowers.map((item) => (
                  <tr key={item.patron?.id} className="border-b hover:bg-gray-100">
                    {/* <td className="p-3">
                      {item.student?.profile_picture ? (
                        <img src={item.student.profile_picture} alt={item.student.name} className="w-16 h-16 object-cover rounded-full shadow" />
                      ) : (
                        <span className="text-gray-500">No Photo</span>
                      )}
                    </td> */}
                    <td className="p-3">
                      <div className="font-semibold">{item.patron?.name}</div>
                      <div className="text-sm text-gray-600">{item.patron?.email}</div>
                      <div className="text-sm text-gray-400">{item.patron?.patron_type}</div>
                    </td>
                    <td className="p-3">
                      {item.patron?.course} — {item.patron?.year}
                    </td>
                    <td className="p-3 text-purple-700 font-semibold">{item.borrow_count} Times</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-600">No borrowers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 px-4 py-3 text-sm text-gray-700 cursor-pointer">
          <span>
            Page {currentPage} — {displayedBorrowers.length} borrower{displayedBorrowers.length !== 1 && "s"} on this page
          </span>

          <div className="flex items-center gap-1">
            <button
              className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="px-3 py-1 bg-purple-700 text-white rounded">{currentPage}</span>

            <button
              className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
