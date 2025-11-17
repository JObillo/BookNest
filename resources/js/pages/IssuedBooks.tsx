import { useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import IssueBookModal from "@/components/IssueBookModal";
import AppLayout from "@/layouts/app-layout";
import { Toaster } from "sonner";
import { Input } from "@headlessui/react";
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Issued Books', href: '/section' },
];

export type IssuedBook = {
  id: number;
  issued_date?: string;
  due_date?: string;
  status?: string;
  patron: {
    id: number;
    name: string;
    school_id: string;
    course?: string;
    year?: string;
    department?: string;
    patron_type: string;
    contact_number?: string;
    address?: string;
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
  copy?: {
    accession_number: string;
  };
};

export default function IssuedBooks() {
  const { issuedbooks } = usePage<{ issuedbooks: IssuedBook[] }>().props;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => setCurrentPage(1), [searchTerm]);

  const booksPerPage = 5;
  const filteredBooks = issuedbooks.filter((record) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    return (
      record.patron.name.toLowerCase().includes(term) ||
      record.patron.school_id.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const displayedBooks = filteredBooks.slice(startIndex, endIndex);

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

const renderPatronInfo = (patron: IssuedBook["patron"]) => {
  switch (patron.patron_type) {
    case "Student":
      return (
        <>
          <div className="text-sm text-gray-600">School ID: {patron.school_id}</div>
          <div className="text-sm text-gray-600">
            {patron.department && `${patron.department} | `}
            {patron.course && `${patron.course} | `}
            {patron.year && patron.year}
          </div>
        </>
      );

    case "Faculty":
      return (
        <>
          <div className="text-sm text-gray-600">School ID: {patron.school_id}</div>
          {patron.department && (
            <div className="text-sm text-gray-600">
              Department: {patron.department}
            </div>
          )}
        </>
      );

    case "Guest":
      return (
        <>
          <div className="text-sm text-gray-600">Guest ID: {patron.school_id}</div>
          {patron.contact_number && (
            <div className="text-sm text-gray-600">
              Contact: {patron.contact_number}
            </div>
          )}
          {patron.address && (
            <div className="text-sm text-gray-600">
              Address: {patron.address}
            </div>
          )}
        </>
      );

    default:
      return null;
  }
};


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Issued Books" />
      <Toaster position="top-right" richColors />

      <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded">
        <div className="flex justify-between items-center mb-2">
          {/* Search bar */}
          <Input
            className="border border-black rounded px-2 py-2 w-120"
            placeholder="Search by Name or School ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer bg-green-600 text-white font-medium rounded-lg ml-5 px-5 py-2 shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
          >
            Issue Book
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
            <thead>
              <tr className="bg-purple-900 text-white border-b">
                {["Borrower Info", "Book", "Accession No", "Issued Date", "Due Date", "Status"].map(header => (
                  <th key={header} className="border p-3 text-left">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedBooks.length > 0 ? (
                displayedBooks.map(record => (
                  <tr key={record.id} className="border-b hover:bg-gray-100">
                    <td className="p-3">
                      <div className="font-semibold">{record.patron.name}</div>
                        {renderPatronInfo(record.patron)}
                        <div className="text-sm text-gray-600 font-medium mt-1">
                          ({record.patron.patron_type})
                        </div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold">{record.book.title}</div>
                      <div className="text-sm text-gray-600">ISBN: {record.book.isbn}</div>
                    </td>
                    <td className="p-3">{record.copy?.accession_number || "N/A"}</td>

                    <td className="p-3">{formatDateTime(record.issued_date)}</td>
                    <td className="p-3">{formatDateTime(record.due_date)}</td>

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
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-600">Empty.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
<div className="flex justify-between items-center mt-4 px-4 py-3 text-sm text-gray-700">
  <span>
    Page {currentPage} of {totalPages} — {displayedBooks.length} book
    {displayedBooks.length !== 1 && "s"} on this page
  </span>

  <div className="flex items-center gap-1">
    {/* Previous Arrow */}
    <button
      className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
    >
      «
    </button>

    {/* Numeric Page Buttons */}
    {Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(
        (page) =>
          page === 1 ||
          page === totalPages ||
          (page >= currentPage - 2 && page <= currentPage + 2)
      )
      .map((page, idx, arr) => {
        const prevPage = arr[idx - 1];
        return (
          <span key={page} className="flex">
            {prevPage && page - prevPage > 1 && (
              <span className="px-2 py-1">...</span>
            )}
            <button
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded hover:bg-gray-200 ${
                page === currentPage ? "bg-purple-700 text-white" : ""
              }`}
            >
              {page}
            </button>
          </span>
        );
      })}

    {/* Next Arrow */}
    <button
      className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
    >
      »
    </button>
  </div>
</div>
      </div>

      <IssueBookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </AppLayout>
  );
}
