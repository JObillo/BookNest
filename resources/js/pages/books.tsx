import { useEffect, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import BookModal from "@/components/BookModal";
import AppLayout from "@/layouts/app-layout";
import { Toaster, toast } from "sonner";
import { BreadcrumbItem } from "@/types";
import { Input } from "@/components/ui/input";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Books',
        href: '/books',
    },
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
  description?:string;
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

  //pagination and search
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  const booksPerPage = 5;
    const filteredBooks = books.filter((book) =>
      (book.title + book.isbn).toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {/* Search Bar on the Left */}
        <div>
          <Input
            className="border rounded px-2 py-1 w-100"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>


          <button
            onClick={() => openModal()}
            className="bg-green-600 text-white rounded px-3 py-1 text-sm hover:bg-green-700 transition cursor-pointer"
          >
            Add Book
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
  <thead>
    <tr className="bg-purple-900 text-white border-b">
      {[
        "Book Cover",
        "Book Title",
        // "Description",
        "Author",
        "Publisher",
        "Catalog Info",
        "Book Copies",
        "Actions",
      ].map((header) => (
        <th key={header} className="border p-3 text-left">
          {header}
        </th>
      ))}
    </tr>
  </thead>
  <tbody>
    {displayedBooks.length ? (
      displayedBooks.map((book) => (
        <tr key={book.id} className="border-b hover:bg-gray-100">
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
            <div className="text-sm text-gray-600">ISBN: {book.isbn}</div>
          </td>
          {/* <td className="p-3 text-gray-800">
            Description content
            {book.description ? (
              <p className="text-justify">{book.description}</p>
            ) : (
              <span className="text-gray-500 italic">No description available</span>
            )}
          </td> */}
          <td className="p-3">{book.author}</td>
          <td className="p-3">{book.publisher}</td>
          <td className="p-3 text-sm text-gray-800">
            <div>Accession #: {book.accession_number}</div>
            <div>Call #: {book.call_number}</div>
            <div>Year: {book.year?.toString() || "N/A"}</div>
            <div>Place: {book.publication_place}</div>
          </td>
          <td className="p-3 text-sm text-gray-800">
            <div>Copies: {book.book_copies}</div>
            <div>Available: {book.copies_available}</div>
            <div>Status: {book.copies_available > 1 ? 'Available' : 'Not Available'}</div>
          </td>
          <td className="p-3 flex gap-2">
            <button
              onClick={() => openModal(book)}
              className="bg-blue-500 hover:bg-blue-600 text-sm text-white px-3 py-1 rounded cursor-pointer"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(book.id!)}
              className="bg-red-500 hover:bg-red-600 text-sm text-white px-3 py-1 rounded cursor-pointer"
            >
              Delete
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


//original code 3 working