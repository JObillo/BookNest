import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useState, useMemo } from "react";
import "../../css/app.css";
import { Select } from "@headlessui/react";

// TYPES
type Book = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  status: string;
  year?: number | string;
  book_cover?: string;
  section_id: number;
  description?: string;
  subject?: string;
  section?: {
    id: number;
    section_name: string;
  };
};

type Section = {
  id: number;
  section_name: string;
};

type Ebook = {
  id: number;
  title: string;
  author: string;
  year: number | string;
  cover?: string;
  file_url: string;
  description: string;
  publisher: string;
};

export default function Welcome() {
  const { props } = usePage<{
    books: Book[];
    sections: Section[];
    flashMessage?: string;
  }>();

  const [books, setBooks] = useState<Book[]>(props.books || []);
  const [sections, setSections] = useState<Section[]>(props.sections || []);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loadingEbooks, setLoadingEbooks] = useState(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("All");
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);

    if (value.trim() !== "") {
      fetch(route("search.log"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN":
            (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
              ?.content ?? "",
        },
        body: JSON.stringify({ query: value }),
      });
    }
  };

  useEffect(() => {
    if (props.books) setBooks(props.books);
    if (props.sections) setSections(props.sections);
  }, [props.books, props.sections]);

  useEffect(() => {
    const fetchEbooks = async () => {
      setLoadingEbooks(true);
      try {
        const res = await fetch("/api/ebooks/free");
        const data = await res.json();
        setEbooks(data);
        localStorage.setItem("freeEbooks", JSON.stringify(data));
      } catch (err) {
        console.error("Failed to fetch eBooks:", err);
        const cached = localStorage.getItem("freeEbooks");
        if (cached) setEbooks(JSON.parse(cached));
      }
      setLoadingEbooks(false);
    };
    fetchEbooks();
  }, []);

  const parseYear = (y?: number | string): number | undefined => {
    if (!y) return undefined;
    const n = typeof y === "number" ? y : parseInt(String(y), 10);
    return Number.isFinite(n) ? n : undefined;
  };

  const isWithinYearRange = (itemYear?: number | string): boolean => {
    const y = parseYear(itemYear);
    if (startYear === null && endYear === null) return true;
    if (y === undefined) return false;
    if (startYear !== null && y < startYear) return false;
    if (endYear !== null && y > endYear) return false;
    return true;
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-purple-300 text-black rounded px-1">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Group books by section
  const groupedBooks = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filteredBooks = books.filter((book) => {
      const bookYear = parseYear(book.year);
      let matchesSearch = false;

      if (searchFilter === "All") {
        matchesSearch =
          book.title.toLowerCase().includes(lowerSearch) ||
          String(book.isbn || "").toLowerCase().includes(lowerSearch) ||
          book.author.toLowerCase().includes(lowerSearch) ||
          (book.section?.section_name ?? "").toLowerCase().includes(lowerSearch) ||
          (book.subject ?? "").toLowerCase().includes(lowerSearch);
      } else if (searchFilter === "Title") {
        matchesSearch = book.title.toLowerCase().includes(lowerSearch);
      } else if (searchFilter === "Isbn") {
        matchesSearch = String(book.isbn || "").toLowerCase().includes(lowerSearch);
      } else if (searchFilter === "Author") {
        matchesSearch = book.author.toLowerCase().includes(lowerSearch);
      } else if (searchFilter === "Section") {
        matchesSearch = (book.section?.section_name ?? "")
          .toLowerCase()
          .includes(lowerSearch);
      } else if (searchFilter === "Subject") {
        matchesSearch = (book.subject ?? "").toLowerCase().includes(lowerSearch);
      }

      const matchesYear = isWithinYearRange(bookYear);
      return matchesSearch && matchesYear;
    });

    const groups: Record<string, Book[]> = {};
    sections.forEach((section) => (groups[section.section_name] = []));
    filteredBooks.forEach((book) => {
      const sectionName =
        book.section?.section_name ||
        sections.find((s) => s.id === book.section_id)?.section_name ||
        "Uncategorized";
      if (!groups[sectionName]) groups[sectionName] = [];
      groups[sectionName].push(book);
    });

    return groups;
  }, [books, sections, searchTerm, searchFilter, startYear, endYear]);

  const filteredEbooks = useMemo(() => {
    return ebooks.filter((ebook) => {
      const ebookYear = parseYear(ebook.year);
      const matchesSearch =
        ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ebook.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = isWithinYearRange(ebookYear);
      return matchesSearch && matchesYear;
    });
  }, [ebooks, searchTerm, startYear, endYear]);

  const sectionNames = sections.map((section) => section.section_name);

  return (
    <>
      <Head title="PhilCST Library" />

      <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900 p-4 sm:p-6">
        {/* Header */}
        <header className="fixed top-0 left-0 z-50 w-full flex justify-between items-center px-6 py-4 bg-white shadow-md">
          <img src="philcstlogo.png" alt="Library Logo" className="h-10" />
          <div className="flex items-center gap-4">
            <Link
              href={route("login")}
              className="text-gray-700 hover:text-purple-700 text-sm sm:text-base"
            >
              Login
            </Link>
          </div>
        </header>

        {/* Welcome Text */}
        <div className="text-center mt-24">
          <h1 className="lilitaOneFont text-purple-900 text-2xl sm:text-3xl font-bold">
            Welcome to Online Public Access Catalog
          </h1>
          <p className="lilitaOneFont text-purple-900 text-md sm:text-lg font-semibold">
            PhilCST Library: Your Gateway to Knowledge and Discovery
          </p>
        </div>

        {/* Search Filters */}
        <div className="flex items-center gap-2 mt-8 flex-wrap sm:flex-nowrap">
          <Select
            value={searchFilter}
            onChange={(e: any) => setSearchFilter(e.target.value)}
            className="border rounded px-2 py-2 shadow-sm focus:outline-none focus:ring focus:border-black w-32"
          >
            <option value="All">All</option>
            <option value="Title">Title</option>
            <option value="Isbn">Isbn</option>
            <option value="Author">Author</option>
            {/* <option value="Section">Section</option> */}
            <option value="Subject">Subject</option>
          </Select>

          <input
            type="text"
            placeholder={`Search by ${searchFilter.toLowerCase()}...`}
            className="border border-black rounded px-2 py-2 shadow-sm focus:outline-none focus:ring focus:border-black w-100"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <input
            type="number"
            placeholder="Start Year"
            className="border border-black rounded px-2 py-2 w-24 shadow-sm focus:outline-none focus:ring focus:border-black"
            value={startYear ?? ""}
            onChange={(e) =>
              setStartYear(e.target.value === "" ? null : parseInt(e.target.value, 10))
            }
          />
          <input
            type="number"
            placeholder="End Year"
            className="border border-black rounded px-2 py-2 w-24 shadow-sm focus:outline-none focus:ring focus:border-black"
            value={endYear ?? ""}
            onChange={(e) =>
              setEndYear(e.target.value === "" ? null : parseInt(e.target.value, 10))
            }
          />

          <button
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className={`flying-book ${isHelpOpen ? "flying-book-open" : "flying-book-closed"} text-5xl`}
            title="How to Use the Library"
          >
            📖
          </button>
        </div>

        {/* Book Sections */}
        <div className="mt-5 space-y-10">
          {sectionNames.length > 0 ? (
            Object.keys(groupedBooks)
              .filter((sectionName) => groupedBooks[sectionName]?.length > 0)
              .map((sectionName) => {
                const sectionId =
                  groupedBooks[sectionName][0]?.section?.id ||
                  groupedBooks[sectionName][0]?.section_id;
                return (
                  <div key={sectionName}>
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-semibold">{sectionName}</h2>
                      {groupedBooks[sectionName].length >= 5 && sectionId ? (
                        <Link
                          href={route("books.bySection", { section: sectionId })}
                          className="text-blue-500 text-sm hover:underline"
                        >
                          see all
                        </Link>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {groupedBooks[sectionName]
                        ?.slice(0, 5)
                        .map((book) => (
                          <Link
                            href={route("books.show", { book: book.id })}
                            key={book.id}
                            className="h-auto bg-white rounded-md border border-gray-300 shadow-sm p-2 flex flex-col items-center hover:shadow-md transition"
                          >
                            <img
                              src={book.book_cover || "/placeholder-book.png"}
                              alt={book.title}
                              className="w-50 h-65 object-cover rounded"
                            />
                            <div className="mt-2 w-full text-center">
                              <h3 className="text-sm font-semibold truncate">
                                {highlightMatch(book.title, searchTerm)}
                              </h3>
                              <p className="text-s text-gray-600">
                                By: {highlightMatch(book.author, searchTerm)}
                              </p>
                              {book.year && (
                                <p className="text-xs text-gray-500">
                                  Year: {book.year}
                                </p>
                              )}
                              <span
                                className={`px-2 py-1 rounded text-white text-sm ${
                                  book.status === "Available"
                                    ? "bg-green-600"
                                    : "bg-red-600"
                                }`}
                              >
                                {book.status}
                              </span>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>
                );
              })
          ) : (
            <p className="text-center text-gray-500">No book sections found.</p>
          )}
        </div>

        {/* Free eBooks Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Free eBooks</h2>
            <Link href={route("ebooks.index")} className="text-blue-500 hover:underline">
              See All
            </Link>
          </div>

          {loadingEbooks ? (
            <p className="text-gray-500">Loading eBooks...</p>
          ) : filteredEbooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredEbooks.slice(0, 5).map((ebook) => (
                <div
                  key={ebook.id}
                  className="h-auto bg-white rounded-md border border-gray-300 shadow-sm p-2 flex flex-col items-center hover:shadow-md transition"
                >
                  <img
                    src={ebook.cover || "/placeholder-book.png"}
                    alt={ebook.title}
                    className="w-40 h-56 object-cover rounded"
                  />
                  <div className="mt-2 w-full text-center">
                    <h3 className="text-sm font-semibold truncate">{ebook.title}</h3>
                    <p className="text-s text-gray-600">By: {ebook.author}</p>
                    <span className="text-xs text-gray-500">Published: {ebook.year}</span>
                  </div>

                  <a
                    href={ebook.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition text-sm"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No eBooks available.</p>
          )}
        </div>
      </div>

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full animate-fadeIn relative">
            <button
              onClick={() => setIsHelpOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-purple-800">
              📖 How to Use the System
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Use the <strong>Search bar</strong> to find books by title, author, or section.</li>
              <li>Apply <strong>Year filters</strong> to narrow results by publication year.</li>
              <li>Click a book cover to <strong>view details</strong> (author, publisher, section, status).</li>
              <li>For eBooks, click <strong>Download</strong> to read online for free.</li>
            </ol>

            <h2 className="text-xl font-bold mt-6 mb-4 text-purple-800">🏫 How to Borrow a Book</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Search and locate the book you want in this OPAC system.</li>
              <li>Go to the <strong>PhilCST Library counter</strong> with the book title or ID.</li>
              <li>Present your <strong>student ID</strong> to the librarian.</li>
              <li>The librarian will check availability and issue the book to you.</li>
              <li>Return the book on or before the due date to avoid penalties.</li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
