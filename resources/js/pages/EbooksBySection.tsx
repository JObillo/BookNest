import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Select } from "@headlessui/react";
import { FaDownload, FaHome } from "react-icons/fa";
import { Link } from '@inertiajs/react';

type Ebook = {
  id: number;
  title: string;
  author: string;
  cover?: string;
  year?: string;
  file_url?: string;
};

export default function EbooksBySection() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchCategory, setSearchCategory] = useState<"title" | "author">("title");
  const [startYear, setStartYear] = useState<string>("");
  const [endYear, setEndYear] = useState<string>("");

  const fetchEbooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        searchBy: searchCategory,
        startYear,
        endYear,
      });

      const res = await fetch(`/api/ebooks?${params.toString()}`);
      const data = await res.json();
      setEbooks(data.data ?? []);
    } catch (err) {
      console.error(err);
      setEbooks([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEbooks();
  }, [search, searchCategory, startYear, endYear]);

  return (
    <>
      <Head title="Student eBooks" />
      <div className="p-6">
        <header className="fixed top-0 left-0 z-50 w-full flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-4 bg-white shadow-md">
          <img src="/philcstlogo.png" alt="Library Logo" className="h-10" />
        </header>

        <div className="mt-20 text-center">
          <h1 className="lilitaOneFont royalPurple text-2xl sm:text-3xl font-bold">
            Welcome to Online Public Access Catalog
          </h1>
          <p className="lilitaOneFont royalPurple text-md sm:text-lg font-semibold">
            PhilCST Library: Your Gateway to Knowledge and Discovery
          </p>
          <div className="flex items-center space-x-2 justify-center mt-2">
            <Link href={route("home")} className="text-black text-xl sm:text-2xl hover:text-purple-900">
              <FaHome />
            </Link>
            <h1 className="font-bold text-xl">Ebooks For Student</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto mb-5 mt-6 items-center">
          <Select
            className="border rounded px-2 py-1 text-sm text-gray-700"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value as "title" | "author")}
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
          </Select>

          <Input
            className="border rounded px-2 py-1 w-full sm:w-64 placeholder-italic"
            placeholder={`Search by ${searchCategory}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Input
            className="border rounded px-2 py-1 w-20 placeholder-italic"
            placeholder="Start Year"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
          />

          <Input
            className="border rounded px-2 py-1 w-20 placeholder-italic"
            placeholder="End Year"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
          />
        </div>

        {/* Total eBooks */}
        <p className="text-gray-700 mb-4">
          Total eBooks available: <span className="font-semibold">{ebooks.length}</span>
        </p>

        {loading && <p className="text-gray-500 text-center">Loading...</p>}

        {!loading && ebooks.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
              <thead>
                <tr className="bg-purple-900 text-white border-b">
                  {["Cover", "Title", "Author", "Year", "Download"].map((h) => (
                    <th key={h} className="border p-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ebooks.map((ebook) => {
                  const yearNum = Number(ebook.year);
                  if (
                    (startYear && yearNum < Number(startYear)) ||
                    (endYear && yearNum > Number(endYear))
                  ) return null; // filter by year

                  return (
                    <tr key={ebook.id} className="border-b hover:bg-gray-100">
                      <td className="p-3">
                        {ebook.cover ? (
                          <img src={ebook.cover} alt={ebook.title} className="w-20 h-28 object-cover rounded shadow" />
                        ) : (
                          <span className="text-gray-500">No Cover</span>
                        )}
                      </td>
                      <td className="p-3 font-semibold">{ebook.title}</td>
                      <td className="p-3">
                        <a
                          href={`https://www.google.com/search?tbm=bks&q=${encodeURIComponent(ebook.author)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {ebook.author}
                        </a>
                      </td>
                      <td className="p-3">{ebook.year ?? "Unknown"}</td>
                      <td className="p-3">
                        <a
                          href={ebook.file_url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm flex items-center gap-1"
                        >
                          <FaDownload /> Download
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && ebooks.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No eBooks found.</p>
        )}
      </div>
    </>
  );
}
