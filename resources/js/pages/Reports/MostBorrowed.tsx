import { useEffect, useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Toaster } from "sonner";
import { type BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Report - Most Borrowed Books", href: "/reports/most-borrowed" },
];

export type Book = {
  book?: {
    id?: number;
    title?: string;
    author?: string;
    publisher?: string;
    accession_number?: string;
    call_number?: string;
    year?: number;
    publication_place?: string;
    book_cover?: string;
    section_id?: number;
  };
  borrow_count?: number;
};

type Section = {
  id: number;
  section_name: string;
};

export default function MostBorrowed() {
  const { books: backendBooks, sections = [] } = usePage<{
    books: Book[];
    sections: Section[];
  }>().props;

  // Filters
  const [limit, setLimit] = useState(10);
  const [range, setRange] = useState("month");
  const [category, setCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Handle filters
  const handleFilterChange = (newLimit: number, newRange: string, newCategory: string) => {
    router.get(
      "/reports/most-borrowed",
      { limit: newLimit, range: newRange, category: newCategory },
      { preserveState: true, replace: true }
    );
  };

  // Pagination
  const booksPerPage = limit;
  const totalPages = Math.ceil(backendBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const displayedBooks = backendBooks.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [backendBooks, limit, range, category]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Most Borrowed Books" />
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
              handleFilterChange(newLimit, range, category);
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
              handleFilterChange(limit, newRange, category);
            }}
            className="ml-2 border rounded px-2 py-1"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="semester">Semester</option>
          </select>
        </label>

        <label>
          Category
          <select
            value={category}
            onChange={(e) => {
              const newCategory = e.target.value;
              setCategory(newCategory);
              handleFilterChange(limit, range, newCategory);
            }}
            className="ml-2 border rounded px-2 py-1"
          >
            <option value="All">All</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.section_name}
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
                {["Book Cover", "Title & Author", "Publisher", "Catalog Info", "Borrowed Times"].map(
                  (header) => (
                    <th key={header} className="border p-3 text-left">
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {displayedBooks.length ? (
                displayedBooks.map((item) => (
                  <tr key={item.book?.id} className="border-b hover:bg-gray-100">
                    <td className="p-3">
                      {item.book?.book_cover ? (
                        <img
                          src={item.book.book_cover}
                          alt={item.book.title}
                          className="w-20 h-28 object-cover rounded shadow"
                        />
                      ) : (
                        <span className="text-gray-500">No Cover</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold">{item.book?.title}</div>
                      <div className="text-sm text-gray-600">by {item.book?.author}</div>
                    </td>
                    <td className="p-3">{item.book?.publisher}</td>
                    <td className="p-3 text-sm text-gray-800">
                      <div>Accession #: {item.book?.accession_number}</div>
                      <div>Call #: {item.book?.call_number}</div>
                      <div>Year: {item.book?.year || "N/A"}</div>
                      <div>Place: {item.book?.publication_place}</div>
                    </td>
                    <td className="p-3 text-purple-700 font-semibold">
                      {item.borrow_count} Times
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-600">
                    No borrowed books found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 px-4 py-3 text-sm text-gray-700 cursor-pointer">
          <span>
            Page {currentPage} — {displayedBooks.length} book
            {displayedBooks.length !== 1 && "s"} on this page
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
