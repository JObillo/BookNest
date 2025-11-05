import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Select } from "@headlessui/react";
import { Loader2 } from "lucide-react"; // 👈 added spinner icon

type Book = {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  book_copies: number;
  call_number: string;
  year?: string;
  publication_place?: string;
  book_cover?: string;
  section_id?: number;
  dewey_id?: number;
  description?: string;
  subject?: string;
  date_purchase?: string;
  book_price?: string;
  other_info?: string;
  copies?: { accession_number: string }[]; // Important for editing
};

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  book: Book | null;
  sections: { id: number; section_name: string }[];
  deweys: { id: number; dewey_classification: string }[];
}
const ErrorModal = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
    <div className="bg-white rounded-md p-6 w-[400px] text-center shadow-lg">
      <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
      <p className="text-gray-700 mb-4">{message}</p>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Close
      </button>
    </div>
  </div>
);

export default function BookModal({
  isOpen,
  closeModal,
  book,
  sections = [],
  deweys = [],
}: Props) {
  const [formData, setFormData] = useState<Book>({
    isbn: "",
    title: "",
    author: "",
    publisher: "",
    publication_place: "",
    year: "",
    book_copies: 1,
    call_number: "",
    section_id: undefined,
    dewey_id: undefined,
    subject: "",
    date_purchase: "",
    book_price: "",
    other_info: "",
    book_cover: "",
    copies: [],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [accessionNumbers, setAccessionNumbers] = useState<string[]>([""]);
  const [isFetching, setIsFetching] = useState(false); // 👈 spinner control
  const [highlightFields, setHighlightFields] = useState<string[]>([]);

  

  // Populate form when editing a book
  useEffect(() => {
    if (isOpen) {
      if (book) {
        setFormData({
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          publisher: book.publisher,
          publication_place: book.publication_place || "",
          year: book.year || "",
          book_copies: book.book_copies,
          call_number: book.call_number,
          section_id: book.section_id,
          dewey_id: book.dewey_id,
          subject: book.subject || "",
          date_purchase: book.date_purchase || "",
          book_price: book.book_price || "",
          other_info: book.other_info || "",
          book_cover: book.book_cover || "",
          copies: book.copies || [],
        });

        setPreview(book.book_cover || "");
        setSelectedFile(null);

        // Populate accession numbers dynamically
        if (book.copies && book.copies.length > 0) {
          setAccessionNumbers(book.copies.map((copy) => copy.accession_number));
        } else {
          setAccessionNumbers(Array(book.book_copies).fill(""));
        }
      } else {
        // Reset for adding new book
        setFormData({
          isbn: "",
          title: "",
          author: "",
          publisher: "",
          publication_place: "",
          year: "",
          book_copies: 1,
          call_number: "",
          section_id: undefined,
          dewey_id: undefined,
          subject: "",
          date_purchase: "",
          book_price: "",
          other_info: "",
          book_cover: "",
          copies: [],
        });
        setPreview("");
        setSelectedFile(null);
        setAccessionNumbers([""]);
      }
    }
  }, [isOpen, book]);

  const formatIsbn = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}-${digits.slice(3, 4)}-${digits.slice(4)}`;
    if (digits.length <= 12)
      return `${digits.slice(0, 3)}-${digits.slice(3, 4)}-${digits.slice(
        4,
        9
      )}-${digits.slice(9)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 4)}-${digits.slice(
      4,
      9
    )}-${digits.slice(9, 12)}-${digits.slice(12, 13)}`;
  };

  const validateField = (name: string, value: string) => {
    let error = "";

    if (name === "isbn") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length !== 13) {
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

    if (name === "book_price") {
      if (!value || isNaN(Number(value)) || Number(value) < 0) {
        error = "Book Price must be a positive number.";
      }
    }

    if (name === "other_info" && !value) {
      error = "Other info is required.";
    }

    if (name === "subject" && !value) {
      error = "Subject is required.";
    }

    if (name === "date_purchase" && !value) {
      error = "Date of Purchase is required.";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "isbn") {
      newValue = formatIsbn(value);
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]:
        newValue !== ""
          ? name === "section_id" || name === "dewey_id"
            ? parseInt(newValue, 10)
            : name === "book_copies"
            ? Number(newValue)
            : newValue
          : "",
    }));

    if (name === "book_copies") {
      const copies = Number(newValue);
      setAccessionNumbers((prev) => {
        const updated = [...prev];
        if (copies > prev.length) {
          for (let i = prev.length; i < copies; i++) updated.push("");
        } else {
          updated.length = copies;
        }
        return updated;
      });
    }

    validateField(name, newValue);
  };

  const handleAccessionChange = (index: number, value: string) => {
    const updated = [...accessionNumbers];
    updated[index] = value;
    setAccessionNumbers(updated);
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

    const validationErrors: { [key: string]: string } = {};
    ["isbn", "accession_number", "call_number", "book_price", "other_info", "subject", "date_purchase"].forEach(
      (field) => {
        const error = validateField(field, (formData as any)[field] || "");
        if (error) validationErrors[field] = error;
      }
    );

    if (!formData.section_id) validationErrors.section_id = "Section is required.";
    if (!formData.dewey_id) validationErrors.dewey_id = "Dewey classification is required.";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    const data = new FormData();
    data.append("isbn", formData.isbn);
    data.append("title", formData.title);
    data.append("author", formData.author);
    data.append("publisher", formData.publisher);
    data.append("publication_place", formData.publication_place || "");
    data.append("year", formData.year || "");
    data.append("book_copies", String(formData.book_copies));
    data.append("call_number", formData.call_number);
    data.append("section_id", String(formData.section_id || ""));
    data.append("dewey_id", String(formData.dewey_id || ""));
    data.append("subject", formData.subject || "");
    data.append("date_purchase", formData.date_purchase || "");
    data.append("book_price", formData.book_price || "");
    data.append("other_info", formData.other_info || "");

    accessionNumbers.forEach((num, i) => {
      data.append(`accession_numbers[${i}]`, num);
    });

    if (selectedFile) {
      data.append("book_cover", selectedFile);
    }
    else if (formData.book_cover) {
      data.append("book_cover", formData.book_cover);
    }


    const successMessage = book?.id
      ? "Book updated successfully."
      : "Book added successfully.";
    const errorMessage = book?.id
      ? "Failed to update book."
      : "Failed to add book.";

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
    router.post("/books", data, {
  onSuccess: () => {
    toast.success("Book added successfully!");
    closeModal();
    router.reload();
  },
  onError: (errors) => {
    if (errors.accession_numbers) {
      toast.error(errors.accession_numbers);
    } else {
      toast.error("Failed to add book.");
    }
  },
});

  };

  if (!isOpen) return null;
  // Fetch book info from Google Books API using ISBN
const fetchBookByISBN = async (isbn: string) => {
  if (!isbn) return;

  const cleanIsbn = isbn.replace(/\D/g, ""); // remove dashes or spaces
  if (cleanIsbn.length < 10) {
    toast.error("Please enter a valid ISBN.");
    return;
  }

  setIsFetching(true); // 👈 show spinner
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`
    );
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      toast.error("No book found for this ISBN.");
      return;
    }

    const info = data.items[0].volumeInfo;

    // 👇 Build updated form FIRST (to ensure highlight accuracy)
    const updatedForm = {
      ...formData,
      title: info.title || formData.title,
      author: info.authors ? info.authors.join(", ") : formData.author,
      publisher: info.publisher || formData.publisher,
      year: info.publishedDate ? info.publishedDate.slice(0, 4) : formData.year,
      subject: info.categories ? info.categories.join(", ") : formData.subject,
      description: info.description || formData.description,
      book_cover: info.imageLinks?.thumbnail || formData.book_cover,
      other_info:
        `${info.pageCount ? `${info.pageCount} pages` : ""}${
          info.dimensions
            ? `, Size: ${info.dimensions.height || ""} × ${info.dimensions.width || ""}`
            : ""
        }` || formData.other_info,
    };

    // ✅ Now update formData once
    setFormData(updatedForm);

    // 👇 Highlight any still-empty fields AFTER fetch
    const missingFields = Object.entries(updatedForm)
      .filter(([key, value]) => value === "" || value === null)
      .map(([key]) => key);

    setHighlightFields(missingFields);

    // ✅ Update preview and success toast
    setPreview(info.imageLinks?.thumbnail || "");
    toast.success("Book info loaded!");
  } catch (error) {
    console.error("Error fetching book data:", error);
    toast.error("Failed to fetch book info.");
  } finally {
    setIsFetching(false); // 👈 hide spinner
  }
};



  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 overflow-auto">
      <div className="relative w-full max-w-4xl p-8 bg-white rounded-md shadow-xl transition-all">
        <h2 className="text-lg font-semibold mb-4">
          {book ? "Edit Book" : "Add Book"}
        </h2>
        {/* ISBN field with spinner */}
            <div className="mb-3 relative">
              <label className="block text-sm font-medium">ISBN</label>
              <div className="relative">
                <Input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  onBlur={() => fetchBookByISBN(formData.isbn)}
                  className="w-100 border rounded p-2 pr-10"
                  required
                />
                {/* 👇 spinner visible only while fetching */}
                {isFetching && (
                  <Loader2 className="absolute right-1 top-3 h-5 w-5 text-blue-500 animate-spin" />
                )}
              </div>
              {errors.isbn && <p className="text-xs text-red-500 mt-1">{errors.isbn}</p>}
            </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Standard fields */}
            {[
            
            { label: "Title", name: "title" },
            { label: "Author", name: "author" },
            { label: "Publisher", name: "publisher" },
            { label: "Call Number", name: "call_number" },
            { label: "Place of Publication", name: "publication_place" },
          ].map(({ label, name }) => (
            <div
              key={name}
              className={`mb-3 ${name === "title" ? "md:col-span-3" : ""}`}
            >
              <label className="block text-sm font-medium">{label}</label>
              <Input
  type="text"
  name={name}
  value={(formData as any)[name] || ""}
  onChange={handleChange}
  onBlur={name === "isbn" ? () => fetchBookByISBN(formData.isbn) : undefined}
  className={`w-full border rounded p-2 ${
    highlightFields.includes(name)
      ? "border-red-500 bg-red-50"
      : "border-gray-300"
  } ${name === "title" ? "text-lg" : ""}`}
  required={["title", "author", "isbn", "publisher", "call_number"].includes(name)}
/>

              {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
            </div>
          ))}

            <div className="mb-3">
              <label className="block text-sm font-medium">Copyright Year</label>
              <Input
                type="number"
                name="year"
                value={formData.year || ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
                min="1000"
                max="9999"
              />
            </div>

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

            {/* Dynamic Accession Numbers */}
            {formData.book_copies > 0 && (
             <div className="mb-3 md:col-span-3">
                <label className="block text-sm font-medium">Accession Numbers</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {Array.from({ length: formData.book_copies }).map((_, index) => (
                    <Input
                      key={index}
                      type="text"
                      value={accessionNumbers[index] || ""}
                      onChange={(e) => handleAccessionChange(index, e.target.value)}
                      placeholder={`Accession #${index + 1}`}
                      className="w-full border rounded p-2"
                      required
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Remaining fields (Book Copies, Year, Cover, Section, Dewey, etc.) */}

            <div className="mb-3">
              <label className="block text-sm font-medium">Section</label>
              <Select
                name="section_id"
                value={formData.section_id || ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
              >
                <option value="">Select Section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.section_name}
                  </option>
                ))}
              </Select>
              {errors.section_id && <p className="text-xs text-red-500 mt-1">{errors.section_id}</p>}
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium">Dewey Classification</label>
              <Select
                name="dewey_id"
                value={formData.dewey_id || ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
              >
                <option value="">Select Dewey</option>
                {deweys.map((dewey) => (
                  <option key={dewey.id} value={dewey.id}>
                    {dewey.dewey_classification}
                  </option>
                ))}
              </Select>
              {errors.dewey_id && <p className="text-xs text-red-500 mt-1">{errors.dewey_id}</p>}
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium">Subject</label>
              <Input
                type="text"
                name="subject"
                value={formData.subject || ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
              {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium">Date of Purchase</label>
              <Input
                type="date"
                name="date_purchase"
                value={formData.date_purchase || ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
              {errors.date_purchase && <p className="text-xs text-red-500 mt-1">{errors.date_purchase}</p>}
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium">Book Price (₱)</label>
              <Input
                type="number"
                name="book_price"
                value={formData.book_price || ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
                min="0"
                step="0.01"
                required
              />
              {errors.book_price && <p className="text-xs text-red-500 mt-1">{errors.book_price}</p>}
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium">Other Info</label>
              <Input
                type="text"
                name="other_info"
                value={formData.other_info || ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
              {errors.other_info && <p className="text-xs text-red-500 mt-1">{errors.other_info}</p>}
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
              {preview && <img src={preview} alt="Book cover preview" className="mt-2 w-20 h-28 object-cover" />}
            </div>

          <div className="absolute bottom-10 right-10 flex items-center gap-3">
            <div className="mt-6 flex flex-col-reverse md:flex-row justify-end gap-4">
              <button
                type="button"
                onClick={closeModal}
                className="w-full md:w-auto py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full md:w-auto py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {book ? "Update Book" : "Add Book"}
              </button>
            </div>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
}

//bookmodal.tsx