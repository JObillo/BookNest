import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { FaDownload } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Select } from "@headlessui/react";

export type Ebook = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  file_url: string;
  cover: string;
  year?: string;
};

const Ebooks = () => {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState<"title" | "author">("title");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");

  const fetchEbooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        searchBy,
        startYear,
        endYear,
      });

      const res = await fetch(`/api/ebooks?${params.toString()}`);
      const data = await res.json();
      setEbooks(data.data);
    } catch (err) {
      console.error("Failed to fetch ebooks:", err);
      setEbooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEbooks();
  }, [search, searchBy, startYear, endYear]);

  return (
    <AppLayout>
      <Head title="E-books" />
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">E-books</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Select
            value={searchBy}
            onChange={(e) =>
              setSearchBy(e.target.value as "title" | "author")
            }
            className="border rounded px-2 py-1"
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
          </Select>

          <Input
            placeholder={`Search by ${searchBy}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-2 py-1"
          />

          <Input
            type="number"
            placeholder="Start Year"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            className="border rounded px-2 py-1 w-24"
          />

          <Input
            type="number"
            placeholder="End Year"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            className="border rounded px-2 py-1 w-24"
          />
        </div>

        {/* Loading */}
        {loading && <p className="text-gray-500 mt-2">Loading ebooks...</p>}

        {/* Ebook list */}
        <div className="space-y-4 mt-4">
          {ebooks.length === 0 && !loading && (
            <p className="text-center text-gray-500">No e-books found.</p>
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
                  publisher: {ebook.publisher} <br />
                  year: {ebook.year ?? "Unknown"}
                </p>
              </div>
              <div className="col-span-2 flex items-center justify-center mt-4">
                <a
                  href={ebook.file_url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaDownload className="text-xl" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Ebooks;
