import { Input } from '@/components/ui/input';
import { Select } from '@headlessui/react';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useMemo } from "react";
import { FaHome } from 'react-icons/fa';
import Fuse from "fuse.js";
import type { FuseResult, FuseResultMatch } from "fuse.js";
import { Search, X } from "lucide-react";

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
  const [tempSearch, setTempSearch] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>(''); 
  const [searchFilter, setSearchFilter] = useState<string>('All'); 
  const [currentPage, setCurrentPage] = useState(1);

  const [startYear, setStartYear] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const [tempStartYear, setTempStartYear] = useState<number | null>(null);
  const [tempEndYear, setTempEndYear] = useState<number | null>(null);

  // Apply search when Enter is pressed
  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(tempSearch.trim());
    }
  };

  // Apply year filter on Enter
  const handleYearKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setStartYear(tempStartYear);
      setEndYear(tempEndYear);
    }
  };

  const clearYearFilter = () => {
    setTempStartYear(null);
    setTempEndYear(null);
    setStartYear(null);
    setEndYear(null);
  };

  useEffect(() => {
    if (tempSearch === "") {
      setSearchTerm("");
    }
  }, [tempSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchFilter, startYear, endYear]);

  const parseYear = (y?: number | string): number | undefined => {
    if (!y) return undefined;
    const n = typeof y === "number" ? y : parseInt(String(y), 10);
    return Number.isFinite(n) ? n : undefined;
  };

  const fuse = useMemo(() => {
    return new Fuse(books, {
      includeScore: true,
      includeMatches: true,
      threshold: 0.3,
      keys: ["title", "author", "subject"],
    });
  }, [books]);

  const fuzzySearchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return books.map((b, index) => ({ item: b, matches: [], refIndex: index } as FuseResult<typeof b>));
    }
    return fuse.search(searchTerm);
  }, [searchTerm, fuse, books]);

  const filteredFuzzyBooks = useMemo(() => {
    return fuzzySearchResults
      .map(r => r.item)
      .filter(book => {
        const y = parseYear(book.year);
        const matchesYear =
          (startYear === null || (y && y >= startYear)) &&
          (endYear === null || (y && y <= endYear));
        return matchesYear && book.is_active !== 0;
      });
  }, [fuzzySearchResults, startYear, endYear]);

  const highlightMatchWithFuse = (
    text: string,
    matches: readonly FuseResultMatch[] | undefined,
    key: string
  ) => {
    if (!matches || matches.length === 0) return text;
    const match = matches.find((m) => m.key === key);
    if (!match || !match.indices) return text;

    let result: React.ReactNode[] = [];
    let lastIndex = 0;

    match.indices.forEach(([start, end], i) => {
      if (start > lastIndex) result.push(text.slice(lastIndex, start));
      result.push(
        <mark key={i} className="bg-purple-300 text-black rounded px-1">
          {text.slice(start, end + 1)}
        </mark>
      );
      lastIndex = end + 1;
    });

    if (lastIndex < text.length) result.push(text.slice(lastIndex));
    return result;
  };

  const booksPerPage = 5;
  const totalPages = Math.ceil(filteredFuzzyBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const displayedBooks = filteredFuzzyBooks.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [filteredFuzzyBooks, totalPages, currentPage]);

  return (
    <>
      <Head title={`Books in ${section.section_name}`} />
      <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900 p-4 sm:p-6">
        {/* Header */}
        <header className="fixed top-0 left-0 z-50 w-full flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-4 bg-white shadow-md">
          <img src="/philcstlogo.png" alt="Library Logo" className="h-10" />
        </header>

        {/* Welcome Text */}
        <div className="text-center mt-24">
          <h1 className="lilitaOneFont text-purple-900 text-2xl sm:text-3xl font-bold">
            Welcome to Online Public Access Catalog
          </h1>
          <p className="lilitaOneFont text-purple-900 text-md sm:text-lg font-semibold">
            PhilCST Library: Your Gateway to Knowledge and Discovery
          </p>
        </div>

        {/* Section Name */}
        <div className="mt-20 px-2 sm:px-6">
          <h1 className="font-bold text-2xl royalPurple text-left">
            Books in {section.section_name}
          </h1>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-start gap-3 mt-4 px-2 sm:px-6 flex-wrap sm:flex-nowrap">
          <Link
            href={route("home")}
            className="px-4 py-2 bg-purple-900 text-white inline-flex items-center gap-2 font-bold rounded-lg hover:bg-purple-900 transform hover:scale-105 transition"
            title="Back to Home"
          >
            <FaHome /> Home
          </Link>

          {/* SEARCH INPUT */}
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

          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder={`Search by ${searchFilter.toLowerCase()}...`}
              className="border border-black rounded px-2 py-2 shadow-sm focus:outline-none focus:ring focus:border-black w-150 pr-10"
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
              onKeyDown={handleSearchEnter}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600 hover:text-gray-900">
              {tempSearch ? (
                <X size={18} onClick={() => { setTempSearch(""); setSearchTerm(""); }} />
              ) : (
                <Search size={18} onClick={() => setSearchTerm(tempSearch.trim())} />
              )}
            </div>
          </div>

          {/* Year filters */}
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
          />

          <button
            onClick={clearYearFilter}
            className="bg-gray-300 text-gray-800 px-3 py-2 rounded hover:bg-gray-400 transition"
          >
            Clear
          </button>
        </div>

        {/* Table */}
        <div className="mt-6 w-full px-2 sm:px-6 overflow-x-auto">
          <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
            <thead>
              <tr className="bg-purple-900 text-white border-b">
                {["Book Cover", "Book", "Author", "Publisher", "Catalog Info", "Status"].map(
                  (header, index) => (
                    <th key={header} className={`border p-3 text-left ${index === 0 || index === 3 ? "hidden lg:table-cell" : ""}`}>{header}</th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {displayedBooks.length ? (
                displayedBooks.map((book) => {
                  const resultForBook = fuzzySearchResults.find(r => r.item.id === book.id);
                  return (
                    <tr key={book.id} className="border-b hover:bg-gray-100">
                      <td className="p-3 hidden lg:table-cell">
                        <Link href={route("books.publicShow", { book: book.id })}>
                          {book.book_cover ? (
                            <img src={book.book_cover} alt="Book Cover" className="w-20 h-28 object-cover rounded shadow" />
                          ) : <span className="text-gray-500">No Cover</span>}
                        </Link>
                      </td>

                      <td className="p-3">
                        <Link href={route("books.publicShow", { book: book.id })}>
                          <div className="font-semibold">
                            {highlightMatchWithFuse(book.title, resultForBook?.matches, "title")}
                          </div>
                          <div className="text-sm text-gray-600">ISBN: {book.isbn}</div>
                        </Link>
                      </td>

                      <td className="p-3">{highlightMatchWithFuse(book.author, resultForBook?.matches, "author")}</td>
                      <td className="p-3 hidden lg:table-cell">{highlightMatchWithFuse(book.subject || "", resultForBook?.matches, "subject")}</td>

                      <td className="p-3 text-sm text-gray-800 hidden lg:table-cell">
                        <div>Accession #: {book.accession_number}</div>
                        <div>Call #: {book.call_number}</div>
                        <div>Year: {book.year?.toString() || "N/A"}</div>
                        <div>Place: {book.publication_place}</div>
                      </td>

                      <td className={`p-3 font-medium ${book.status === "Available" ? "text-green-600" : "text-red-600"}`}>
                        {book.status}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">No books found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 px-4 py-3 text-sm text-gray-700">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>«</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 border rounded hover:bg-gray-200 ${page === currentPage ? "bg-purple-700 text-white" : ""}`}>{page}</button>
            ))}
            <button className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>»</button>
          </div>
        </div>
      </div>
    </>
  );
}
