import { useEffect, useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Toaster, toast } from "sonner";
import { type BreadcrumbItem } from "@/types";
import SemesterModal from "@/components/SemesterModal";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Report - Manage Semester", href: "/reports/managesemester" },
];

export type Semester = {
  id: number;
  name: string;
  school_year: string;
  start_date: string;
  end_date: string;
  status: "Active" | "Inactive";
};

export default function ManageSemester() {
  const { semesters: backendSemesters = [], flash }: any = usePage().props;

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | undefined>();

  // Show backend flash messages
  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  // Check if latest semester is expired
  useEffect(() => {
    if (backendSemesters.length) {
      const latestSemester = [...backendSemesters].sort(
        (a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
      )[0];

      const today = new Date();
      const endDate = new Date(latestSemester.end_date);

      if (today > endDate) {
        toast.warning("The current semester has ended. Please create a new semester.");
      }
    }
  }, [backendSemesters]);

  const handleAddSemester = () => {
    setSelectedSemester(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (semester: Semester) => {
    setSelectedSemester(semester);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this semester?")) {
      router.delete(`/reports/managesemester/${id}`, { preserveState: true });
    }
  };

  const semestersPerPage = limit;
  const totalPages = Math.ceil(backendSemesters.length / semestersPerPage);
  const startIndex = (currentPage - 1) * semestersPerPage;
  const endIndex = startIndex + semestersPerPage;
  const displayedSemesters = backendSemesters.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [backendSemesters, limit]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manage Semester" />
      <Toaster position="top-right" richColors />

      {/* Top controls */}
      <div className="flex justify-between items-center mt-10 mb-4">
        <button
          onClick={handleAddSemester}
          className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
        >
          Add New Semester
        </button>
      </div>

      {/* Table */}
      <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
            <thead>
              <tr className="bg-purple-900 text-white border-b">
                {["Semester", "School Year", "Start Date", "End Date", "Status", "Action"].map(
                  (header) => (
                    <th key={header} className="border p-3 text-left">
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {displayedSemesters.length ? (
                displayedSemesters.map((semester: Semester) => (
                  <tr key={semester.id} className="border-b hover:bg-gray-100">
                    <td className="p-3 font-semibold">{semester.name}</td>
                    <td className="p-3">{semester.school_year}</td>
                    <td className="p-3">{semester.start_date}</td>
                    <td className="p-3">{semester.end_date}</td>
                    <td
                      className={`p-3 font-semibold ${
                        semester.status === "Active" ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {semester.status}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleEdit(semester)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(semester.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-600">
                    No semesters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 px-4 py-3 text-sm text-gray-700 cursor-pointer">
          <span>
            Page {currentPage} — {displayedSemesters.length} semester
            {displayedSemesters.length !== 1 && "s"} on this page
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
      </div>

      <SemesterModal
        semester={selectedSemester}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          if (selectedSemester) {
            router.put(`/reports/managesemester/${selectedSemester.id}`, data);
          } else {
            router.post("/reports/managesemester", data);
          }
          setIsModalOpen(false);
        }}
      />
    </AppLayout>
  );
}
