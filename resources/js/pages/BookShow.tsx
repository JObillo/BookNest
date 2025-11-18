import { Head, usePage, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { IoMdArrowRoundBack } from 'react-icons/io';
import { useState } from "react";

type BookCopy = {
  id: number;
  accession_number: string;
  status: string;
};

export default function BookShow() {
  const { book } = usePage<{ book: any }>().props;

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null);

  const { post, data, setData, processing } = useForm({
    status: "",
  });

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
            className="w-50 h-76 object-cover rounded-lg shadow"
          />

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{book.title}</h2>
            <p className="text-gray-600">by {book.author}</p>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Publisher:</strong> {book.publisher}</p>
              <p><strong>ISBN:</strong> {book.isbn}</p>
              <p><strong>Copyright Year:</strong> {book.year || "N/A"}</p>
              <p><strong>Place of Publication:</strong> {book.publication_place || "N/A"}</p>
              <p><strong>Section:</strong> {book.section?.section_name || "N/A"}</p>
              <p><strong>Call Number:</strong> {book.call_number || "N/A"}</p>
              <p><strong>Dewey:</strong> {book.dewey_relation?.dewey_classification || "N/A"}</p>
              <p><strong>Subject:</strong> {book.subject || "N/A"}</p>
              <p><strong>Date Purchase:</strong> {book.date_purchase || "N/A"}</p>
              <p><strong>Book Price:</strong> {book.book_price || "N/A"}</p>
              <p><strong>Other info:</strong> {book.other_info || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Copies Table */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold text-gray-800">Book Copies</h3>

            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-purple-800 text-white inline-flex items-center gap-2 font-bold rounded-lg hover:bg-purple-900 transform hover:scale-105 transition"
            >
              <IoMdArrowRoundBack /> Back
            </button>
          </div>

          {book.copies.length ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white text-black shadow-md rounded-lg">
                <thead>
                  <tr className="bg-purple-900 text-white">
                    <th className="p-3 text-left border">#</th>
                    <th className="p-3 text-left border">Accession Number</th>
                    <th className="p-3 text-left border">Status</th>
                    <th className="p-3 text-left border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {book.copies.map((copy: BookCopy, index: number) => (
                    <tr key={copy.id} className="border-b hover:bg-gray-100 transition">
                      <td className="p-3 border">{index + 1}</td>
                      <td className="p-3 border font-medium">{copy.accession_number}</td>
                      <td className="p-3 border">
                        <span
                          className={`font-semibold ${
                            copy.status === "Available" ? "text-green-600" :
                            copy.status === "Borrowed" ? "text-yellow-600" :
                            copy.status === "Reserve" ? "text-gray-500" :
                            copy.status === "Lost" ? "text-red-600" :
                            copy.status === "Damaged" ? "text-orange-600" :
                            copy.status === "Old" ? "text-blue-600" :
                            "text-gray-600"
                          }`}
                        >
                          {copy.status}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button
                          className="bg-red-600 hover:bg-red-700 text-sm text-white px-3 py-1 rounded"
                          onClick={() => {
                            setSelectedCopy(copy);
                            setShowArchiveModal(true);
                          }}
                        >
                          Archive
                        </button>
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

      {/* Archive Modal */}
      {showArchiveModal && selectedCopy && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-xl font-semibold mb-4">Archive Book Copy</h3>

            <p className="text-gray-600 mb-2">
              Accession Number: <strong className="ml-1">{selectedCopy.accession_number}</strong>
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Archive Reason</label>

            <select
              className="w-full border rounded p-2 mb-4"
              value={data.status}
              onChange={(e) => setData("status", e.target.value)}
            >
              <option value="">Select status</option>
              <option value="Lost">Lost</option>
              <option value="Damaged">Damaged</option>
              <option value="Old">Old</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowArchiveModal(false)}
                className="w-full md:w-auto py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>

              <button
                disabled={processing || !data.status}
                onClick={() =>
                  post(route("bookCopies.archive", selectedCopy.id), {
                    onSuccess: () => setShowArchiveModal(false),
                  })
                }
                className="w-full md:w-auto py-2 px-6 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
