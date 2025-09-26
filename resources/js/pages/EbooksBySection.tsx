import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import { Input } from "@/components/ui/input";

type Ebook = {
  id: number;
  title: string;
  author: string;
  cover?: string;
  year?: string;
  file_url?: string;
};

type Props = {
  limit: number; // comes from admin
};

export default function EbooksBySection({ limit }: Props) {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  

  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    const fetchEbooks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/ebooks?page=${currentPage}&perPage=${limit}&search=${search}`);
        const data = await res.json();
        setEbooks(data.data ?? []);
        setTotal(data.total ?? 0);
      } catch {
        setEbooks([]);
        setTotal(0);
      }
      setLoading(false);
    };

    fetchEbooks();
  }, [currentPage, limit, search]);

  return (
    <>
      <Head title="Student eBooks" />
      <div className="p-6">
        <Input
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full max-w-md mb-4"
        />

        {loading && <p className="text-gray-500 text-center">Loading...</p>}

        {!loading && ebooks.length > 0 && (
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
                    <img src={ebook.cover || "/placeholder-book.png"} alt={ebook.title} className="w-20 h-28 object-cover rounded" />
                  </td>
                  <td className="p-3">{ebook.title}</td>
                  <td className="p-3">{ebook.author}</td>
                  <td className="p-3">{ebook.year ?? "Unknown"}</td>
                  <td className="p-3">
                    <a href={ebook.file_url ?? "#"} target="_blank" rel="noopener noreferrer" className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm">
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-300 disabled:opacity-50">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded ${page === currentPage ? "bg-purple-700 text-white" : "bg-gray-200 text-gray-700"}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-300 disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </>
  );
}
