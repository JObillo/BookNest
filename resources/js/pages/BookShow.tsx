import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";

export default function BookShow() {
  const { book } = usePage<{ book: any }>().props;

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Books", href: "/books" },
        { title: book.title, href: "#" },
      ]}
    >
      <Head title={`Book — ${book.title}`} />

      <div className="p-6 bg-white rounded-lg shadow-lg text-black space-y-8">
        {/* Header Info */}
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={book.book_cover || "/placeholder.jpg"}
            alt="Book Cover"
            className="w-40 h-56 object-cover rounded-lg shadow"
          />

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{book.title}</h2>
            <p className="text-gray-600">by {book.author}</p>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <strong>Publisher:</strong> {book.publisher}
              </p>
              <p>
                <strong>ISBN:</strong> {book.isbn}
              </p>
              <p>
                <strong>Section:</strong> {book.section?.section_name || "N/A"}
              </p>
              <p>
                <strong>Dewey:</strong>{" "}
                {book.dewey_relation?.dewey_classification || "N/A"}
              </p>
              <p>
                <strong>Subject:</strong> {book.subject || "N/A"}
              </p>
              <p>
                <strong>Year:</strong> {book.year || "N/A"}
              </p>
              <p>
                <strong>Place of Publication:</strong>{" "}
                {book.publication_place || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Copies Table */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold text-gray-800">
              Book Copies
            </h3>
            <a
              href="/books"
              className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition"
            >
              ← Back to Books
            </a>
          </div>

          {book.copies.length ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white text-black shadow-md rounded-lg">
                <thead>
                  <tr className="bg-purple-900 text-white">
                    <th className="p-3 text-left border">#</th>
                    <th className="p-3 text-left border">Accession Number</th>
                    <th className="p-3 text-left border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {book.copies.map((copy: any, index: number) => (
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
                              : "text-red-600"
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
    </AppLayout>
  );
}
