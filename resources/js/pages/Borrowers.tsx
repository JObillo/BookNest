import { useEffect, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Toaster, toast } from "sonner";
import { BreadcrumbItem } from "@/types";
import BorrowerModal from "@/components/BorrowerModal"; 
import EditBorrowerModal from "@/components/EditBorrowerModal";
import ImportPatronModal from "@/components/ImportPatronModal";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Manage Borrowers", href: "/borrowers" },
];

export type Patron = {
  id: number;
  name: string;
  school_id: string;
  email: string;
  course: string | null;
  year: string | null;
  department: string | null;
  patron_type: "Student" | "Faculty" | "Guest";
  contact_number?: string | null;
  address?: string | null;
};

export default function Borrowers() {
  const { patrons } = usePage<{ patrons: Patron[] }>().props;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatron, setEditingPatron] = useState<Patron | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const patronsPerPage = 10;

  useEffect(() => setCurrentPage(1), [searchQuery]);

  const filteredPatrons = patrons.filter((patron) =>
    (patron.name + patron.school_id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatrons.length / patronsPerPage);
  const startIndex = (currentPage - 1) * patronsPerPage;
  const endIndex = startIndex + patronsPerPage;
  const displayedPatrons = filteredPatrons.slice(startIndex, endIndex);

  const handleEditClick = (patron: Patron) => {
    setEditingPatron(patron);
    setIsEditModalOpen(true);
  };

  const handleDelete = (patron: Patron) => {
    if (!confirm(`Are you sure you want to delete borrower "${patron.name}"?`)) return;

    router.delete(`/borrowers/${patron.id}`, {
      onSuccess: () => toast.success("Borrower deleted successfully"),
      onError: () => toast.error("Failed to delete borrower"),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Borrowers" />
      <Toaster position="top-right" richColors />

      <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search by name or school ID"
            className="border border-black rounded px-2 py-2 w-120"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row justify-start items-center mb-4 gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="cursor-pointer bg-green-600 text-white font-medium rounded-lg px-5 py-2 shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
            >
              Add Borrower
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="cursor-pointer bg-blue-600 text-white font-medium rounded-lg px-5 py-2 shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
            >
              Import Borrowers
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
            <thead>
              <tr className="bg-purple-900 text-white border-b">
                {["Student ID", "Borrower Info", "Course & Year", "Borrower Type", "Actions"].map(
                  (header) => (
                    <th key={header} className="border p-3 text-left">{header}</th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {displayedPatrons.length ? (
                displayedPatrons.map((patron) => (
                  <tr key={patron.id} className="border-b hover:bg-gray-100">
                    <td className="p-3">{patron.school_id}</td>
                    <td className="p-3">
                      <div className="font-semibold">Name: {patron.name}</div>
                      {patron.patron_type === "Student" && (
                        <div className="text-sm text-gray-600">
                          Email: {patron.email}
                        </div>
                      )}
                      {patron.patron_type !== "Student" && (
                        <div className="text-sm text-gray-600 text-gray-500">
                          {patron.patron_type === "Faculty" ? "Faculty Member" : "Guest Borrower"}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {patron.course && patron.year
                        ? `${patron.course} — ${patron.year}`
                        : patron.course || patron.year || "—"}
                    </td>
                    <td className="p-3">{patron.patron_type}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleEditClick(patron)}
                        className="bg-blue-500 hover:bg-blue-600 text-sm text-white px-3 py-1 rounded cursor-pointer"
                      >
                        Edit
                      </button>

                      {/* <button
                        onClick={() => handleDelete(patron)}
                        className="bg-red-500 hover:bg-red-600 text-sm text-white px-3 py-1 rounded cursor-pointer"
                      >
                        Delete
                      </button> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center p-4 text-gray-600">
                    No borrowers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 px-4 py-3 text-sm text-gray-700 cursor-pointer">
        <span>
          Page {currentPage} — {displayedPatrons.length} borrower
          {displayedPatrons.length !== 1 && "s"} on this page
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

      <BorrowerModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {editingPatron && (
        <EditBorrowerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          patron={editingPatron}
        />
      )}
      <ImportPatronModal
  isOpen={isImportModalOpen}
  onClose={() => setIsImportModalOpen(false)}
/>

    </AppLayout>
  );
}
