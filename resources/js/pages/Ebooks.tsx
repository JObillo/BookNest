import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Input } from "@/components/ui/input";
import { FaDownload } from "react-icons/fa";
import { Select } from "@headlessui/react";

export type Ebook = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  file_url: string;
  cover: string;
};

const Ebooks = () => {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(5);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [query, setQuery] = useState("classic literature"); // selected category

  const totalPages = Math.ceil(total / perPage);

  // Example categories/genres
  const genres = [
    "classic literature",
    "science fiction",
    "romance",
    "fantasy",
    "history",
    "technology"
  ];

  // Fetch ebooks from API
  const fetchEbooks = async (options?: { random?: boolean }) => {
    try {
      const params = new URLSearchParams({
        perPage: perPage.toString(),
        page: currentPage.toString(),
        search: search,
      });

      if (options?.random) {
        params.append("random", "true");
      }

      const res = await fetch(`/api/ebooks?${params.toString()}`);
      const data = await res.json();
      setEbooks(data.data);
      setTotal(data.total);
      setCurrentPage(data.current_page);
    } catch (err) {
      console.error("Failed to fetch ebooks:", err);
    }
  };

  // Reset cache (delete from DB)
  const resetCache = async () => {
    if (!confirm("Delete all cached ebooks?")) return;
    try {
      const res = await fetch("/api/ebooks/reset", { method: "DELETE" });
      const data = await res.json();
      setStatusMsg(data.message);
      setEbooks([]);
      setTotal(0);
    } catch (err) {
      setStatusMsg("❌ Failed to reset cache.");
    }
  };

  // Fetch new ebooks from OpenLibrary by selected category
  const fetchNewEbooks = async () => {
    if (!confirm(`Fetch 100 new ebooks for "${query}"?`)) return;
    try {
      const res = await fetch("/api/ebooks/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setStatusMsg(data.message);
      fetchEbooks();
    } catch (err) {
      setStatusMsg("❌ Failed to fetch ebooks.");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  useEffect(() => {
    fetchEbooks();
  }, [currentPage, search, perPage]);

  return (
    <AppLayout>
      <Head title="E-books" />
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Free E-books</h1>

        {/* Status message */}
        {statusMsg && (
          <div className="p-2 bg-yellow-100 text-yellow-800 rounded">
            {statusMsg}
          </div>
        )}

        {/* Search */}
        <Input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={handleSearchChange}
          className="mb-4 w-full max-w-md"
        />

        {/* Category dropdown */}
        <div className="flex items-center gap-2 mb-4">
          <label className="font-semibold">Category:</label>
          <Select
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </Select>
        </div>

        {/* Limit dropdown */}
        <div className="flex items-center gap-2 mb-4">
          <label className="font-semibold">Show:</label>
          <Select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[5, 10, 15, 20].map((num) => (
              <option key={num} value={num}>
                {num} eBooks
              </option>
            ))}
          </Select>
        </div>

        {/* Admin buttons */}
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={resetCache}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reset Cache
          </button>
          <button
            onClick={fetchNewEbooks}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Fetch 100 New
          </button>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-12 bg-purple-800 text-white font-semibold px-4 py-2 rounded">
          <div className="col-span-10">BOOK INFORMATION</div>
          <div className="col-span-2 text-center">DOWNLOAD</div>
        </div>

        {/* Ebooks list */}
        <div className="space-y-4">
          {ebooks.length === 0 && (
            <p className="text-center text-gray-500 mt-4">
              No e-books available.
            </p>
          )}

          {ebooks.map((ebook) => (
            <div
              key={ebook.id}
              className="grid grid-cols-12 items-start bg-white rounded shadow p-4 hover:bg-gray-50"
            >
              <div className="col-span-1">
                <img
                  src={ebook.cover || "/placeholder-book.png"}
                  alt={ebook.title}
                  className="w-16 h-24 object-cover rounded"
                />
              </div>
              <div className="col-span-9 px-4">
                <h2 className="font-semibold">{ebook.title}</h2>
                <p className="text-sm text-gray-700 mb-1">
                  by {ebook.author} <br />
                  publisher: {ebook.publisher}
                </p>
              </div>
              <div className="col-span-2 flex items-center justify-center mt-4">
                <a
                  href={ebook.file_url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                  aria-label={`Download ${ebook.title}`}
                >
                  <FaDownload className="text-xl" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Ebooks;
