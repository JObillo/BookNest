import React, { useState } from "react";
import axios from "axios";
import { Dialog } from "@headlessui/react";
import { useForm, router } from "@inertiajs/react";

export default function IssueBookModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [patron, setPatron] = useState<any>(null);
  const [book, setBook] = useState<any>(null);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  const { data, setData, post, processing, reset, errors } = useForm({
    school_id: "",
    isbn: "",
    due_date: "",
  });

  // Fetch patron by school_id
  const fetchPatron = async () => {
    try {
      const res = await axios.get(`/patrons/school/${data.school_id}`);
      setPatron(res.data);
      setDuplicateWarning(false); // reset warning on patron change
    } catch {
      setPatron(null);
    }
  };

  // Fetch book by ISBN
  const fetchBook = async () => {
    if (!data.isbn.trim()) return;
    try {
      const res = await axios.get(`/books/isbn/${data.isbn}`);
      setBook(res.data);
      setDuplicateWarning(false); // reset warning on book change
    } catch {
      setBook(null);
    }
  };

  // Check if the patron already has this book issued
  const checkDuplicateIssue = async () => {
    if (!patron || !book) return false;
    try {
      const res = await axios.get(`/issuedbooks/check/${patron.school_id}/${book.isbn}`);
      return res.data.exists;
    } catch (error) {
      console.error("Error checking duplicate issue", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isDuplicate = await checkDuplicateIssue();
    if (isDuplicate) {
      setDuplicateWarning(true);
      return;
    }

    post("/issuedbooks", {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setPatron(null);
        setBook(null);
        setDuplicateWarning(false);
        onClose();
        router.reload({ only: ['issuedbooks'] });
      },
    });
  };

  const renderPatronInfo = (patron: any) => {
    switch (patron.patron_type) {
      case "Student":
        return (
          <>
            <p><strong>School ID:</strong> {patron.school_id}</p>
            <p><strong>Department:</strong> {patron.department || "—"}</p>
            <p><strong>Course:</strong> {patron.course || "—"}</p>
            <p><strong>Year:</strong> {patron.year || "—"}</p>
          </>
        );
      case "Faculty":
        return (
          <>
            <p><strong>School ID:</strong> {patron.school_id}</p>
            <p><strong>Department:</strong> {patron.department || "—"}</p>
          </>
        );
      case "Guest":
        return (
          <>
            <p><strong>Guest ID:</strong> {patron.school_id}</p>
            <p><strong>Contact:</strong> {patron.contact_number || "—"}</p>
            <p><strong>Address:</strong> {patron.address || "—"}</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 p-4 overflow-y-auto bg-black/30">
      <div className="max-w-xl mx-auto mt-20 bg-white rounded-2xl shadow p-6 space-y-4">
        <Dialog.Title className="text-xl font-bold">Issue Book</Dialog.Title>

        {/* Validation errors */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {Object.entries(errors).map(([field, msg]) => (
              <p key={field}>{msg}</p>
            ))}
          </div>
        )}

        {/* Duplicate warning */}
        {duplicateWarning && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            This patron already has this book issued. Cannot borrow again until returned.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>School ID:</label>
            <input
              type="text"
              value={data.school_id}
              onChange={(e) => setData("school_id", e.target.value)}
              onBlur={fetchPatron}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {patron && (
            <div className="text-sm p-2 bg-gray-100 rounded">
              <p><strong>Name:</strong> {patron.name}</p>
              {renderPatronInfo(patron)}
              <p><strong>Type:</strong> {patron.patron_type}</p>
            </div>
          )}

          <div>
            <label>ISBN:</label>
            <input
              type="text"
              value={data.isbn}
              onChange={(e) => setData("isbn", e.target.value)}
              onBlur={fetchBook}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {book && (
            <div className="text-sm p-2 bg-gray-100 rounded">
              <p><strong>Title:</strong> {book.title}</p>
              <p><strong>Author:</strong> {book.author}</p>
              <p><strong>Publisher:</strong> {book.publisher}</p>
              <p><strong>ACC:</strong> {book.accession_number}</p>
              <p><strong>Call no:</strong> {book.call_number}</p>
              <p><strong>Year:</strong> {book.year}</p>
              <p><strong>Pub Place:</strong> {book.publication_place}</p>
              <p><strong>Copies Available:</strong> {book.copies_available}</p>
              <p><strong>Status:</strong> {book.status}</p>
            </div>
          )}

          <div>
            <label>Due Date:</label>
            <input
              type="date"
              value={data.due_date}
              onChange={(e) => setData("due_date", e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 cursor-pointer"
            >
              {processing ? "Issuing..." : "Issue Book"}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
