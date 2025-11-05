import React, { useState } from "react";
import axios from "axios";
import { Dialog, Input } from "@headlessui/react";
import { useForm, router } from "@inertiajs/react";

export default function IssueBookModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [patron, setPatron] = useState<any>(null);
  const [book, setBook] = useState<any>(null);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [loadingField, setLoadingField] = useState<"school_id" | "isbn" | null>(null);
  const [notFound, setNotFound] = useState({ school_id: false, isbn: false });

  const { data, setData, post, processing, reset, errors } = useForm({
    school_id: "",
    isbn: "",
    accession_number: "",
    due_date: "",
  });

  /** SCHOOL ID HANDLER — numeric only and max 5 */
  const handleSchoolIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits
    if (value.length <= 5) setData("school_id", value);
  };

  /** ISBN HANDLER — auto format to 111-1-11111-111-1 (ISBN-13) */
  const handleIsbnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, "").slice(0, 13); // Keep only 13 digits max
    let formatted = "";

    // Format dynamically
    if (digits.length > 0) formatted += digits.substring(0, 3);
    if (digits.length > 3) formatted += "-" + digits.substring(3, 4);
    if (digits.length > 4) formatted += "-" + digits.substring(4, 9);
    if (digits.length > 9) formatted += "-" + digits.substring(9, 12);
    if (digits.length > 12) formatted += "-" + digits.substring(12, 13);

    setData("isbn", formatted);
  };

/** 🔄 Fetch patron by school_id */
const fetchPatron = async () => {
  if (!data.school_id.trim()) return;

  setLoadingField("school_id");
  setNotFound((prev) => ({ ...prev, school_id: false }));

  try {
    const res = await axios.get(`/patrons/school/${data.school_id}`);
    const patron = res.data;
    setPatron(patron);
    setDuplicateWarning(false);

    // ✅ If Faculty, auto-fetch semester and set due_date
    if (patron.patron_type?.toLowerCase() === "faculty") {
      try {
        const semesterRes = await axios.get("/semester/active");
        if (semesterRes.data?.end_date) {
          setData("due_date", semesterRes.data.end_date);
          // toast.success(`Due date set to end of semester: ${semesterRes.data.end_date}`);
        } else {
          console.warn("No active semester found.");
        }
      } catch (semesterError) {
        console.warn("Error fetching active semester:", semesterError);
      }
    }
  } catch (error) {
    setPatron(null);
    setNotFound((prev) => ({ ...prev, school_id: true }));
  } finally {
    setLoadingField(null);
  }
};


  /** Fetch book by ISBN */
  const fetchBook = async () => {
    const isbn = data.isbn.trim();
    if (!isbn) return;
    setLoadingField("isbn");
    setNotFound((prev) => ({ ...prev, isbn: false }));

    try {
      const res = await axios.get(`/books/isbn/${encodeURIComponent(isbn)}`);
      setBook(res.data);
      setDuplicateWarning(false);
    } catch (err) {
      console.error("Error fetching book:", err);
      setBook(null);
      setNotFound((prev) => ({ ...prev, isbn: true }));
    } finally {
      setLoadingField(null);
    }
  };

  /** Check for duplicate issue */
  const checkDuplicateIssue = async () => {
    if (!patron || !book) return false;
    try {
      const res = await axios.get(
        `/issuedbooks/check/${patron.school_id}/${book.isbn}`
      );
      return res.data.exists;
    } catch (error) {
      console.error("Error checking duplicate issue", error);
      return false;
    }
  };

  /** ✅ Handle form submit */
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
        router.reload({ only: ["issuedbooks"] });
      },
    });
  };

  /** ✅ Render patron info */
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
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 p-4 overflow-y-auto bg-black/50"
    >
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
            This borrower already has this book issued. Cannot borrow again until returned.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student ID */}
          <div>
            <label>ID:</label>
            <Input
              type="text"
              inputMode="numeric"
              value={data.school_id}
              onChange={handleSchoolIdChange}
              onBlur={fetchPatron}
              className="w-full p-2 border rounded"
              required
            />
            {loadingField === "school_id" && (
              <p className="text-blue-600 text-sm mt-1 animate-pulse">Fetching info...</p>
            )}
            {notFound.school_id && (
              <p className="text-red-600 text-sm mt-1">❌ No found for this ID.</p>
            )}
          </div>

          {patron && (
            <div className="text-sm p-2 bg-gray-100 rounded">
              <p><strong>Name:</strong> {patron.name}</p>
              {renderPatronInfo(patron)}
              <p><strong>Type:</strong> {patron.patron_type}</p>
            </div>
          )}

          {/* ISBN */}
          <div>
            <label>ISBN 13:</label>
            <Input
              type="text"
              inputMode="numeric"
              value={data.isbn}
              onChange={handleIsbnChange}
              onBlur={fetchBook}
              className="w-full p-2 border rounded tracking-widest"
              required
            />
            {loadingField === "isbn" && (
              <p className="text-blue-600 text-sm mt-1 animate-pulse">Fetching book info...</p>
            )}
            {notFound.isbn && (
              <p className="text-red-600 text-sm mt-1">❌ No book found for this ISBN.</p>
            )}
          </div>

          {book && (
            <div className="text-sm p-2 bg-gray-100 rounded">
              <p><strong>Title:</strong> {book.title}</p>
              <p><strong>Author:</strong> {book.author}</p>
              <p><strong>Publisher:</strong> {book.publisher}</p>
              <p><strong>Call No.:</strong> {book.call_number}</p>
              <p><strong>Year:</strong> {book.year}</p>
              <p><strong>Place:</strong> {book.publication_place}</p>
              <p><strong>Copies Available:</strong> {book.copies_available}</p>
              <p><strong>Status:</strong> {book.status}</p>

              {book.copies_available <= 1 && (
                <p className="text-red-600 font-semibold mt-2">
                  ⚠️ This book is reserved. It cannot be issued.
                </p>
              )}
            </div>
          )}

          {/* Accession Number */}
          <div>
            <label>Accession Number:</label>
            <Input
              type="text"
              value={data.accession_number}
              onChange={(e) => setData("accession_number", e.target.value.trim())}
              className="w-full p-2 border rounded"
              required
            />
            {!data.accession_number && (
              <p className="text-gray-500 text-sm mt-1">Enter a valid accession number.</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label>Due Date:</label>
            <Input
              type="date"
              value={data.due_date}
              onChange={(e) => setData("due_date", e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing || (book && book.copies_available <= 1)}
              className="w-full md:w-auto py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              {processing ? "Issuing..." : "Issue Book"}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
