import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import BookModal from "@/components/BookModal"; 
import AppLayout from "@/layouts/app-layout";
import {Toaster, toast} from "sonner";

type Book = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  book_copies: number;
  call_number: string;
  book_cover?: string;
};

export default function Books() {
  const { books } = usePage<{ books: Book[] }>().props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const openModal = (book: Book | null = null) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    // if (!confirm("Are you sure you want to delete this book?")) return;
    router.delete(`/books/${id}`, {
      onSuccess: () => {
        toast.success("Book deleted successfully.");
        router.reload();
    },
      onError: () => {
        toast.success("Failed to Delete.");

        console.error("Failed to delete book.")
    },
    });
  };

  return (
    <AppLayout>
      <Head title="Books" />
      <Toaster position="top-right" richColors/>

      <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded">
        <div className="flex justify-end">
          <button
            onClick={() => openModal()}
            className="bg-green-600 text-white rounded px-3 py-1 text-sm hover:bg-green-700 transition"
          >
            Add Book
          </button>
        </div>

        <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
          <thead>
            <tr className="bg-purple-900 text-white border-b">
              {[
                "Book Cover",
                "Title",
                "Author",
                "ISBN",
                "Publisher",
                "Book Copies",
                "Call Number",
                "Actions",
              ].map((header) => (
                <th key={header} className="border p-3 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {books.length ? (
              books.map((book) => (
                <tr key={book.id} className="border-b">
                  <td className="p-3">
                    {book.book_cover ? (
                      <img
                        src={book.book_cover}
                        alt="Book Cover"
                        className="w-35 h-45 object-cover"
                      />
                    ) : (
                      "No Cover"
                    )}
                  </td>
                  <td className="p-3">{book.title}</td>
                  <td className="p-3">{book.author}</td>
                  <td className="p-3">{book.isbn}</td>
                  <td className="p-3">{book.publisher}</td>
                  <td className="p-3">{book.book_copies}</td>
                  <td className="p-3">{book.call_number}</td>

                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => openModal(book)}
                      className="bg-blue-500 text-sm text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="bg-red-500 text-sm text-white px-3 py-1 rounded"
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

      <BookModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        book={selectedBook}
      />
    </AppLayout>
  );
}
