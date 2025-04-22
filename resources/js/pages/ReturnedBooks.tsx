import { router } from '@inertiajs/react';
import { useEffect, useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Toaster, toast } from "sonner";
import ReturnBookModal from "@/components/ReturnBookModal";
import axios from "axios";
import { Input } from '@/components/ui/input';


// Define types for IssuedBook
export type IssuedBook = {
  id: number;
  issued_date?: string;
  due_date?: string;
  status?: string;
  patron: {
    id: number;
    name: string;
    school_id: string;
    course: string | null;
    year: string | null;
    department: string | null;
    patron_type: string;
  };
    book: {
      id: number;
      title: string;
      author: string;
      isbn: string;
      accession_number?: string;
      call_number: string;
      year?: string;
      publication_place?: string;
    };
};

export default function ReturnedBooks() {
  const { issuedbooks } = usePage<{ issuedbooks: IssuedBook[] }>().props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookToReturn, setBookToReturn] = useState<IssuedBook | null>(null);

  // Open modal when returning a book
  const openReturnModal = (book: IssuedBook) => {
    setBookToReturn(book);
    setIsModalOpen(true);
  };

  // Handle returning of the book
  const handleReturnBook = async (bookId: number, issuedId: number) => {
    try {
      // Fetch CSRF token from meta tag in the HTML
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

      // Make the API request to return the book, sending CSRF token in headers
      await axios.put(`/issuedbooks/${issuedId}/return`, {}, {
        headers: {
          'X-CSRF-TOKEN': csrfToken,  // Include CSRF token in the header
        },
      });

      toast.success("Book returned successfully!");
      setIsModalOpen(false);
      setBookToReturn(null);
      router.reload(); // Reload the page to reflect changes
    } catch (error) {
      console.error(error);
      toast.error("Failed to return book.");
    }
  };
  
  //pagination and seach
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
      setCurrentPage(1);
    }, [searchQuery]);
    const booksPerPage = 10;
      const filteredBooks = issuedbooks.filter((issuedbooks) =>
        (issuedbooks.patron.name).toUpperCase().startsWith(searchQuery.toUpperCase())
    );
  
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const displayedBooks = filteredBooks.slice(startIndex, endIndex);



  return (
    <AppLayout>
      <Head title="Returned Books" />
      <Toaster position="top-right" richColors />

      <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded">
        {/* Search Bar on the Left */}
        <div>
          <Input
            className="border rounded px-2 py-1 w-100"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
            <thead>
              <tr className="bg-purple-900 text-white border-b">
                {[
                  "Patron Info",
                  "Book",
                  "Author",
                  "Catalog Info",
                  "Issued Date",
                  "Due Date",
                  "Status",
                  "Action",
                ].map((header) => (
                  <th key={header} className="border p-3 text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedBooks.length > 0 ? (
                displayedBooks.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-200">
                    <td className="p-3">
                      <div className="font-semibold">{record.patron.name}</div>
                      <div className="text-sm text-gray-600">School ID: {record.patron.school_id}</div>
                      <div className="text-sm text-gray-600">{record.patron.course || "N/A"} | {record.patron.year || "N/A"}</div>
                      <div className="text-sm text-gray-600">
                        {record.patron.department || "N/A"} ({record.patron.patron_type})
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold">{record.book.title}</div>
                      <div className="text-sm text-gray-600">ISBN: {record.book.isbn}</div>
                    </td>
                    <td className="p-3">{record.book.author}</td>
                    <td className="p-3 text-sm text-gray-800">
                      <div>Accession #: {record.book.accession_number || "N/A"}</div>
                      <div>Call #: {record.book.call_number || "N/A"}</div>
                      <div>Year: {record.book.year || "N/A"}</div>
                      <div>Place: {record.book.publication_place || "N/A"}</div>
                    </td>
                    <td className="p-3">{record.issued_date || "N/A"}</td>
                    <td className="p-3">{record.due_date || "N/A"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-white text-sm ${
                          record.status === "Issued" ? "bg-yellow-600" : "bg-green-600"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {record.status === "Issued" && (
                        <button
                          onClick={() => openReturnModal(record)}
                          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 cursor-pointer"
                        >
                          Return Book
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center p-4 text-gray-600">
                    Empty.
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

      <ReturnBookModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setBookToReturn(null);
        }}
        onConfirm={() => {
          if (bookToReturn) {
            handleReturnBook(bookToReturn.book.id, bookToReturn.id);
          }
        }}
        bookTitle={bookToReturn?.book.title || ""}
      />
    </AppLayout>
  );
}
