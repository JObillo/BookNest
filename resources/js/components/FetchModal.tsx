import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";

interface FetchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ebook: any) => void; // callback to parent
}

interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    imageLinks?: { thumbnail?: string };
    infoLink?: string;
  };
  accessInfo?: { pdf?: { downloadLink?: string } };
}

export default function FetchModal({ isOpen, onClose, onSubmit }: FetchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(false);

  const searchBooks = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data.items || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch books");
    }
    setLoading(false);
  };

  const handleAddBook = async (book: GoogleBook) => {
    const title = book.volumeInfo.title;
    const author = book.volumeInfo.authors?.join(", ") || "Unknown";
    const publisher = book.volumeInfo.publisher || "";
    const year = book.volumeInfo.publishedDate || "";
    const file_url = book.accessInfo?.pdf?.downloadLink || book.volumeInfo.infoLink || "";
    const cover = book.volumeInfo.imageLinks?.thumbnail || "";

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("publisher", publisher);
    formData.append("year", year);
    formData.append("file_url", file_url);
    formData.append("cover", cover);

    router.post("/ebooks", formData, {
      onSuccess: (response: any) => {
        onSubmit(response.props || response); // pass created ebook to parent
        onClose();
      },
      onError: (errors) => {
        console.error(errors);
        alert("Failed to add ebook");
      },
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-xl rounded bg-white p-6">
          <Dialog.Title className="font-bold text-lg mb-4">
            Fetch from Google Books
          </Dialog.Title>

          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search for books"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button onClick={searchBooks}>Search</Button>
          </div>

          {loading && <p>Loading...</p>}

          <div className="max-h-96 overflow-y-auto">
            {results.map((book) => (
              <div
                key={book.id}
                className="flex gap-2 p-2 border-b items-center justify-between"
              >
                <div className="flex gap-2 items-center">
                  <img
                    src={book.volumeInfo.imageLinks?.thumbnail || "/placeholder-book.png"}
                    alt={book.volumeInfo.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{book.volumeInfo.title}</h3>
                    <p className="text-sm">{book.volumeInfo.authors?.join(", ")}</p>
                  </div>
                </div>
                <Button onClick={() => handleAddBook(book)}>Add</Button>
              </div>
            ))}
            {!loading && results.length === 0 && <p>No books found.</p>}
          </div>

          <div className="mt-4 text-right">
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
