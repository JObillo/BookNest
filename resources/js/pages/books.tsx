import { useEffect, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import BookModal from "@/components/BookModal";
import AppLayout from "@/layouts/app-layout";
import { Toaster, toast } from "sonner";
import { BreadcrumbItem } from "@/types";

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
  section?: {id: number; section_name: string};
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchFilter, sectionFilter]);

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
    } else {
      return (
        book.title.toLowerCase().includes(term) ||
        book.isbn?.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term)
      );
    }
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
        <div className="flex justify-between items-center mb-4">
          {/* Search + Section Filter */}
          <div className="flex space-x-2">
            <select
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="border rounded px-2 py-2 shadow-sm focus:outline-none focus:ring focus:border-purple-500"
            >
              <option value="All">All</option>
              <option value="Title">Title</option>
              <option value="ISBN">ISBN</option>
              <option value="Author">Author</option>
            </select>

            <input
              type="text"
              placeholder={`Search by ${searchFilter.toLowerCase()}...`}
              className="border rounded px-2 py-2 w-150 shadow-sm focus:outline-none focus:ring focus:border-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="border rounded px-2 py-2 shadow-sm focus:outline-none focus:ring focus:border-purple-500"
            >
              <option value="All">All Sections</option>
              {sections.map((section, index) => (
                <option key={`${section.id}-${index}`} value={section.section_name}>
                  {section.section_name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => openModal()}
            className="cursor-pointer bg-green-600 text-white font-medium rounded-lg ml-5 px-5 py-2 shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
          >
            Add Book
          </button>
        </div>

        {/* Books Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
            <thead>
              <tr className="bg-purple-900 text-white border-b">
                {[
                  "Book Cover",
                  "Book Title",
                  "Author",
                  "Publisher",
                  "Catalog Info",
                  // "Other Info",
                  "Book Copies",
                  "Actions",
                ].map((header, index) => (
                  <th key={`${header}-${index}`} className="border p-3 text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedBooks.length ? (
                displayedBooks.map((book, index) => (
                  <tr key={`${book.id}-${index}`} className="border-b hover:bg-gray-100">
                    <td className="p-3">
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
                      <div className="text-sm text-gray-600">
                        ISBN: {book.isbn}
                      </div>
                    </td>
                    <td className="p-3">{book.author}</td>
                    <td className="p-3">{book.publisher}</td>
                    <td className="p-3 text-sm text-gray-800">
                      <div>
                        Accession #:{" "}
                        {book.copies?.length ? book.copies[0].accession_number : "N/A"}
                      </div>
                      <div>Call #: {book.call_number}</div>
                      <div>DDC: {book.dewey}</div>
                      <div>Year: {book.year?.toString() || "N/A"}</div>
                      <div>Place: {book.publication_place}</div>
                    </td>
                    {/* <td className="p-3 text-sm text-gray-800">
                      <div>Section: {book.section?.section_name || "N/A"}</div>
                      <div>
                        Dewey Class: {book.dewey_relation?.dewey_classification || "N/A"}
                      </div>
                      <div>Subject #: {book.subject}</div>
                      <div>Date purchase: {book.date_purchase?.toString() || "N/A"}</div>
                      <div>Book Price: {book.book_price}</div>
                    </td> */}
                    <td className="p-3 text-sm text-gray-800">
                      <div>Copies: {book.book_copies}</div>
                      <div>Available: {book.copies_available}</div>
                      <div className="text-gray-800">
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
                        className="bg-blue-500 hover:bg-blue-600 text-sm text-white px-3 py-1 rounded cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => router.get(`/books/${book.id}`)}
                        className="bg-purple-600 hover:bg-purple-700 text-sm text-white px-3 py-1 rounded cursor-pointer"
                      >
                        Show
                      </button>

                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center p-4 text-gray-600">
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
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
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