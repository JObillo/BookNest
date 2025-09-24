import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Input } from "@/components/ui/input";
import { FaDownload, FaPlus } from "react-icons/fa";
import { Select } from "@headlessui/react";

export type Ebook = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  year: string;
  cover: string | null;
  file_url: string;
  description?: string;
};

// Helper function to generate numeric ID from string
function generateIdFromString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export default function Ebooks() {
  const [search, setSearch] = useState("");
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);

  // Fetch ebooks from Open Library
  const fetchEbooks = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      const data = await res.json();

      const books: Ebook[] = [];

      for (const doc of data.docs) {
        if (!doc.ia || doc.ia.length === 0) continue;
        const iaId = doc.ia[0];

        try {
          const iaRes = await fetch(`https://archive.org/metadata/${iaId}`);
          const iaData = await iaRes.json();

          const files = iaData.files || [];
          const pdfFile = files.find(
            (file: any) =>
              file.name?.endsWith(".pdf") &&
              file.format?.toLowerCase().includes("pdf")
          );

          if (!pdfFile) continue;

          const description = doc.first_sentence
            ? typeof doc.first_sentence === "string"
              ? doc.first_sentence
              : doc.first_sentence.join(" ")
            : doc.subtitle || "No description available.";

          books.push({
            id: generateIdFromString(doc.key.replace(/\//g, "")),
            title: doc.title,
            author: doc.author_name ? doc.author_name.join(", ") : "Unknown",
            publisher: doc.publisher ? doc.publisher[0] : "Unknown",
            year: doc.first_publish_year ? String(doc.first_publish_year) : "Unknown",
            cover: doc.cover_i
              ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
              : null,
            file_url: `https://archive.org/download/${iaId}/${pdfFile.name}`,
            description,
          });
        } catch (err) {
          console.warn(`Failed metadata for ${iaId}:`, err);
        }
      }

      setEbooks(books);
    } catch (error) {
      console.error("Failed to fetch ebooks:", error);
      setEbooks([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEbooks("classic literature");
  }, [limit]);

  // Admin function to fetch a single ebook and add to list
  const handleAddEbook = async () => {
    const query = prompt("Enter book title or author to fetch:");
    if (!query) return;

    setLoading(true);
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await res.json();
      const doc = data.docs[0];
      if (!doc || !doc.ia || doc.ia.length === 0) {
        alert("No downloadable PDF found for this book.");
        setLoading(false);
        return;
      }

      const iaId = doc.ia[0];
      const iaRes = await fetch(`https://archive.org/metadata/${iaId}`);
      const iaData = await iaRes.json();
      const files = iaData.files || [];
      const pdfFile = files.find(
        (file: any) =>
          file.name?.endsWith(".pdf") &&
          file.format?.toLowerCase().includes("pdf")
      );

      if (!pdfFile) {
        alert("No PDF available for this book.");
        setLoading(false);
        return;
      }

      const description = doc.first_sentence
        ? typeof doc.first_sentence === "string"
          ? doc.first_sentence
          : doc.first_sentence.join(" ")
        : doc.subtitle || "No description available.";

      const newEbook: Ebook = {
        id: generateIdFromString(doc.key.replace(/\//g, "")),
        title: doc.title,
        author: doc.author_name ? doc.author_name.join(", ") : "Unknown",
        publisher: doc.publisher ? doc.publisher[0] : "Unknown",
        year: doc.first_publish_year ? String(doc.first_publish_year) : "Unknown",
        cover: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : null,
        file_url: `https://archive.org/download/${iaId}/${pdfFile.name}`,
        description,
      };

      setEbooks((prev) => [newEbook, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch book.");
    }
    setLoading(false);
  };

  // Filter ebooks by title or author
  const filteredEbooks = ebooks.filter(
    (ebook) =>
      ebook.title.toLowerCase().includes(search.toLowerCase()) ||
      ebook.author.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredEbooks.length / itemsPerPage);
  const paginatedEbooks = filteredEbooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AppLayout breadcrumbs={[{ title: "Manage e-books", href: "/ebooks" }]}>
      <Head title="E-books" />
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">E-books</h1>

        <div className="flex gap-4 items-center">
          <Input
            placeholder="Search by title or author..."
            className="w-full max-w-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button
            onClick={handleAddEbook}
            className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaPlus /> Add e-book
          </button>
          <div>
            <label className="mr-2 font-semibold">Fetch Limit:</label>
            <Select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              {[10, 20, 30, 40, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {loading && <p className="text-gray-500 mt-4">Loading...</p>}

        <div className="grid grid-cols-12 bg-purple-900 text-white font-semibold px-4 py-2 rounded mt-4">
          <div className="col-span-10">BOOK INFORMATION</div>
          <div className="col-span-2 text-center">DOWNLOAD</div>
        </div>

        <div className="space-y-4">
          {paginatedEbooks.length === 0 && !loading && (
            <p className="text-center text-gray-500 mt-4">
              {search.trim()
                ? "No e-books match your search."
                : "No e-books available."}
            </p>
          )}

          {paginatedEbooks.map((ebook) => (
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
                  by {ebook.author}
                  <br />
                  published in {ebook.year}
                  <br />
                  publisher: {ebook.publisher}
                </p>
                <p className="text-sm text-gray-600">{ebook.description}</p>
              </div>
              <div className="col-span-2 flex items-center justify-center gap-4 mt-4">
                <a
                  href={ebook.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-700 hover:text-purple-900"
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
                  currentPage === i + 1
                    ? "bg-purple-700 text-white"
                    : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
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
}
