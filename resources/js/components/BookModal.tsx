import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Toaster, toast } from "sonner";

type Book = {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  book_copies: number;
  accession_number?: string;
  call_number: string;
  year?: string;
  publication_place?: string;
  book_cover?: string;
  section_id?: number;
  dewey_id?: number;
};

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  book: Book | null;
  sections: { id: number; section_name: string }[];
  deweys: { id: number; dewey_classification: string }[];
}

export default function BookModal({
  isOpen,
  closeModal,
  book,
  sections = [],
  deweys = [],
}: Props) {
  const [formData, setFormData] = useState<Book>({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    book_copies: 1,
    accession_number: "",
    call_number: "",
    year: "",
    publication_place: "",
    book_cover: "",
    section_id: undefined,
    dewey_id: undefined,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      if (book) {
        setFormData({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          publisher: book.publisher,
          book_copies: book.book_copies,
          accession_number: book.accession_number || "",
          call_number: book.call_number,
          year: book.year || "",
          publication_place: book.publication_place || "",
          book_cover: book.book_cover || "",
          section_id: book.section_id,
          dewey_id: book.dewey_id,
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
          accession_number: "",
          call_number: "",
          year: "",
          publication_place: "",
          book_cover: "",
          section_id: undefined,
          dewey_id: undefined,
        });
        setPreview("");
        setSelectedFile(null);
      }
    }
  }, [isOpen, book]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
        ? name === "section_id" || name === "dewey_id"
          ? parseInt(value, 10)
          : name === "book_copies"
          ? Number(value)
          : value
        : undefined,
    }));
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
    data.append("accession_number", formData.accession_number || "");
    data.append("call_number", formData.call_number);
    data.append("year", formData.year || "");
    data.append("publication_place", formData.publication_place || "");
    data.append("section_id", String(formData.section_id || ""));
    data.append("dewey_id", String(formData.dewey_id || ""));

    if (selectedFile) {
      data.append("book_cover", selectedFile);
    }

    const successMessage = book?.id ? "Book updated successfully." : "Book added successfully.";
    const errorMessage = book?.id ? "Failed to update book." : "Failed to add book.";

    if (book?.id) {
      data.append("_method", "PUT");
      router.post(`/books/${book.id}`, data, {
        onSuccess: () => {
          toast.success(successMessage);
          closeModal();
          router.reload();
        },
        onError: () => {
          toast.error(errorMessage);
        },
      });
    } else {
      router.post("/books", data, {
        onSuccess: () => {
          toast.success(successMessage);
          closeModal();
          router.reload();
        },
        onError: () => {
          toast.error(errorMessage);
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center   z-50 p-4">
      <div className="relative w-full max-w-4xl mx:auto p-8  bg-white rounded-md shadow-xl transition-all">
        <h2 className="text-lg font-semibold mb-4">{book ? "Edit Book" : "Add Book"}</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> 
          {[
            { label: "Title", name: "title" },
            { label: "Author", name: "author" },
            { label: "ISBN", name: "isbn" },
            { label: "Publisher", name: "publisher" },
            { label: "Accession Number", name: "accession_number" },
            { label: "Call Number", name: "call_number" },
            { label: "Publication Place", name: "publication_place" },
          ].map(({ label, name }) => (
            <div className="mb-3" key={name}>
              <label className="block text-sm font-medium">{label}</label>
              <input
                type="text"
                name={name}
                value={(formData as any)[name] || ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required={["title", "author", "isbn", "publisher", "call_number"].includes(name)}
              />
            </div>
          ))}

          <div className="mb-3">
            <label className="block text-sm font-medium">Book Copies</label>
            <input
              type="number"
              name="book_copies"
              value={formData.book_copies}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
              min={1}
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Year</label>
            <input
              type="date"
              name="year"
              value={formData.year || ""}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Book Cover</label>
            <input
              type="file"
              name="book_cover"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full border rounded p-2"
            />
            {preview && (
              <img
                src={preview}
                alt="Book cover preview"
                className="mt-2 w-20 h-28 object-cover"
              />
            )}
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Section</label>
            <select
              name="section_id"
              value={formData.section_id || ""}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="">Select Section</option>
              {sections.length > 0 ? (
                sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.section_name}
                  </option>
                ))
              ) : (
                <option disabled>No sections available</option>
              )}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Dewey ID</label>
            <select
              name="dewey_id"
              value={formData.dewey_id || ""}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="">Select Dewey</option>
              {deweys.length > 0 ? (
                deweys.map((dewey) => (
                  <option key={dewey.id} value={dewey.id}>
                    {dewey.dewey_classification}
                  </option>
                ))
              ) : (
                <option disabled>No Dewey classifications available</option>
              )}
            </select>
          </div>
          {/* <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded"> */}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
            >
              {book ? "Update" : "Add"} Book
            </button>
          </div>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
}

//original code 3
