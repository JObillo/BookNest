import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Toaster } from 'sonner';
import PrintMostBorrowed from './PrintMostBorrowed';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Report - Most Borrowed Books', href: '/reports/most-borrowed' }];

export type Book = {
    book?: {
        id?: number;
        title?: string;
        author?: string;
        publisher?: string;
        accession_number?: string;
        call_number?: string;
        year?: number;
        publication_place?: string;
        book_cover?: string;
        section_id?: number;
    };
    borrow_count?: number;
    copy?: {
        accession_number: string;
    };
};

type Section = { id: number; section_name: string };
type Semester = { id: number; name: string; start_date: string; end_date: string };

export default function MostBorrowed() {
    const {
        books: backendBooks,
        sections = [],
        semesters = [],
        selectedSemester,
    } = usePage<{
        books: Book[];
        sections: Section[];
        semesters: Semester[];
        selectedSemester?: number | 'All';
    }>().props;

    // Filters
    const [limit, setLimit] = useState(10);
    const [category, setCategory] = useState('All');
    const [semesterId, setSemesterId] = useState<number | 'All'>(selectedSemester || 'All');
    const [currentPage, setCurrentPage] = useState(1);

    // Printing
    const printRef = useRef<HTMLDivElement>(null);
    const [showPrint, setShowPrint] = useState(false);

    const handlePrint = useReactToPrint({
        contentRef: printRef, // <-- use contentRef instead of content
        documentTitle: 'Most Borrowed Books',
        onAfterPrint: () => setShowPrint(false),
    });

    const handlePrintClick = () => {
        if (backendBooks.length === 0) return;
        setShowPrint(true);
    };

    // Filter change
    const handleFilterChange = (newLimit: number, newCategory: string, newSemester: number | 'All') => {
        router.get(
            '/reports/most-borrowed',
            { limit: newLimit, category: newCategory, semester_id: newSemester },
            { preserveState: true, replace: true },
        );
    };

    // Pagination
    const booksPerPage = limit;
    const totalPages = Math.ceil(backendBooks.length / booksPerPage);
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const displayedBooks = backendBooks.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [backendBooks, limit, category, semesterId]);

    useEffect(() => {
        if (showPrint && printRef.current) {
            handlePrint();
        }
    }, [showPrint]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Most Borrowed Books" />
            <Toaster position="top-right" richColors />

            {/* Filters and Print Button */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
                {/* <label className="flex items-center">
          Limit
          <select
            value={limit}
            onChange={(e) => {
              const newLimit = Number(e.target.value);
              setLimit(newLimit);
              handleFilterChange(newLimit, category, semesterId);
            }}
            className="ml-2 border rounded px-2 py-2 h-10 w-[110px]"
          >
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={50}>Top 50</option>
            <option value={100}>Top 100</option>
          </select>
        </label> */}

                <label className="flex items-center">
                    Category
                    <select
                        value={category}
                        onChange={(e) => {
                            const newCategory = e.target.value;
                            setCategory(newCategory);
                            handleFilterChange(limit, newCategory, semesterId);
                        }}
                        className="ml-2 h-10 w-[150px] rounded border px-2 py-2"
                    >
                        <option value="All">All</option>
                        {sections.map((section) => (
                            <option key={section.id} value={section.id}>
                                {section.section_name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex items-center">
                    Semester
                    <select
                        value={semesterId}
                        onChange={(e) => {
                            const newSemester = e.target.value === 'All' ? 'All' : Number(e.target.value);
                            setSemesterId(newSemester);
                            handleFilterChange(limit, category, newSemester);
                        }}
                        className="ml-2 h-10 w-[190px] rounded border px-2 py-2"
                    >
                        <option value="All">All</option>
                        {semesters.map((sem) => (
                            <option key={sem.id} value={sem.id}>
                                {sem.name} ({sem.start_date} - {sem.end_date})
                            </option>
                        ))}
                    </select>
                </label>

                <button
                    onClick={handlePrintClick}
                    disabled={!displayedBooks.length}
                    className={`h-10 cursor-pointer rounded px-4 py-2 font-medium shadow-md transition-all duration-200 ${
                        displayedBooks.length
                            ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                            : 'cursor-not-allowed bg-gray-300 text-gray-600'
                    }`}
                >
                    Print Report
                </button>
            </div>

            {/* No Data Message
{!displayedBooks.length && (
  <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
    No report available to print.
  </div>
)} */}

            {/* Table Section */}
            <div className="flex flex-col gap-6 rounded bg-white p-6 text-black shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse rounded-lg bg-white text-black shadow-sm">
                        <thead>
                            <tr className="border-b bg-purple-900 text-white">
                                {[
                                    'Book Cover',
                                    'Title & Author',
                                    'Publisher',
                                    // "Catalog Info",
                                    'Borrowed Times',
                                ].map((header) => (
                                    <th key={header} className="border p-3 text-left">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {displayedBooks.length ? (
                                displayedBooks.map((item) => (
                                    <tr key={item.book?.id} className="border-b hover:bg-gray-100">
                                        <td className="p-3">
                                            {item.book?.book_cover ? (
                                                <img
                                                    src={item.book.book_cover}
                                                    alt={item.book.title}
                                                    className="h-28 w-20 rounded object-cover shadow"
                                                />
                                            ) : (
                                                <span className="text-gray-500">No Cover</span>
                                            )}
                                        </td>

                                        <td className="p-3">
                                            <div className="font-semibold">{item.book?.title}</div>
                                            <div className="text-sm text-gray-600">by {item.book?.author || 'Unknown'}</div>
                                        </td>

                                        <td className="p-3">{item.book?.publisher || 'N/A'}</td>

                                        {/* <td className="p-3 text-sm text-gray-800">
                    <div>Accession #: {item.book?.accession_number || "N/A"}</div>
                    <div>Call #: {item.book?.call_number || "N/A"}</div>
                    <div>Year: {item.book?.year || "N/A"}</div>
                    <div>Place: {item.book?.publication_place || "N/A"}</div>
                  </td> */}

                                        <td className="p-3 text-center font-semibold text-purple-700">{item.borrow_count} Times</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="bg-gray-50 p-6 text-center text-gray-600 italic">
                                        No borrowed books found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex cursor-pointer items-center justify-between px-4 py-3 text-sm text-gray-700">
                    <span>
                        Page {currentPage} — {displayedBooks.length} book
                        {displayedBooks.length !== 1 && 's'} on this page
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            className="cursor-pointer rounded border px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>

                        <span className="rounded bg-purple-700 px-3 py-1 text-white">{currentPage}</span>

                        <button
                            className="cursor-pointer rounded border px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Conditionally render print layout */}
            <div className="print-hidden">
                <PrintMostBorrowed
                    ref={printRef}
                    books={backendBooks}
                    semester={semesterId === 'All' ? { name: 'All Semesters' } : semesters.find((s) => s.id === semesterId)}
                />
            </div>
        </AppLayout>
    );
}
