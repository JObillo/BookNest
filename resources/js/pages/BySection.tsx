import { Input } from '@/components/ui/input';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { useState, useEffect } from "react";
import { FaHome } from 'react-icons/fa'; // Add this import


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
  const [searchCategory, setSearchCategory] = useState('title'); // Added state for search category

  // Reset the page to 1 if search query or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchCategory]);

const filteredBooks = books.filter((book) =>
  book.title.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
  book.isbn.toLowerCase().startsWith(searchQuery.toLowerCase())
);

const booksPerPage = 5;
const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
const startIndex = (currentPage - 1) * booksPerPage;
const endIndex = startIndex + booksPerPage;
const displayedBooks = filteredBooks.slice(startIndex, endIndex);

// Adjust currentPage if the filtered books count is less than the number of items on the current page
useEffect(() => {
  if (currentPage > totalPages) {
    setCurrentPage(totalPages); // Go to the last page if the current page is out of bounds
  }
}, [filteredBooks, totalPages, currentPage]);


  return (
    <>
      <Head title={`Books in ${section.section_name}`} />
      <div className="p-6">
      <header className="fixed top-0 left-0 z-50 w-full flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-4 bg-white dark:bg-gray-800 shadow-md">
          <img
            src="/philcstlogo.png"
            alt="Library Logo"
            className="h-10"
          />
          {/* <div className="space-x-2 sm:space-x-4">
            <Link
              href={route("login")}
              className="text-gray-700 dark:text-gray-300 hover:text-purple-700 text-sm sm:text-base"
            >
              Login
            </Link>
          </div> */}
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

          <div className='flex items-center justify-between mt-4 px-2 sm:px-6'>
          <Input
            className="border rounded px-2 py-1 w-100 placeholder-italic"
            placeholder="Search by Author or ISBN"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          </div>
          
        
        </div>

        {/* <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {books.map((book) => (
            <div key={book.id} className="bg-white border p-3 rounded shadow">
              <img
                src={book.book_cover || "/placeholder-book.png"}
                alt={book.title}
                className="h-40 object-cover w-full rounded"
              />
              <h2 className="text-sm font-semibold mt-2 truncate">{book.title}</h2>
              <p className="text-xs text-gray-500">{book.author}</p>
            </div>
          ))}
        </div> */}

      <div className="mt-3 w-full px-2 sm:px-6 overflow-x-auto">
        <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
      <thead>
      <tr className="bg-purple-900 text-white border-b">
                {[
                  "Book Cover",
                  "Book",
                  "Author",
                  "Publisher",
                  "Catalog Info",
                  "Status",
                ].map((header, index) => (
                  <th
                  key={header}
                  className={`border p-3 text-left ${
                        index === 0 // Book Cover
                      ? "hidden lg:table-cell"  // Hides Book Cover by default, shows on large screens (lg)
                      : index === 3 // Publisher
                      ? "hidden lg:table-cell"  // Hides Publisher by default, shows on large screens (lg)
                      // : index === 5 // Book Copies
                      // ? "hidden lg:table-cell"  // Hides Book Copies by default, shows on large screens (lg)
                      // : index === 6
                      // ? "hidden lg:table-cell"
                      : ""
                      
                  }`}
                >
                  {header}
                </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedBooks.length ? (
                displayedBooks.map((book) => (
                  <tr key={book.id} className="border-b hover:bg-gray-100">
                    <td className="p-3 hidden lg:table-cell">
                      {book.book_cover ? (
                        <img
                          src={book.book_cover}
                          alt="Book Cover"
                          className="w-20 h-28 object-cover rounded shadow"
                        />
                      ) : (
                        <span className="text-gray-500">No Cover</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold">{book.title}</div>
                      <div className="text-sm text-gray-600">ISBN: {book.isbn}</div>
                    </td>
                    <td className="p-3">{book.author}</td>
                    <td className="p-3">{book.publisher}</td>
                    <td className="p-3 text-sm text-gray-800 hidden lg:table-cell">
                      <div>Accession #: {book.accession_number}</div>
                      <div>Call #: {book.call_number}</div>
                      <div>Year: {book.year?.toString() || "N/A"}</div>
                      <div>Place: {book.publication_place}</div>
                    </td>
                    <td className="p-3">{book.status}</td>
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
