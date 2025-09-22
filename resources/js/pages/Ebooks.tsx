import { useState } from "react";
import { router } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Input } from "@/components/ui/input";
import { FaDownload } from "react-icons/fa";
import AddEbookModal from "@/components/EbookModal";
import FetchModal from "@/components/FetchModal";

type Ebook = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  year: string;
  cover: string | null;
  file_url: string;
};

interface Props {
  ebooks: Ebook[];
}

export default function Ebooks({ ebooks }: Props) {
  const [search, setSearch] = useState("");
  const [ebookList, setEbookList] = useState<Ebook[]>([...ebooks].sort((a, b) => b.id - a.id));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFetchModal, setShowFetchModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredEbooks = ebookList.filter((ebook) =>
    ebook.title?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEbooks.length / itemsPerPage);
  const paginatedEbooks = filteredEbooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteEbook = (id: number) => {
    if (confirm("Are you sure you want to delete this e-book?")) {
      router.delete(`/ebooks/${id}`, {
        onSuccess: () => {
          setEbookList(ebookList.filter((ebook) => ebook.id !== id));
        },
        onError: (errors) => {
          console.error(errors);
          alert("Something went wrong while deleting the e-book.");
        },
      });
    }
  };

const handleAddEbook = (newEbook: Ebook) => {
  setEbookList((prev) => [newEbook, ...prev]); // prepend new ebook
  setCurrentPage(1);
};

  return (
    <AppLayout breadcrumbs={[{ title: "Manage e-books", href: "/ebooks" }]}>
      <Head title="E-books" />
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">E-books</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-700 hover:bg-purple-900 text-white px-4 py-2 rounded"
          >
            Add e-book manually
          </button>
          <button
            onClick={() => setShowFetchModal(true)}
            className="bg-green-600 hover:bg-green-800 text-white px-4 py-2 rounded"
          >
            Fetch from Google Books
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <Input
            placeholder="Quick Search"
            className="w-full max-w-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="grid grid-cols-12 bg-purple-900 text-white font-semibold px-4 py-2 rounded">
          <div className="col-span-10">BOOK INFORMATION</div>
          <div className="col-span-2 text-center">DOWNLOAD</div>
        </div>

        <div className="space-y-4">
          {paginatedEbooks.map((ebook) => (
            <div
              key={ebook.id}
              className="grid grid-cols-12 items-center bg-white rounded shadow p-4 hover:bg-gray-50"
            >
              <div className="col-span-1">
                <img
                  src={
                    ebook.cover
                      ? ebook.cover.startsWith("http")
                        ? ebook.cover
                        : `/storage/${ebook.cover}`
                      : "/placeholder-book.png"
                  }
                  alt={ebook.title}
                  className="w-16 h-24 object-cover rounded"
                />
              </div>
              <div className="col-span-9 px-4">
                <h2 className="font-semibold">{ebook.title}</h2>
                <p className="text-sm text-gray-700">
                  by {ebook.author}
                  <br />
                  published in {ebook.year}
                  <br />
                  publisher: {ebook.publisher}
                </p>
              </div>
              <div className="col-span-2 flex items-center justify-center gap-4">
                <a
                  href={`/storage/${ebook.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-700 hover:text-purple-900"
                >
                  <FaDownload className="text-xl" />
                </a>
                <button
                  onClick={() => handleDeleteEbook(ebook.id)}
                  className="bg-red-500 hover:bg-red-600 text-sm text-white px-3 py-1 rounded cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1 ? "bg-purple-700 text-white" : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        <AddEbookModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddEbook}
        />
        <FetchModal
          isOpen={showFetchModal}
          onClose={() => setShowFetchModal(false)}
          onSubmit={handleAddEbook}
        />
      </div>
    </AppLayout>
  );
}
