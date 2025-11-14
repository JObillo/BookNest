import { useEffect, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import BookModal from "@/components/BookModal";
import AppLayout from "@/layouts/app-layout";
import { Toaster, toast } from "sonner";
import { BreadcrumbItem } from "@/types";
import { Select } from "@headlessui/react";

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
  const { books, sections, deweys } = usePage<{
    books: Book[];
    sections: Section[];
    deweys: Dewey[];
  }>().props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const openModal = (book: Book | null = null) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  // Delete book
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

  // Search & pagination
  const [searchFilter, setSearchFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sectionFilter, setSectionFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => setCurrentPage(1), [searchTerm, searchFilter, sectionFilter]);

  const booksPerPage = 5;

  const filteredBooks = books.filter((book) => {
    const term = searchTerm.trim().toLowerCase();

    if (sectionFilter !== "All" && book.section?.section_name !== sectionFilter) {
      return false;
    }

    if (!term) return true;

    if (searchFilter === "Title") {
      return book.title.toLowerCase().includes(term);
    } else if (searchFilter === "ISBN") {
      return book.isbn?.toLowerCase().includes(term);
    } else if (searchFilter === "Author") {
      return book.author.toLowerCase().includes(term);
    }

    return (
      book.title.toLowerCase().includes(term) ||
      book.isbn?.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const displayedBooks = filteredBooks.slice(startIndex, endIndex);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Books" />
      <Toaster position="top-right" richColors />

      <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-center">

          {/* Search Filters */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
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

            <input
              type="text"
              placeholder={`Search by ${searchFilter.toLowerCase()}...`}
               className="border border-black rounded px-2 py-2 w-100 shadow-sm focus:outline-none focus:ring focus:border-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

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
          </div>

          <button
            onClick={() => openModal()}
            className="cursor-pointer bg-green-600 text-white font-medium rounded-lg px-5 py-2 shadow-md hover:bg-green-700 transition w-full md:w-auto"
          >
            Add Book
          </button>
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
                displayedBooks.map((book, index) => (
                  <tr key={`${book.id}-${index}`} className="border-b hover:bg-gray-100">

                    {/* Book Cover */}
                    <td className="p-3 hidden sm:table-cell">
                      {book.book_cover ? (
                        <img
                          src={book.book_cover}
                          alt="Book Cover"
                          className="w-30 h-28 object-cover rounded shadow"
                        />
                      ) : (
                        <span className="text-gray-500">No Cover</span>
                      )}
                    </td>

                    {/* Title */}
                    <td className="p-3">
                      <div className="font-semibold">{book.title}</div>
                      <div className="text-sm text-gray-600">ISBN: {book.isbn}</div>
                    </td>

                    {/* Author */}
                    <td className="p-3">{book.author}</td>

                    {/* Publisher */}
                    <td className="p-3 hidden lg:table-cell">{book.publisher}</td>

                    {/* Catalog Info */}
                    <td className="p-3 text-sm text-gray-800 hidden md:table-cell">
                      <div>
                        Accession #:{" "}
                        {book.copies?.length ? book.copies[0].accession_number : "N/A"}
                      </div>
                      <div>Call #: {book.call_number}</div>
                      <div>DDC: {book.dewey}</div>
                      <div>Year: {book.year || "N/A"}</div>
                      <div>Place: {book.publication_place}</div>
                    </td>

                    {/* Book Copies */}
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

                    {/* Actions */}
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
                ))
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
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 px-4 py-3 text-sm text-gray-700">
        <span>
          Page {currentPage} — {displayedBooks.length} book
          {displayedBooks.length !== 1 && "s"} on this page
        </span>

        <div className="flex items-center gap-1">
          <button
            className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span className="px-3 py-1 bg-purple-700 text-white rounded">
            {currentPage}
          </span>

          <button
            className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <BookModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        book={selectedBook}
        sections={sections}
        deweys={deweys}
      />
    </AppLayout>
  );
}
