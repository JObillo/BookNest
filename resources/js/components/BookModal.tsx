import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Select } from "@headlessui/react";

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
  description?: string;
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
    description: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  //validation and setting form data if editing
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
          description: book.description || "", 
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
          description: "", 
        });
        setPreview("");
        setSelectedFile(null);
      }
    }
  }, [isOpen, book]);

  const validateField = (name: string, value: string) => {
    let error = "";

    if (name === "isbn") {
      if (!/^\d{13}$/.test(value)) {
        error = "ISBN must be exactly 13 digits.";
      }
    }

    if (name === "accession_number") {
      if (value && !/^\d+$/.test(value)) {
        error = "Accession Number must contain only numbers.";
      }
    }

    if (name === "call_number") {
      if (value && !/^[A-Za-z\d .\-\/]+$/.test(value)) {
        error =
          "Call Number can contain letters, numbers, spaces, dots (.), - or / only.";
      }
    }


    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

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
        : name === "description" 
          ? "" 
          : undefined,
    }));

    validateField(name, value);
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

    // Final validation before submission
    const validationErrors: { [key: string]: string } = {};

    ["isbn", "accession_number", "call_number"].forEach((field) => {
      const error = validateField(field, (formData as any)[field] || "");
      if (error) validationErrors[field] = error;
    });

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    if (!formData.section_id) {
    validationErrors.section_id = "Section is required.";
    }
    if (!formData.dewey_id) {
      validationErrors.dewey_id = "Dewey classification is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix validation errors before submitting.");
      return;
    }

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
    data.append("description", formData.description !== undefined ? formData.description : "");

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
        onError: (errors) => {
          console.error("Update errors:", errors);
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
        onError: (errors) => {
          console.error("Create errors:", errors);
          toast.error(errorMessage);
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center border border-black rounded-lg overflow-y-auto bg-black/50 z-50">
      <div className="relative w-full max-w-4xl mx:auto p-8 bg-white rounded-md shadow-xl transition-all">
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
            { label: "Place of Publication", name: "publication_place" },
          ].map(({ label, name }) => (
            <div className="mb-3" key={name}>
              <label className="block text-sm font-medium">{label}</label>
              <Input
                type="text"
                name={name}
                value={(formData as any)[name] || ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required={["title", "author", "isbn", "publisher", "call_number"].includes(name)}
              />
              {errors[name] && (
                  <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
                )}
            </div>
          ))}

          <div className="mb-3">
            <label className="block text-sm font-medium">Book Copies</label>
            <Input
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
            <label className="block text-sm font-medium">Copyright Year</label>
            <Input
              type="date"
              name="year"
              value={formData.year || ""}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Book Cover</label>
            <Input
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
            <Select
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
            </Select>
            {errors.section_id && (
              <p className="text-xs text-red-500 mt-1">{errors.section_id}</p>
            )}
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Dewey ID</label>
            <Select
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
            </Select>
            {errors.dewey_id && (
              <p className="text-xs text-red-500 mt-1">{errors.dewey_id}</p>
            )}
          </div>

          <div className="mb-3 md:col-span-3">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="Enter book description..."
              rows={1}
            ></textarea>
          </div>

          <div className="mt-6 flex flex-col-reverse md:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={closeModal}
              className="w-full md:w-auto py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full md:w-auto py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer"
            >
              {book ? "Update" : "Add"} Book
            </button>
          </div>

          </div>
        </form>
      </div>
      
    </div>
  );
}