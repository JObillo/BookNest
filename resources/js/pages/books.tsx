import { useEffect, useState, useMemo } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import Fuse from "fuse.js";
import BookModal from "@/components/BookModal";
import AppLayout from "@/layouts/app-layout";
import { Toaster, toast } from "sonner";
import { BreadcrumbItem } from "@/types";
import { Select } from "@headlessui/react";
import { Archive, Search, X } from 'lucide-react';
import ImportCSVModal from "@/components/ImportCSVModal";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Manage Books", href: "/books" },
];

export type Book = {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  book_copies: number;
  copies_available: number;
  status: string;
  accession_number?: string;
  call_number: string;
  year?: string;
  publication_place?: string;
  book_cover?: string;
  section_id?: number;
  dewey_id?: number;
  dewey?: string;
  dewey_relation?: { id: number; dewey_classification: string } | null;
  subject?: string;
  date_purchase?: string;
  book_price?: string;
  description?: string;
  section?: { id: number; section_name: string };
  copies?: { id: number; accession_number: string; status: string }[];
};

type Section = {
  id: number;
  section_name: string;
};

type Dewey = {
  id: number;
  dewey_classification: string;
};

export default function Books() {
  const { books, sections, deweys, flash } = usePage<{
    books: Book[];
    sections: Section[];
    deweys: Dewey[];
    flash: {
      success?: string;
      errors_import?: string[];
      duplicate?: string[];
      imported?: number;
    };
  }>().props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [searchFilter, setSearchFilter] = useState<string>("All");
  const [tempSearch, setTempSearch] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sectionFilter, setSectionFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [incompleteFilter, setIncompleteFilter] = useState<boolean>(false);

  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);

  const openModal = (book: Book | null = null) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    router.delete(`/books/${id}`, {
      onSuccess: () => {
        toast.success("Book deleted successfully.");
        router.reload();
      },
      onError: () => {
        toast.error("Failed to delete.");
      },
    });
  };

  // Reset page when filters change
  useEffect(() => setCurrentPage(1), [searchTerm, searchFilter, sectionFilter]);

  // Automatically clear searchTerm if tempSearch is empty
  useEffect(() => {
    if (tempSearch === "") setSearchTerm("");
  }, [tempSearch]);

  // Fuse.js instance for fuzzy search
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
      return books.map((b, index) => ({ item: b, matches: [], refIndex: index } as any));
    }
    return fuse.search(searchTerm);
  }, [searchTerm, fuse, books]);

  // Filter based on section and incomplete filter
  const filteredBooks = useMemo(() => {
    return fuzzySearchResults
      .map(r => r.item)
      .filter(book => {
        if (sectionFilter !== "All" && book.section?.section_name !== sectionFilter) return false;

        if (incompleteFilter) {
          const isIncomplete =
            !book.title ||
            !book.author ||
            !book.isbn ||
            !book.publisher ||
            !book.book_copies ||
            !book.call_number ||
            !book.accession_number ||
            !book.year ||
            !book.publication_place ||
            !book.section_id ||
            !book.dewey_id ||
            !book.subject ||
            !book.date_purchase ||
            !book.book_price ||
            !book.book_cover;
          if (!isIncomplete) return false;
        }

        return true;
      });
  }, [fuzzySearchResults, sectionFilter, incompleteFilter]);

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

  // Highlight only the column that matches current searchFilter
  const highlightMatchWithFuse = (
    text: string,
    matches: readonly any[] | undefined,
    key: string
  ) => {
    if (!matches || matches.length === 0) return text;

    if (searchFilter !== "All" && searchFilter.toLowerCase() !== key.toLowerCase()) {
      return text; // Skip highlighting for other columns
    }

    const match = matches.find((m: any) => m.key === key);
    if (!match || !match.indices) return text;

    let result: React.ReactNode[] = [];
    let lastIndex = 0;

    match.indices.forEach(([start, end]: number[], i: number) => {
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

  // Enter key for search
  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(tempSearch.trim());
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Books" />
      <Toaster position="top-right" richColors />

      <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* Search Filter */}
            <Select
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="border border-black rounded px-2 py-2 shadow-sm"
            >
              <option value="All">All</option>
              <option value="Title">Title</option>
              <option value="ISBN">ISBN</option>
              <option value="Author">Author</option>
            </Select>

            {/* Search Input */}
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder={`Search by ${searchFilter.toLowerCase()}...`}
                className="border border-black rounded px-2 py-2 w-100 shadow-sm focus:outline-none focus:ring focus:border-black pr-10"
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

            {/* Section Filter */}
            <Select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="border border-black rounded px-2 py-2 shadow-sm"
            >
              <option value="All">All Sections</option>
              {sections.map((section, index) => (
                <option key={`${section.id}-${index}`} value={section.section_name}>
                  {section.section_name}
                </option>
              ))}
            </Select>

            {/* Incomplete Filter */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="incompleteFilter"
                checked={incompleteFilter}
                onChange={(e) => setIncompleteFilter(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="incompleteFilter" className="text-sm text-gray-700">
                Show Incomplete Info
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-1">
            <button
              onClick={() => openModal()}
              className="cursor-pointer bg-green-600 text-white font-medium rounded-lg px-5 py-2 shadow-md hover:bg-green-700 transition"
            >
              Add Book
            </button>
            <button
              onClick={() => setIsCSVModalOpen(true)}
              className="cursor-pointer bg-blue-600 text-white font-medium rounded-lg px-5 py-2 shadow-md hover:bg-blue-700 transition w-full md:w-auto"
            >
              Import CSV
            </button>
            <button
              onClick={() => router.get('/books/archived')}
              className="cursor-pointer bg-gray-500 text-white rounded-lg p-2 shadow-md hover:bg-gray-600 transition flex items-center justify-center"
              title="Archived Books"
            >
              <Archive/>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
            <thead>
              <tr className="bg-purple-900 text-white border-b">
                <th className="border p-3 text-left hidden sm:table-cell">Book Cover</th>
                <th className="border p-3 text-left">Book Title</th>
                <th className="border p-3 text-left">Author</th>
                <th className="border p-3 text-left hidden lg:table-cell">Publisher</th>
                <th className="border p-3 text-left hidden md:table-cell">Catalog Info</th>
                <th className="border p-3 text-left hidden md:table-cell">Book Copies</th>
                <th className="border p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {displayedBooks.length ? (
                displayedBooks.map((book, index) => {
                  const resultForBook = fuzzySearchResults.find(r => r.item.id === book.id);
                  return (
                    <tr key={`${book.id}-${index}`} className="border-b hover:bg-gray-100">

                      <td className="p-3 hidden sm:table-cell">
                        {book.book_cover ? (
                          <img
                            src={book.book_cover}
                            alt="Book Cover"
                            className="w-45 h-35 object-cover rounded shadow"
                          />
                        ) : (
                          <span className="text-gray-500">No Cover</span>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="font-semibold">
                          {highlightMatchWithFuse(book.title, resultForBook?.matches, "title")}
                        </div>
                        <div className="text-sm text-gray-600">ISBN: {book.isbn}</div>
                      </td>

                      <td className="p-3">
                        {highlightMatchWithFuse(book.author, resultForBook?.matches, "author")}
                      </td>

                      <td className="p-3 hidden lg:table-cell">{book.publisher_info?.name ?? book.publisher ?? "Unknown"}</td>

                      <td className="p-3 text-sm text-gray-800 hidden md:table-cell">
                        <div>
                          Accession #:{" "}
                          {book.copies?.length ? book.copies[0].accession_number : "N/A"}
                        </div>
                        <div>Call #: {book.call_number}</div>
                        <div>Year: {book.year || "N/A"}</div>
                        <div>Place: {book.publication_place}</div>
                      </td>

                      <td className="p-3 text-sm text-gray-800 hidden md:table-cell">
                        <div>Copies: {book.book_copies}</div>
                        <div>Available: {book.copies_available}</div>
                        <div>
                          Status:{" "}
                          <span
                            className={
                              book.status === "Available"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {book.status}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => openModal(book)}
                          className="bg-blue-500 hover:bg-blue-600 text-sm text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => router.get(`/books/${book.id}`)}
                          className="bg-purple-600 hover:bg-purple-700 text-sm text-white px-3 py-1 rounded"
                        >
                          Show
                        </button>

                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-600">
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
            <button
              className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              «
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
              )
              .map((page, idx, arr) => {
                const prevPage = arr[idx - 1];
                return (
                  <span key={page} className="flex">
                    {prevPage && page - prevPage > 1 && (
                      <span className="px-2 py-1">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded hover:bg-gray-200 ${
                        page === currentPage ? "bg-purple-700 text-white" : ""
                      }`}
                    >
                      {page}
                    </button>
                  </span>
                );
              })}

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

      <BookModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        book={selectedBook}
        sections={sections}
        deweys={deweys}
      />

      <ImportCSVModal
        isOpen={isCSVModalOpen}
        closeModal={() => setIsCSVModalOpen(false)}
        flash={flash}
      />
    </AppLayout>
  );
}
