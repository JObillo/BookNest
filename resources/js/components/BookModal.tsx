import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import {Toaster, toast} from "sonner";

interface Book {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  book_copies: number;
  call_number: string;
  book_cover?: string;
}

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  book?: Book | null;
}

export default function BookFormModal({ isOpen, closeModal, book }: Props) {
  const [formData, setFormData] = useState<Book>({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    book_copies: 0,
    call_number: "",
    book_cover: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  // Set initial form data and preview when the book is passed
  useEffect(() => {
    if (isOpen) {
      if (book) {
        setFormData({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          publisher: book.publisher,
          book_copies: book.book_copies,
          call_number: book.call_number,
          book_cover: book.book_cover || "",
        });
        setPreview(book.book_cover || "");
        setSelectedFile(null);
      } else {
        setFormData({
          title: "",
          author: "",
          isbn: "",
          publisher: "",
          book_copies: 1,
          call_number: "",
          book_cover: "",
        });
        setPreview("");
        setSelectedFile(null);
      }
    }
  }, [isOpen, book]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("author", formData.author);
    data.append("isbn", formData.isbn);
    data.append("publisher", formData.publisher);
    data.append("book_copies", String(formData.book_copies));
    data.append("call_number", formData.call_number);

    if (selectedFile) {
      data.append("book_cover", selectedFile);
    }

    //Toast Notifications
    const succesMessage = book?.id ? "Book updated successfully." : "Book Added successfully.";
    const errorMessage = book?.id ? "Failed to update book." : "Failed to add book.";

    if (book?.id) {
      data.append("_method", "PUT"); // Method override for update
      router.post(`/books/${book.id}`, data, {
        onSuccess: () => {
            toast.success(succesMessage);
            closeModal();
            router.reload();
        },
        onError: (errors) => {
            toast.error(errorMessage);
            console.error(errors.message || "Failed to submit book.");
        },
      });
    } else {
      router.post("/books", data, {
        onSuccess: () => {
            toast.success(succesMessage);
            closeModal();
            router.reload();
        },
        onError: (errors) => {
            toast.error(errorMessage);
            console.error(errors.message || "Failed to submit book.");
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
        <h2 className="text-lg font-semibold mb-4">{book ? "Edit Book" : "Add Book"}</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Book Title */}
          <div className="mb-3">
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          
          {/* Book Author */}
          <div className="mb-3">
            <label className="block text-sm font-medium">Author</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>

          {/* Book ISBN */}
          <div className="mb-3">
            <label className="block text-sm font-medium">ISBN</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>

          {/* Publisher */}
          <div className="mb-3">
            <label className="block text-sm font-medium">Publisher</label>
            <input
              type="text"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>

          {/* Book Copies */}
          <div className="mb-3">
            <label className="block text-sm font-medium">Book Copies</label>
            <input
              type="number"
              name="book_copies"
              value={formData.book_copies}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>

          {/* Call Number */}
          <div className="mb-3">
            <label className="block text-sm font-medium">Call Number</label>
            <input
              type="text"
              name="call_number"
              value={formData.call_number}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>

          {/* Book Cover Image */}
          <div className="mb-3">
            <label className="block text-sm font-medium">Book Cover (optional)</label>
            <input
              type="file"
              name="book_cover"
              onChange={handleFileChange}
              className="w-full"
              accept="image/*"
            />
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="mb-3">
              <p className="text-sm mb-1">Image Preview:</p>
              <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded" />
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {book ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
