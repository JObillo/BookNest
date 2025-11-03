import { useState, useEffect, useRef } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Input } from "@/components/ui/input";
import { BreadcrumbItem } from "@/types";
import FineListModal from "@/components/FineListModal";
import { Select } from "@headlessui/react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
  const [statusFilter, setStatusFilter] = useState<"all" | "unpaid" | "cleared">("unpaid");
  const [showPrint, setShowPrint] = useState(false);

  const finesPerPage = 6;
  const printRef = useRef<HTMLDivElement>(null);

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

    if (!selectedFine.returned_date) {
      toast.warning("This book has not been returned yet!");
      setShowModal(false);
      return;
    }

    handleUpdateFineStatus(selectedFine.id, "cleared");
    setShowModal(false);
  };

  // Filter search and status
  const filteredFines = fines.filter((record) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      record.patron.name.toLowerCase().includes(term) ||
      record.patron.school_id.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "all" ? true : record.fine_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredFines.length / finesPerPage);
  const startIndex = (currentPage - 1) * finesPerPage;
  const displayedFines = filteredFines.slice(startIndex, startIndex + finesPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

const handleExportExcel = () => {
  if (!filteredFines.length) {
    toast.error("No fines to export!");
    return;
  }

  // Prepare data
  const data = filteredFines.map((record) => ({
    "Borrower Name": record.patron.name,
    "School ID": record.patron.school_id,
    "Course": record.patron.course || "N/A",
    "Year": record.patron.year || "N/A",
    "Department": record.patron.department || "N/A",
    "Patron Type": record.patron.patron_type,
    "Book Title": record.book.title,
    "ISBN": record.book.isbn,
    "Due Date": record.due_date ? new Date(record.due_date).toLocaleString("en-PH") : "N/A",
    "Returned Date": record.returned_date ? new Date(record.returned_date).toLocaleString("en-PH") : "N/A",
    "Fine Amount": record.fine_amount ?? 0,
    "Fine Status": record.fine_status ?? "N/A",
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Fines");

  // Write and save Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `Fine_List_${statusFilter.toUpperCase()}.xlsx`);
};

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Fine List" />
      <Toaster position="top-right" richColors />

      {/* Search, Filter, Print */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center p-6">
        <Input
          placeholder="Search by Name or School ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-2 py-2 w-full sm:w-60 shadow-sm focus:outline-none focus:ring"
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "unpaid" | "cleared")}
          className="border rounded px-2 py-2 shadow-sm focus:outline-none focus:ring"
        >
          <option value="all">All</option>
          <option value="unpaid">Unpaid</option>
          <option value="cleared">Paid</option>
        </Select>

        <button
          onClick={handleExportExcel}
          disabled={!filteredFines.length}
          className={`px-4 py-2 rounded text-white ${
            filteredFines.length ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Export to Excel
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto p-6 bg-white shadow-lg rounded mb-6">
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
                <th key={header} className="border p-3 text-left">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedFines.length > 0 ? (
              displayedFines.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-200">
                  <td className="p-3">
                    <div className="font-semibold">{record.patron.name}</div>
                    <div className="text-sm text-gray-600">School ID: {record.patron.school_id}</div>
                    <div className="text-sm text-gray-600">{record.patron.course || "N/A"} | {record.patron.year || "N/A"}</div>
                    <div className="text-sm text-gray-600">{record.patron.department || "N/A"} ({record.patron.patron_type})</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold">{record.book.title}</div>
                    <div className="text-sm text-gray-600">ISBN: {record.book.isbn}</div>
                  </td>
                  <td className="p-3">{formatDateTime(record.due_date)}</td>
                  <td className="p-3">{formatDateTime(record.returned_date)}</td>
                  <td className="p-3">₱{Number(record.fine_amount ?? 0).toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-white text-sm ${getFineStatusColor(record.fine_status)}`}>
                      {record.fine_status}
                    </span>
                  </td>
                  <td className="p-3">
                    {record.fine_status === "unpaid" ? (
                      <button
                        onClick={() => { setSelectedFine(record); setShowModal(true); }}
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
                <td colSpan={7} className="text-center p-4 text-gray-600">No fines found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 px-4 py-3 text-sm text-gray-700">
        <span>Page {currentPage} — {displayedFines.length} record{displayedFines.length !== 1 && "s"} on this page</span>
        <div className="flex items-center gap-1">
          <button
            className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="px-3 py-1 bg-purple-700 text-white rounded">{currentPage}</span>
          <button
            className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <FineListModal
        show={showModal}
        patronName={selectedFine?.patron.name}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
      />
    </AppLayout>
  );
}
