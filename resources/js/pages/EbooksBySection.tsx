import { useEffect, useState, useCallback } from "react";
import { Head, Link } from "@inertiajs/react";
import { Select } from "@headlessui/react";
import { FaDownload, FaHome } from "react-icons/fa";

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

  // pagination
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 10;

  const fetchEbooks = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/mobile/ebooks?page=${pageNum}&perPage=${perPage}&search=${encodeURIComponent(
          search
        )}&filter=${searchCategory}`
      );

      const data = await res.json();

      // expected Laravel pagination keys
      setEbooks(data.data ?? []);
      setPage(data.current_page ?? 1);
      setLastPage(data.last_page ?? 1);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error("Error fetching ebooks:", err);
      setEbooks([]);
    }
    setLoading(false);
  }, [search, searchCategory]);

  // trigger fetch when search/filter changes
  useEffect(() => {
    fetchEbooks(1);
  }, [search, searchCategory, fetchEbooks]);

  // Generate numeric pagination with dots for skipped pages
  const getPageNumbers = (current: number, last: number) => {
    const delta = 2; // how many pages to show around current
    const range: (number | string)[] = [];
    let l: number =0;

    for (let i = 1; i <= last; i++) {
      if (i === 1 || i === last || (i >= current - delta && i <= current + delta)) {
        if (l && i - l !== 1) {
          range.push("...");
        }
        range.push(i);
        l = i;
      }
    }
    return range;
  };

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
        </div>

        {/* Section Name */}
        <div className="mt-8 px-2 sm:px-6">
          <h1 className="font-bold text-2xl royalPurple text-left">
            Free ebooks
          </h1>
        </div>

        {/* Home & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-start gap-3 mt-4 px-2 sm:px-6 flex-wrap sm:flex-nowrap">
          <Link
            href={route("home")}
            className="px-4 py-2 bg-purple-900 text-white inline-flex items-center gap-2 font-bold rounded-lg hover:bg-purple-900 transform hover:scale-105 transition"
          >
            <FaHome /> Home
          </Link>

          {/* Search & Category */}
          <div className="flex gap-2 w-full sm:w-auto mb-5 mt-6">
            <Select
              className="border border-black rounded px-2 py-2 shadow-sm focus:outline-none focus:ring focus:border-black w-32"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value as "title" | "author")}
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
            </Select>

            <input
              className="border border-black rounded px-2 py-2 shadow-sm focus:outline-none focus:ring focus:border-black w-100"
              placeholder={`Search by ${searchCategory}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Total eBooks */}
        <p className="text-gray-700 mb-4">
          Total eBooks available: <span className="font-semibold">{total}</span>
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
                {ebooks.map((ebook) => (
                  <tr key={ebook.id} className="border-b hover:bg-gray-100">
                    <td className="p-3">
                      {ebook.cover ? (
                        <img
                          src={ebook.cover}
                          alt={ebook.title}
                          className="w-20 h-28 object-cover rounded shadow"
                        />
                      ) : (
                        <span className="text-gray-500">No Cover</span>
                      )}
                    </td>
                    <td className="p-3 font-semibold">{ebook.title}</td>
                    <td className="p-3">
                      <a
                        href={`https://www.google.com/search?tbm=bks&q=${encodeURIComponent(
                          ebook.author
                        )}`}
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
                        className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm flex items-center gap-1 w-28 justify-center"
                      >
                        <FaDownload /> Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Numeric Pagination */}
            <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
              {/* Previous */}
              <button
                disabled={page <= 1}
                onClick={() => fetchEbooks(page - 1)}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                &lt;
              </button>

              {/* Page Numbers */}
              {getPageNumbers(page, lastPage).map((p, idx) =>
                p === "..." ? (
                  <span key={idx} className="px-3 py-1">
                    ...
                  </span>
                ) : (
                  <button
                    key={idx}
                    onClick={() => fetchEbooks(Number(p))}
                    className={`px-3 py-1 rounded ${
                      p === page
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              {/* Next */}
              <button
                disabled={page >= lastPage}
                onClick={() => fetchEbooks(page + 1)}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        )}

        {!loading && ebooks.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No eBooks found.</p>
        )}
      </div>
    </>
  );
}
