import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { FaDownload, FaHome } from "react-icons/fa";
import { Link } from "@inertiajs/react";

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

// Helper to generate numeric ID from string
declare global {
  interface String {
    hashCode(): number;
  }
}
String.prototype.hashCode = function (): number {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    hash = (hash << 5) - hash + this.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export default function EbooksBySection({ limit }: { limit: number }) {
  const [search, setSearch] = useState("");
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEbooks("classic literature");
  }, [limit]); // refetch when limit changes

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
            id: doc.key.split("/").join("").hashCode(),
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

  // Filter by search (same as before)
  const filteredEbooks = ebooks.filter(
    (ebook) =>
      ebook.title.toLowerCase().includes(search.toLowerCase()) ||
      ebook.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head title="Student eBooks" />
      <div className="p-6">
        {/* Header */}
        <header className="fixed top-0 left-0 z-50 w-full flex justify-between items-center px-4 sm:px-8 py-4 bg-white shadow-md">
          <img src="/philcstlogo.png" alt="Library Logo" className="h-10" />
        </header>

        <div className="mt-20 text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-700">
            Welcome to Online Public Access Catalog
          </h1>
          <p className="text-md sm:text-lg text-gray-700">
            Search and download free eBooks available for students
          </p>
          <div className="flex items-center gap-2 justify-center mt-2">
            <Link
              href={route("home")}
              className="flex items-center gap-2 text-black hover:text-purple-900"
            >
              <FaHome className="text-xl" />
              <span className="font-bold text-xl">E-Books</span>
            </Link>
          </div>

          {/* Search */}
          <Input
            className="border rounded px-2 py-1 w-full max-w-md mt-4"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Loading */}
        {loading && <p className="text-gray-500 text-center">Loading eBooks...</p>}

        {/* Display number of downloadable eBooks */}
        {!loading && filteredEbooks.length > 0 && (
          <p className="text-center text-gray-700 mb-2">
            {filteredEbooks.length} downloadable eBook
            {filteredEbooks.length !== 1 && "s"} available
          </p>
        )}

        {/* Table */}
        {!loading && filteredEbooks.length > 0 && (
          <div className="overflow-x-auto mt-2">
            <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
              <thead>
                <tr className="bg-purple-900 text-white border-b">
                  {["Cover", "Title", "Author", "Year", "Download"].map((header) => (
                    <th key={header} className="border p-3 text-left">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEbooks.map((ebook) => (
                  <tr key={ebook.id} className="border-b hover:bg-gray-100">
                    <td className="p-3">
                      <img
                        src={ebook.cover || "/placeholder-book.png"}
                        alt={ebook.title}
                        className="w-20 h-28 object-cover rounded"
                      />
                    </td>
                    <td className="p-3">{ebook.title}</td>
                    <td className="p-3">{ebook.author}</td>
                    <td className="p-3">{ebook.year}</td>
                    <td className="p-3">
                      <a
                        href={ebook.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm"
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No eBooks */}
        {!loading && filteredEbooks.length === 0 && (
          <p className="text-gray-500 text-center mt-4">
            No eBooks available or match your search.
          </p>
        )}
      </div>
    </>
  );
}
