import { Input } from '@/components/ui/input';
import { Select } from '@headlessui/react';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useMemo } from "react";
import { FaHome } from 'react-icons/fa';

type Props = {
  section: {
    id: number;
    section_name: string;
  };
  books: {
    id: number;
    title: string;
    author: string;
    isbn: string;
    subject?: string;
    publisher: string;
    status: string;
    is_active: number;
    accession_number: string;
    call_number: string;
    year?: string | number;
    publication_place: string;
    book_cover?: string;
  }[];
};

export default function BySection({ section, books }: Props) {
  const [searchTerm, setSearchTerm] = useState<string>(''); // UPDATED: renamed for consistency
  const [searchFilter, setSearchFilter] = useState<string>('All'); // UPDATED: renamed for consistency
  const [currentPage, setCurrentPage] = useState(1);

  // ADDED: Year filtering states
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const [tempStartYear, setTempStartYear] = useState<number | null>(null);
  const [tempEndYear, setTempEndYear] = useState<number | null>(null);

  // ADDED: Apply year filter on Enter
  const handleYearKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setStartYear(tempStartYear);
      setEndYear(tempEndYear);
    }
  };

  // ADDED: Clear all filters
  const clearYearFilter = () => {
    setTempStartYear(null);
    setTempEndYear(null);
    setStartYear(null);
    setEndYear(null);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchFilter, startYear, endYear]);

  // ADDED: Helper functions (same as Welcome.tsx)
  const parseYear = (y?: number | string): number | undefined => {
    if (!y) return undefined;
    const n = typeof y === "number" ? y : parseInt(String(y), 10);
    return Number.isFinite(n) ? n : undefined;
  };

  const isWithinYearRange = (itemYear?: number | string): boolean => {
    const y = parseYear(itemYear);
    if (startYear === null && endYear === null) return true;
    if (y === undefined) return false;
    if (startYear !== null && y < startYear) return false;
    if (endYear !== null && y > endYear) return false;
    return true;
  };

  // UPDATED: Filtering logic similar to Welcome.tsx
  const filteredBooks = useMemo(() => {
    const lowerQuery = searchTerm.trim().toLowerCase();

    return books.filter((book) => {
      const matchesYear = isWithinYearRange(book.year);
      let matchesSearch = false;

      if (searchFilter === "All") {
        matchesSearch =
          book.title.toLowerCase().includes(lowerQuery) ||
          book.isbn.toLowerCase().includes(lowerQuery) ||
          book.author.toLowerCase().includes(lowerQuery) ||
          (book.subject ?? "").toLowerCase().includes(lowerQuery);
      } else if (searchFilter === "Title") {
        matchesSearch = book.title.toLowerCase().includes(lowerQuery);
      } else if (searchFilter === "Isbn") {
        matchesSearch = book.isbn.toLowerCase().includes(lowerQuery);
      } else if (searchFilter === "Author") {
        matchesSearch = book.author.toLowerCase().includes(lowerQuery);
      } else if (searchFilter === "Subject") {
        matchesSearch = (book.subject ?? "").toLowerCase().includes(lowerQuery);
      }

      const isActive = (book as any).is_active !== 0;

      return matchesSearch && matchesYear && isActive;
    });
  }, [books, searchTerm, searchFilter, startYear, endYear]);

  // Pagination logic remains the same
  const booksPerPage = 5;
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const displayedBooks = filteredBooks.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [filteredBooks, totalPages, currentPage]);

  return (
    <>
      <Head title={`Books in ${section.section_name}`} />
      <div className="p-6">
        {/* Header */}
        <header className="fixed top-0 left-0 z-50 w-full flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-4 bg-white shadow-md">
          <img src="/philcstlogo.png" alt="Library Logo" className="h-10" />
        </header>

        {/* Title Section */}
        <div className="mt-20 text-center">
          <h1 className="lilitaOneFont royalPurple text-2xl sm:text-3xl font-bold">
            Welcome to Online Public Access Catalog
          </h1>
          <p className="lilitaOneFont royalPurple text-md sm:text-lg font-semibold">
            PhilCST Library: Your Gateway to Knowledge and Discovery
          </p>
        </div>

        {/* Section Name */}
        <div className="mt-8 px-2 sm:px-6">
          <h1 className="font-bold text-2xl royalPurple text-left">
            Books in {section.section_name}
          </h1>
        </div>

        {/* UPDATED: Search + Filter controls (same style as Welcome.tsx) */}
        <div className="flex flex-col sm:flex-row items-center justify-start gap-3 mt-4 px-2 sm:px-6 flex-wrap sm:flex-nowrap">
          {/* Home Button */}
          <Link
            href={route("home")}
            className="px-4 py-2 bg-purple-900 text-white inline-flex items-center gap-2 font-bold rounded-lg hover:bg-purple-900 transform hover:scale-105 transition"
            title="Back to Home"
          >
            <FaHome /> Home
          </Link>

          {/* Search Filter Dropdown */}
          <Select
            value={searchFilter}
            onChange={(e: any) => setSearchFilter(e.target.value)}
            className="border border-black rounded px-2 py-2 shadow-sm focus:outline-none focus:ring focus:border-black w-32"
          >
            <option value="All">All</option>
            <option value="Title">Title</option>
            <option value="Isbn">Isbn</option>
            <option value="Author">Author</option>
            <option value="Subject">Subject</option>
          </Select>

          {/* Search Input */}
          <input
            type="text"
            placeholder={`Search by ${searchFilter.toLowerCase()}...`}
            className="border border-black rounded px-2 py-2 shadow-sm focus:outline-none focus:ring focus:border-black w-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* ADDED: Start and End Year inputs */}
          <input
            type="number"
            placeholder="Start Year"
            className="border border-black rounded px-2 py-2 w-24 shadow-sm focus:outline-none focus:ring focus:border-black"
            value={tempStartYear ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d{0,4}$/.test(value)) {
                setTempStartYear(value === "" ? null : parseInt(value, 10));
              }
            }}
            onKeyDown={handleYearKeyPress}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
          />

          <input
            type="number"
            placeholder="End Year"
            className="border border-black rounded px-2 py-2 w-24 shadow-sm focus:outline-none focus:ring focus:border-black"
            value={tempEndYear ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d{0,4}$/.test(value)) {
                setTempEndYear(value === "" ? null : parseInt(value, 10));
              }
            }}
            onKeyDown={handleYearKeyPress}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
          />

          {/* ADDED: Clear Button */}
          <button
            onClick={clearYearFilter}
            className="bg-gray-300 text-gray-800 px-3 py-2 rounded hover:bg-gray-400 transition"
          >
            Clear
          </button>
        </div>

        {/* Table Section (unchanged except year filter works now) */}
        <div className="mt-6 w-full px-2 sm:px-6 overflow-x-auto">
          <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
            <thead>
              <tr className="bg-purple-900 text-white border-b">
                {["Book Cover", "Book", "Author", "Publisher", "Catalog Info", "Status"].map(
                  (header, index) => (
                    <th
                      key={header}
                      className={`border p-3 text-left ${
                        index === 0 || index === 3 ? "hidden lg:table-cell" : ""
                      }`}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {displayedBooks.length ? (
                displayedBooks.map((book) => (
                  <tr key={book.id} className="border-b hover:bg-gray-100">
                    <td className="p-3 hidden lg:table-cell">
                      <Link href={route("books.publicShow", { book: book.id })}>
                        {book.book_cover ? (
                          <img
                            src={book.book_cover}
                            alt="Book Cover"
                            className="w-20 h-28 object-cover rounded shadow"
                          />
                        ) : (
                          <span className="text-gray-500">No Cover</span>
                        )}
                      </Link>
                    </td>

                    <td className="p-3">
                      <Link href={route("books.publicShow", { book: book.id })}>
                        <div className="font-semibold">{book.title}</div>
                        <div className="text-sm text-gray-600">ISBN: {book.isbn}</div>
                      </Link>
                    </td>

                    <td className="p-3">{book.author}</td>
                    <td className="p-3 hidden lg:table-cell">{book.publisher}</td>

                    <td className="p-3 text-sm text-gray-800 hidden lg:table-cell">
                      <div>Accession #: {book.accession_number}</div>
                      <div>Call #: {book.call_number}</div>
                      <div>Year: {book.year?.toString() || "N/A"}</div>
                      <div>Place: {book.publication_place}</div>
                    </td>

                    <td
                      className={`p-3 font-medium ${
                        book.status === "Available" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {book.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">
                    No books found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 px-4 py-3 text-sm text-gray-700">
        <span>
          Page {currentPage} of {totalPages} — {displayedBooks.length} book
          {displayedBooks.length !== 1 && "s"} on this page
        </span>

        <div className="flex items-center gap-1">
          {/* Previous Arrow */}
          <button
            className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            «
          </button>

          {/* Numeric Page Buttons */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded hover:bg-gray-200 ${
                page === currentPage ? "bg-purple-700 text-white" : ""
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Arrow */}
          <button
            className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
          
      </div>
    </>
  );
}
