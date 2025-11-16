import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Toaster } from "sonner";
import { IoMdArrowRoundBack } from 'react-icons/io';

export type Book = {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  book_copies: number;
  copies_available: number;
  status: string;
  book_cover?: string;
  section?: { id: number; section_name: string };
  copies?: { id: number; accession_number: string; status: string }[];
};

export default function ArchivedBooks() {
  const { books } = usePage<{ books: Book[] }>().props;

  return (
    <AppLayout breadcrumbs={[{ title: "Archived Books", href: "/books/archive" }]}>
      <Head title="Archived Books" />
      <Toaster position="top-right" richColors />

      <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded">
        {/* <h2 className="text-2xl font-semibold mb-4">Archived Books</h2> */}
        {/* back button */}
        <div className="flex justify-end">
            <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-purple-800 text-white inline-flex items-center gap-2 font-bold rounded-lg hover:bg-purple-900 transform hover:scale-105 transition"
            >
                <IoMdArrowRoundBack /> Back
            </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
            <thead>
              <tr className="bg-purple-900 text-white border-b">
                <th className="border p-3 text-left">Book Cover</th>
                <th className="border p-3 text-left">Title</th>
                <th className="border p-3 text-left">Author</th>
                <th className="border p-3 text-left">Copies</th>
                <th className="border p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {books.length ? (
                books.map((book, index) => (
                  <tr key={book.id || index} className="border-b hover:bg-gray-100">
                    <td className="p-3">
                      {book.book_cover ? (
                        <img
                          src={book.book_cover}
                          alt="Book Cover"
                          className="w-28 h-40 object-cover rounded shadow"
                        />
                      ) : (
                        <span className="text-gray-500">No Cover</span>
                      )}
                    </td>
                    <td className="p-3">{book.title}</td>
                    <td className="p-3">{book.author}</td>
                    <td className="p-3">{book.copies?.length || 0}</td>
                    <td className="p-3 text-red-600">Archived</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-600">
                    No archived books found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}