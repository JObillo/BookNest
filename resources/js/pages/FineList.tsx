import { useState, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Input } from "@/components/ui/input";
import { BreadcrumbItem } from "@/types";
import FineListModal from "@/components/FineListModal";

const breadcrumbs: BreadcrumbItem[] = [{ title: "Fine List", href: "/fines" }];

export type FineRecord = {
  id: number;
  due_date?: string;
  returned_date?: string;
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
    isbn: string;
  };
};

export default function FineList() {
  const { fines } = usePage<{ fines: FineRecord[] }>().props;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState<FineRecord | null>(null);

  const finesPerPage = 6;

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

  // Fine status color
  const getFineStatusColor = (status?: string) => {
    switch (status) {
      case "unpaid":
        return "bg-red-600";
      case "cleared":
        return "bg-green-600";
      default:
        return "bg-gray-500";
    }
  };

  // Handle update fine status
  const handleUpdateFineStatus = async (id: number, newStatus: string) => {
    try {
      await axios.put(`/fines/${id}/status`, { fine_status: newStatus });
      toast.success("Fine status updated!");
      router.reload();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update fine status.");
    }
  };

  // Handle confirm modal
  const handleConfirm = () => {
    if (!selectedFine) return;

    // ✅ Check if book is returned first
    if (!selectedFine.returned_date) {
      toast.warning("This book has not been returned yet!");
      setShowModal(false);
      return;
    }

    // Proceed with clearing fine
    handleUpdateFineStatus(selectedFine.id, "cleared");
    setShowModal(false);
  };

  // Filter search
  const filteredFines = fines.filter((record) => {
    const term = searchTerm.toLowerCase();
    return (
      record.patron.name.toLowerCase().includes(term) ||
      record.patron.school_id.toLowerCase().includes(term)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredFines.length / finesPerPage);
  const startIndex = (currentPage - 1) * finesPerPage;
  const displayedFines = filteredFines.slice(
    startIndex,
    startIndex + finesPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Fine List" />
      <Toaster position="top-right" richColors />

      <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded">
        {/* Search Bar */}
        <input
          className="border border-black rounded px-2 py-2 w-120"
          placeholder="Search by Name or School ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
            <thead>
              <tr className="bg-purple-900 text-white border-b">
                {[
                  "Borrower Info",
                  "Book",
                  "Due Date & Time",
                  "Returned Date",
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
              {displayedFines.length > 0 ? (
                displayedFines.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-200">
                    {/* Patron Info */}
                    <td className="p-3">
                      <div className="font-semibold">{record.patron.name}</div>
                      <div className="text-sm text-gray-600">
                        School ID: {record.patron.school_id}
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.patron.course || "N/A"} |{" "}
                        {record.patron.year || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.patron.department || "N/A"} (
                        {record.patron.patron_type})
                      </div>
                    </td>

                    {/* Book Info */}
                    <td className="p-3">
                      <div className="font-semibold">{record.book.title}</div>
                      <div className="text-sm text-gray-600">
                        ISBN: {record.book.isbn}
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="p-3">{formatDateTime(record.due_date)}</td>

                    {/* Returned Date */}
                    <td className="p-3">
                      {formatDateTime(record.returned_date)}
                    </td>

                    {/* Fine Amount */}
                    <td className="p-3">
                      ₱{Number(record.fine_amount ?? 0).toFixed(2)}
                    </td>

                    {/* Fine Status */}
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-white text-sm ${getFineStatusColor(
                          record.fine_status
                        )}`}
                      >
                        {record.fine_status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-3">
                      {record.fine_status === "unpaid" ? (
                        <button
                          onClick={() => {
                            setSelectedFine(record);
                            setShowModal(true);
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Mark as Cleared
                        </button>
                      ) : (
                        <span className="text-gray-600 text-sm">No Action</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-600">
                    No fines found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 px-4 py-3 text-sm text-gray-700">
          <span>
            Page {currentPage} — {displayedFines.length} record
            {displayedFines.length !== 1 && "s"} on this page
          </span>

          <div className="flex items-center gap-1">
            <button
              className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="px-3 py-1 bg-purple-700 text-white rounded">
              {currentPage}
            </span>

            <button
              className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <FineListModal
        show={showModal}
        patronName={selectedFine?.patron.name}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
      />
    </AppLayout>
  );
}
