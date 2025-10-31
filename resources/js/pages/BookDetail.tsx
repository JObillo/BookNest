import { Head, usePage } from "@inertiajs/react";
import { FaHome } from "react-icons/fa";

export type Book = {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  publisher: string;
  publication_place?: string;
  year?: string;
  call_number?: string;
  section_id?: number;
  section?: { id: number; section_name: string };
  subject?: string;
  book_copies?: number;
  copies_available?: number;
  status: string;
  book_cover?: string;
  copies?: {
    id: number;
    accession_number: string;
    status: string;
  }[];
};

export default function BookDetail() {
  const { props } = usePage<{ book: Book }>();
  const { book } = props;

  return (
    <>
      <Head title={book.title} />

      <div className="min-h-screen bg-gray-100 p-6">
        {/* Header */}
        <header className="fixed top-0 left-0 z-50 w-full flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-4 bg-white shadow-md">
          <img src="/philcstlogo.png" alt="Library Logo" className="h-10" />
        </header>

        {/* Main content */}
        <div className="max-w-5xl mx-auto bg-white rounded shadow p-6 mt-20">
          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-purple-700 text-white inline-flex items-center gap-2 font-bold rounded-lg hover:bg-purple-800 transform hover:scale-105 transition"
          >
             <FaHome /> Home
          </button>

          {/* Book Section */}
          <div className="flex flex-col md:flex-row gap-8 mt-8">
            {/* Left: Book Cover */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <img
                src={book.book_cover || "/placeholder-book.png"}
                alt={book.title}
                className="w-60 h-80 object-cover rounded border shadow-md"
              />
              <div className="mt-4 text-center">
                <p className="font-semibold">Status</p>
                <p
                  className={`font-medium ${
                    book.status === "Available"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {book.status}
                </p>
              </div>
            </div>

            {/* Right: Title + Details */}
            <div className="w-full md:w-2/3 text-gray-900">
              {/* Inline Title beside cover */}
              <h1 className="text-3xl font-bold mb-4 border-b pb-2">
                {book.title}
              </h1>

              {/* Book details */}
              <div className="space-y-2">
                {[
                  { label: "Author", value: book.author },
                  { label: "ISBN", value: book.isbn },
                  { label: "Publisher", value: book.publisher },
                  {
                    label: "Place of publication",
                    value: book.publication_place,
                  },
                  { label: "Copyright year", value: book.year },
                  { label: "Call Number", value: book.call_number },
                  {
                    label: "Section",
                    value: book.section?.section_name || "N/A",
                  },
                  { label: "Subject", value: book.subject || "N/A" },
                ].map(
                  (item) =>
                    item.value && (
                      <div
                        key={item.label}
                        className="flex justify-between border-b py-1"
                      >
                        <span className="font-medium text-gray-700">
                          {item.label}
                        </span>
                        <span className="text-right">{item.value}</span>
                      </div>
                    )
                )}
              </div>
            </div>
          </div>

          {/* Book Copies */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Book Copies
            </h2>

            {book.copies && book.copies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white text-black shadow-md rounded-lg">
                  <thead>
                    <tr className="bg-purple-800 text-white">
                      <th className="p-3 text-left border">#</th>
                      <th className="p-3 text-left border">Accession Number</th>
                      <th className="p-3 text-left border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {book.copies.map((copy, index) => (
                      <tr
                        key={copy.id}
                        className="border-b hover:bg-gray-100 transition"
                      >
                        <td className="p-3 border">{index + 1}</td>
                        <td className="p-3 border font-medium">
                          {copy.accession_number}
                        </td>
                        <td className="p-3 border">
                          <span
                            className={`font-semibold ${
                              copy.status === "Available"
                                ? "text-green-600"
                                : copy.status === "Borrowed"
                                ? "text-yellow-600"
                                : copy.status === "Reserve"
                                ? "text-orange-500"
                                : "text-gray-600"
                            }`}
                          >
                            {copy.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No copies available.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
