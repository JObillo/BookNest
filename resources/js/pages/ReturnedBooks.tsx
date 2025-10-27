import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Toaster, toast } from "sonner";
import ReturnBookModal from "@/components/ReturnBookModal";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Unreturned Books", href: "/dashboard" },
];

export type IssuedBook = {
  id: number;
  issued_date?: string;
  due_date?: string;
  status?: string;
  fine_amount?: number;
  fine_status?: string;
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

  // Search & pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 5;

  // Open modal
  const openReturnModal = (book: IssuedBook) => {
    setBookToReturn(book);
    setIsModalOpen(true);
  };

  // Handle return
  const handleReturnBook = async (bookId: number, issuedId: number, fineStatus?: string) => {
    try {
      const csrfToken =
        document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

      await axios.put(
        `/issuedbooks/${issuedId}/return`,
        { fine_status: fineStatus }, // ✅ send fine status
        { headers: { "X-CSRF-TOKEN": csrfToken } }
      );

      toast.success("Book returned successfully!");
      setIsModalOpen(false);
      setBookToReturn(null);
      router.reload();
    } catch (error) {
      console.error(error);
      toast.error("Failed to return book.");
    }
  };

  // Format date
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Filter search
  const filteredBooks = issuedbooks.filter((record) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    return (
      record.patron.name.toLowerCase().includes(term) ||
      record.patron.school_id.toLowerCase().includes(term)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const displayedBooks = filteredBooks.slice(startIndex, startIndex + booksPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Color helper for fine_status
  const getFineStatusColor = (status?: string) => {
    switch (status) {
      case "unpaid":
        return "bg-red-600";
      case "cleared":
        return "bg-green-600";
      case "no fine":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Unreturned Books" />
      <Toaster position="top-right" richColors />

      <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded">
        {/* Search Bar */}
        <div>
          <Input
            className="border rounded px-2 py-1 w-full"
            placeholder="Search by Name or School ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
            <thead>
              <tr className="bg-purple-900 text-white border-b">
                {[
                  "Borrower Info",
                  "Book",
                  "Issued Date & Time",
                  "Due Date & Time",
                  "Status",
                  "Fine Amount",
                  "Fine Status",
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
                    {/* Patron Info */}
                    <td className="p-3">
                      <div className="font-semibold">{record.patron.name}</div>
                      <div className="text-sm text-gray-600">
                        School ID: {record.patron.school_id}
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.patron.course || "N/A"} | {record.patron.year || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.patron.department || "N/A"} ({record.patron.patron_type})
                      </div>
                    </td>

                    {/* Book Info */}
                    <td className="p-3">
                      <div className="font-semibold">{record.book.title}</div>
                      <div className="text-sm text-gray-600">
                        ISBN: {record.book.isbn}
                      </div>
                    </td>

                    {/* Issued Date */}
                    <td className="p-3">{formatDateTime(record.issued_date)}</td>

                    {/* Due Date */}
                    <td className="p-3">{formatDateTime(record.due_date)}</td>

                    {/* Status */}
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-white text-sm ${
                          record.status === "Issued"
                            ? "bg-yellow-600"
                            : record.status === "Overdue"
                            ? "bg-red-600"
                            : "bg-green-600"
                        }`}
                      >
                        {record.status === "Issued" ? "Not Returned" : record.status}
                      </span>
                    </td>

                    {/* Fine Amount */}
                    <td className="p-3">
                      {record.status === "Issued"
                        ? "-"
                        : `₱${record.fine_amount?.toFixed(2) ?? "0.00"}`}
                    </td>

                    {/* Fine Status */}
                    <td className="p-3">
                      {record.status === "Issued" ? (
                        "-"
                      ) : (
                        <span
                          className={`px-2 py-1 rounded text-white text-sm ${getFineStatusColor(
                            record.fine_status
                          )}`}
                        >
                          {record.fine_status || "no fine"}
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="p-3">
                      {(record.status === "Issued" || record.status === "Overdue") && (
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
                    No matching patrons found.
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

          <span className="px-3 py-1 bg-purple-700 text-white rounded">{currentPage}</span>

          <button
            className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Return Modal */}
      <ReturnBookModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setBookToReturn(null);
        }}
        onConfirm={(fineStatus) => {
          if (bookToReturn) {
            handleReturnBook(bookToReturn.book.id, bookToReturn.id, fineStatus); // ✅ send fineStatus
          }
        }}
        bookTitle={bookToReturn?.book.title || ""}
        isOverdue={bookToReturn?.status === "Overdue"}
      />
    </AppLayout>
  );
}
