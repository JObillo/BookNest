import { Head, Link, usePage } from "@inertiajs/react";
import { FaHome } from "react-icons/fa";

export type Book = {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  publisher: string;
  publication_place?: string;
  year?: string;
  accession_number?: string;
  call_number?: string;
  section_id?: number;
  section?: {id: number; section_name: string};
  dewey_id?: number;
  dewey?: string;
  dewey_relation?: { id: number; dewey_classification: string } | null;
  subject?: string;
  book_copies?: number;
  copies_available?: number;
  status: string;
  book_cover?: string;
};

export default function BookDetail() {
  const { props } = usePage<{ book: Book }>();
  const { book } = props;

  return (
    <>
      <Head title={book.title} />

      <div className="min-h-screen bg-gray-100 p-6">
        <header className="fixed top-0 left-0 z-50 w-full flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-4 bg-white shadow-md">
          <img src="/philcstlogo.png" alt="Library Logo" className="h-10" />
        </header>

        <div className="max-w-5xl mx-auto bg-white rounded shadow p-6 mt-20">
          <Link
            href={route("home")}
            className="text-black text-xl sm:text-2xl hover:text-purple-900 inline-flex items-center gap-2 font-bold"
          >
            <FaHome /> Home
          </Link>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-8">{book.title}</h1>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Cover + Status */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <img
                src={book.book_cover || "/placeholder-book.png"}
                alt={book.title}
                className="w-60 h-80 object-cover rounded border"
              />
              <div className="mt-4 text-center">
                <p className="font-semibold">Status</p>
                <p
                  className={`font-medium ${
                    book.status === "Available" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {book.status}
                </p>
                <p className="text-sm mt-1">
                  Copies Available: {book.copies_available ?? "N/A"}
                </p>
                <p className="text-sm">
                  Total Copies: {book.book_copies ?? "N/A"}
                </p>
              </div>
            </div>

            {/* Right: Details */}
            <div className="w-full md:w-2/3 space-y-2 text-gray-900">
              {[
                { label: "Author", value: book.author },
                { label: "ISBN", value: book.isbn },
                { label: "Publisher", value: book.publisher },
                { label: "Place of publication", value: book.publication_place },
                { label: "Copyright year", value: book.year },
                { label: "Accession Number", value: book.accession_number },
                { label: "Call Number", value: book.call_number },
                { label: "Dewey Decimal Values", value: book.dewey || "N/A" },
                { label: "Dewey Classification", value: book.dewey_relation?.dewey_classification || "N/A" },
                { label: "Section", value: book.section?.section_name || "N/A" },
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
                      <span>{item.value}</span>
                    </div>
                  )
              )}
            </div>
          </div>

          {/* Description */}
          {/* <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Description:</h2>
            {book.description && book.description.trim() !== "" ? (
              <p className="text-justify whitespace-pre-wrap text-gray-800">
                {book.description}
              </p>
            ) : (
              <p className="text-gray-500 italic">
                No description available for this book.
              </p>
            )}
          </div> */}
        </div>
      </div>
    </>
  );
}
