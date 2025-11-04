import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Input } from "@/components/ui/input";
import { type BreadcrumbItem } from '@/types';

export type Ebook = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  file_url: string;
  cover: string;
};
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Ebooks', href: '/ebooks' },
];

const Ebooks = () => {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(5);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [query, setQuery] = useState("classic literature");

  // 🆕 For manual adding
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    cover: null as File | null,
    file: null as File | null,
  });

  const totalPages = Math.ceil(total / perPage);

  const fetchEbooks = async () => {
    try {
      const params = new URLSearchParams({
        perPage: perPage.toString(),
        page: currentPage.toString(),
        search: search,
      });
      const res = await fetch(`/api/ebooks?${params.toString()}`);
      const data = await res.json();
      setEbooks(data.data);
      setTotal(data.total);
      setCurrentPage(data.current_page);
    } catch (err) {
      console.error("Failed to fetch ebooks:", err);
    }
  };

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
    } catch {
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

  // 🆕 Submit new eBook
  const handleAddEbook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.author || !formData.publisher) {
      setStatusMsg("⚠️ Please fill all required fields.");
      return;
    }

    const form = new FormData();
    form.append("title", formData.title);
    form.append("author", formData.author);
    form.append("publisher", formData.publisher);
    if (formData.cover) form.append("cover", formData.cover);
    if (formData.file) form.append("file", formData.file);

    try {
      const res = await fetch("/api/ebooks/store", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMsg("✅ eBook added successfully!");
        setShowModal(false);
        setFormData({ title: "", author: "", publisher: "", cover: null, file: null });
        fetchEbooks();
      } else {
        setStatusMsg(`❌ ${data.message || "Failed to add eBook."}`);
      }
    } catch (err) {
      setStatusMsg("❌ Server error while adding eBook.");
    }
  };

  useEffect(() => {
    fetchEbooks();
  }, [currentPage, search, perPage]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="E-books" />
      <div className="p-6 space-y-4 bg-white rounded shadow-md">
        {statusMsg && (
          <div className="p-2 bg-yellow-100 text-yellow-800 rounded">
            {statusMsg}
          </div>
        )}

        {/* Search + Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={handleSearchChange}
            className="w-full max-w-md border border-gray-300"
          />

          <div className="flex gap-2">
            {/* <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700"
            >
              <FaPlus /> Add eBook Manual
            </button> */}

            <button
              onClick={fetchNewEbooks}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Fetch 100 New
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 bg-purple-800 text-white font-semibold px-4 py-2 rounded">
          <div className="col-span-10">BOOK INFORMATION</div>
          {/* <div className="col-span-2 text-center">DOWNLOAD</div> */}
        </div>

        {/* Ebooks list */}
        <div className="space-y-4">
          {ebooks.length === 0 ? (
            <p className="text-center text-gray-500 mt-4">No e-books available.</p>
          ) : (
            ebooks.map((ebook) => (
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
                {/* <div className="col-span-2 flex items-center justify-center mt-4">
                  <a
                    href={ebook.file_url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                    aria-label={`Download ${ebook.title}`}
                  >
                    <FaDownload className="text-xl" />
                  </a>
                </div> */}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 px-4 py-3 text-sm text-gray-700 bg-gray-100 rounded">
            <span>
              Page {currentPage} of {totalPages} — showing {ebooks.length} eBook
              {ebooks.length !== 1 && "s"}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>

              <span className="px-3 py-1 bg-purple-700 text-white rounded">
                {currentPage}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🆕 Modal for adding eBook */}
      {showModal && (
        <div className="fixed inset-0  bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">Add New eBook</h2>
            <form onSubmit={handleAddEbook} className="space-y-3">
              <Input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Input
                type="text"
                placeholder="Author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
              />
              <Input
                type="text"
                placeholder="Publisher"
                value={formData.publisher}
                onChange={(e) =>
                  setFormData({ ...formData, publisher: e.target.value })
                }
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cover Image
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, cover: e.target.files?.[0] || null })
                  }
                  className="w-full mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  eBook File (PDF)
                </label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files?.[0] || null })
                  }
                  className="w-full mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save eBook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Ebooks;
