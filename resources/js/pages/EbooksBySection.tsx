import { Head } from '@inertiajs/react';
import { useState, useEffect } from "react";
import { Input } from '@/components/ui/input';
import { Link } from '@inertiajs/react';
import { FaHome } from 'react-icons/fa';

type Props = {
  ebooks: {
    id: number;
    title: string;
    author: string;
    year?: string;
    cover:string;
    file_url?: string; // for download
  }[];
};

export default function EbooksBySection({ ebooks }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ebooksPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filter ebooks based on search
  const filteredEbooks = ebooks.filter((ebook) =>
    (ebook.title + ebook.author).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEbooks.length / ebooksPerPage);
  const startIndex = (currentPage - 1) * ebooksPerPage;
  const endIndex = startIndex + ebooksPerPage;
  const displayedEbooks = filteredEbooks.slice(startIndex, endIndex);

  return (
    <>
      <Head title="Ebooks Library" />
      <div className="p-6">
        <header className="fixed top-0 left-0 z-50 w-full flex justify-between items-center px-4 sm:px-8 py-4 bg-white shadow-md">
          <img src="/philcstlogo.png" alt="Library Logo" className="h-10" />
        </header>

        <div className="mt-20 text-center">
          <h1 className="lilitaOneFont royalPurple text-2xl sm:text-3xl font-bold">
            Welcome to Online Public Access Catalog
          </h1>
          <p className="lilitaOneFont royalPurple text-md sm:text-lg font-semibold">
            PhilCST Library: Your Gateway to Knowledge and Discovery
          </p>
           <div className="flex items-center space-x-2">
                      <Link
                        href={route("home")}
                        className="text-black text-xl sm:text-2xl hover:text-purple-900"
                      >
                        <FaHome />
                      </Link>
                      <h1 className="font-bold text-xl">
                        E-Books
                      </h1>
                    </div>
          <Input
            className="border rounded px-2 py-1 w-full max-w-md"
            placeholder="Search by title or author"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {displayedEbooks.length > 0 ? (
          <table className="w-full border-collapse bg-white shadow-sm rounded-lg mt-6">
            <thead>
              <tr className="bg-purple-900 text-white border-b">
                {["Cover","Title", "Author", "Year", "Download,"].map((header) => (
                  <th key={header} className="border p-3 text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedEbooks.map((ebook) => (
                <tr key={ebook.id} className="border-b hover:bg-gray-100">
                    <td className='p-3'><img 
                        src={ebook.cover ? `/storage/${ebook.cover}` : "/placeholder-book.png"} 
                        alt={ebook.title} 
                        className="w-20 h-28 object-cover rounded"
                        /></td>
                  <td className="p-3">{ebook.title}</td>
                  <td className="p-3">{ebook.author}</td>
                  <td className="p-3">{ebook.year || "N/A"}</td>
                  <td className="p-3">
                    <a
                      href={`/ebooks/${ebook.id}/download`}
                      className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center mt-4">No eBooks available.</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="px-3 py-1">{currentPage}</span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}
