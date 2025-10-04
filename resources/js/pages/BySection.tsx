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
    publisher: string;
    status: string;
    accession_number: string;
    call_number: string;
    year?: string;
    publication_place: string;
    book_cover?: string;
  }[];
};

export default function BySection({ section, books }: Props) {
  // Pagination and search
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchCategory, setSearchCategory] = useState('All'); // default to All

  // Reset to page 1 when query or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchCategory]);

  //  Filter books by search
  const filteredBooks = useMemo(() => {
    const lowerQuery = searchQuery.trim().toLowerCase();

    return books.filter((book) => {
      if (searchCategory === "All") {
        return (
          book.title.toLowerCase().includes(lowerQuery) ||
          book.isbn.toLowerCase().includes(lowerQuery) ||
          book.author.toLowerCase().includes(lowerQuery)
        );
      }

      const value = book[searchCategory as keyof typeof book];
      return (
      typeof value === "string" &&
      value.trim().toLowerCase().includes(lowerQuery)
    );
    });
  }, [books, searchQuery, searchCategory]);

  // Pagination
  const booksPerPage = 5;
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const displayedBooks = filteredBooks.slice(startIndex, endIndex);

  // Adjust current page if out of bounds
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
        <header className="fixed top-0 left-0 z-50 w-full flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-4 bg-white dark:bg-gray-800 shadow-md">
          <img src="/philcstlogo.png" alt="Library Logo" className="h-10" />
        </header>

        {/* Title */}
        <div className="mt-20 text-center">
          <h1 className="lilitaOneFont royalPurple text-2xl sm:text-3xl font-bold">
            Welcome to Online Public Access Catalog
          </h1>
          <p className="lilitaOneFont royalPurple text-md sm:text-lg font-semibold">
            PhilCST Library: Your Gateway to Knowledge and Discovery
          </p>
          <div className="flex items-center space-x-2">
            <Link
              href={route("home")}
              className="text-black text-xl sm:text-2xl hover:text-purple-900"
            >
              <FaHome />
            </Link>
            <h1 className="font-bold text-xl">
              Books in {section.section_name}
            </h1>
          </div>

          {/* Search */}
          <div className="flex items-center justify-between mt-4 px-2 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 px-2 sm:px-6">
              <div className="flex gap-2 w-full sm:w-auto">
                <Select
                  className="border rounded px-2 py-1 text-sm text-gray-700"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="title">Title</option>
                  <option value="author">Author</option>
                  <option value="isbn">ISBN</option>
                </Select>

                <Input
                  className="border rounded px-2 py-1 w-full placeholder-italic"
                  placeholder={`Search by ${searchCategory}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-3 w-full px-2 sm:px-6 overflow-x-auto">
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
                    {/* Book Cover */}
                    <td className="p-3 hidden lg:table-cell">
                      <Link href={route("books.show", { book: book.id })}>
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

                    {/* Title */}
                    <td className="p-3">
                      <Link href={route("books.show", { book: book.id })}>
                        <div className="font-semibold">{book.title}</div>
                        <div className="text-sm text-gray-600">ISBN: {book.isbn}</div>
                      </Link>
                    </td>

                    {/* Author */}
                    <td className="p-3">
                        <a
                          href={`https://www.google.com/search?tbm=bks&q=${encodeURIComponent(book.author)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {book.author}
                        </a>
                      </td>

                    {/* Publisher */}
                    <td className="p-3 hidden lg:table-cell">{book.publisher}</td>

                    {/* Catalog Info */}
                    <td className="p-3 text-sm text-gray-800 hidden lg:table-cell">
                      <div>Accession #: {book.accession_number}</div>
                      <div>Call #: {book.call_number}</div>
                      <div>Year: {book.year?.toString() || "N/A"}</div>
                      <div>Place: {book.publication_place}</div>
                    </td>

                    {/* Status */}
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

          <span className="px-3 py-1 bg-purple-700 text-white rounded">
            {currentPage}
          </span>

          <button
            className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
