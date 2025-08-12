import { useState } from "react";
import { router } from '@inertiajs/react';
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Input } from "@/components/ui/input";
import { FaDownload } from "react-icons/fa";
import AddEbookModal from "@/components/EbookModal";

type Ebook = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  year: string;
  cover: string;
  file_url: string;
};

interface Props {
  ebooks: Ebook[];
}



export default function Ebooks({ ebooks }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [ebookList, setEbookList] = useState<Ebook[]>(ebooks);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredEbooks = ebookList.filter((ebook) =>
    ebook.title?.toLowerCase().includes(search.toLowerCase())
  );
  const handleDeleteEbook = (id: number) => {
  if (confirm("Are you sure you want to delete this e-book?")) {
    router.delete(`/ebooks/${id}`, {
      onSuccess: () => {
        setEbookList(ebookList.filter((ebook) => ebook.id !== id));
      },
      onError: (errors) => {
        console.error("Failed to delete:", errors);
        alert("Something went wrong while deleting the e-book.");
      },
    });
  }
};


  const handleAddEbook = (newEbook: Ebook) => {
    setEbookList([...ebookList, newEbook]);
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
        </div>

        <div className="flex gap-4 items-center">
          <Input
            placeholder="Quick Search"
            className="w-full max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-12 bg-purple-900 text-white font-semibold px-4 py-2 rounded">
          <div className="col-span-10">BOOK INFORMATION</div>
          <div className="col-span-2 text-center">DOWNLOAD</div>
        </div>

        <div className="space-y-4">
          {filteredEbooks.map((ebook) => (
            <div
              key={ebook.id}
              className="grid grid-cols-12 items-center bg-white rounded shadow p-4 hover:bg-gray-50"
            >
              <div className="col-span-1">
                <img
                  src={`/storage/${ebook.cover}`}
                  alt="E-book cover"
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

        <AddEbookModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddEbook}
        />
      </div>
    </AppLayout>
  );
}
