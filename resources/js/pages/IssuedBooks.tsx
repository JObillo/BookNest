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
  id?: number;
  issued_date?: string;
  due_date?: string;
  status?: string;
  patron: {
    id: number;
    name: string;
    school_id: string;
    course: string | null;  // Handling null values
    year: string | null;    // Handling null values
    department: string | null; // Handling null values
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

export default function IssuedBooks() {
  const { issuedbooks } = usePage<{ issuedbooks: IssuedBook[] }>().props;
  const [isModalOpen, setIsModalOpen] = useState(false);

    //pagination and search
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
      setCurrentPage(1);
    }, [searchQuery]);
    const booksPerPage = 5;
      const filteredBooks = issuedbooks.filter((issuedbooks) =>
        (issuedbooks.patron.name + issuedbooks.patron.school_id).toLowerCase().startsWith(searchQuery.toLowerCase())
    );
  
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const displayedBooks = filteredBooks.slice(startIndex, endIndex);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Issue Book" />
      <Toaster position="top-right" richColors />

      <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-2 gap-3">
            {/* Search Bar */}
            <div className="flex-1">
              <Input
                className="border rounded px-2 py-1"
                placeholder="Search Student Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Issue Book Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 text-white font-medium rounded-lg px-4 py-2 shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-200"
            >
              Issue Book
            </button>
          </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
            <thead>
              <tr className="bg-purple-900 text-white border-b">
                {[
                  "Patron Info",
                  "Book",        
                  "Author",      
                  "Catalog Info",
                  "Issued Date", 
                  "Due Date",    
                  "Status",      
                ].map((header, index) => (
                  <th
                    key={header}
                    className={`border p-3 text-left ${
                      index === 2
                        ? "hidden md:table-cell" 
                        : index === 3
                        ? "hidden lg:table-cell" 
                        : index === 6
                        ? "hidden sm:table-cell" 
                        : ""
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedBooks.length > 0 ? (
                displayedBooks.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-100">
                    {/* Patron Info - always visible */}
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

                    {/* Book - always visible */}
                    <td className="p-3">
                      <div className="font-semibold">{record.book.title}</div>
                      <div className="text-sm text-gray-600">
                        ISBN: {record.book.isbn}
                      </div>
                    </td>

                    {/* Author - md and up */}
                    <td className="p-3 hidden md:table-cell">
                      {record.book.author}
                    </td>

                    {/* Catalog Info - lg and up */}
                    <td className="p-3 text-sm text-gray-800 hidden lg:table-cell">
                      <div>Accession #: {record.book.accession_number || "N/A"}</div>
                      <div>Call #: {record.book.call_number || "N/A"}</div>
                      <div>Year: {record.book.year || "N/A"}</div>
                      <div>Place: {record.book.publication_place || "N/A"}</div>
                    </td>

                    {/* Issued Date - always */}
                    <td className="p-3">
                      {record.issued_date
                        ? new Date(record.issued_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </td>

                    {/* Due Date - always */}
                    <td className="p-3">
                      {record.due_date
                        ? new Date(record.due_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </td>

                    {/* Status - hidden on xs */}
                    <td className="p-3 hidden sm:table-cell">
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
                  <td colSpan={7} className="text-center p-4 text-gray-600">
                    Empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
    <div className="flex justify-between items-center mt-4 px-4 py-3 text-sm text-gray-700 cursor-pointer">
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

        <span className="px-3 py-1 bg-purple-700 text-white rounded">
          {currentPage}
        </span>

        <button
          className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>

      <IssueBookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </AppLayout>
  );
}