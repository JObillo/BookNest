import React, { useState } from "react";
import axios from "axios";
import { Dialog } from "@headlessui/react";
import { useForm } from "@inertiajs/react";
import { router } from '@inertiajs/react';

export default function IssueBookModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [patron, setPatron] = useState<any>(null);
  const [book, setBook] = useState<any>(null);

  const { data, setData, post, processing, reset, errors } = useForm({
    school_id: "",
    isbn: "",
    due_date: "",
  });

  const fetchPatron = async () => {
    try {
      const res = await axios.get(`/patrons/school/${data.school_id}`);
      setPatron(res.data);
    } catch {
      setPatron(null);
    }
  };
  

  const fetchBook = async () => {
    if (!data.isbn.trim()) return;
    try {
      const res = await axios.get(`/books/isbn/${data.isbn}`);
      setBook(res.data);
    } catch {
      setBook(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post("/issuedbooks", {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setPatron(null);
        setBook(null);
        onClose();
        router.reload({ only: ['issuedbooks'] });
      },
      onError: (errors) => {
        console.error("Validation errors:", errors);
        // Optional: show a popup too
        // alert("Validation failed: " + JSON.stringify(errors, null, 2));
      },
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 p-4 overflow-y-auto bg-black/30">
      <div className="max-w-xl mx-auto mt-20 bg-white rounded-2xl shadow p-6 space-y-4">
        <Dialog.Title className="text-xl font-bold">Issue Book</Dialog.Title>

        {/* Global Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {Object.entries(errors).map(([field, msg]) => (
              <p key={field}>{msg}</p>
            ))}
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
            {errors.school_id && <p className="text-sm text-red-500">{errors.school_id}</p>}
          </div>

          {patron && (
            <div className="text-sm p-2 bg-gray-100 rounded">
              <p><strong>Name:</strong> {patron.name}</p>
              <p><strong>Course:</strong> {patron.course || "—"}</p>
              <p><strong>Year:</strong> {patron.year || "—"}</p>
              <p><strong>Department:</strong> {patron.department || "—"}</p>
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
            {errors.isbn && <p className="text-sm text-red-500">{errors.isbn}</p>}
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
            {errors.due_date && <p className="text-sm text-red-500">{errors.due_date}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer">
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


//this is working but no copies a
