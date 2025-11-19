import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useState, useMemo } from "react";
import "../../css/app.css";
import { Select } from "@headlessui/react";
import Fuse from "fuse.js";
import type { FuseResult, FuseResultMatch } from "fuse.js";
import { Search, X } from "lucide-react";


type Book = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  status: string;
  is_active: number;
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

  const [searchFilter, setSearchFilter] = useState<string>("All");
  const [tempSearch, setTempSearch] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);

  const [tempStartYear, setTempStartYear] = useState<number | null>(null);
  const [tempEndYear, setTempEndYear] = useState<number | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(tempSearch.trim());
    }
  };

  const handleYearKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setStartYear(tempStartYear);
      setEndYear(tempEndYear);
    }
  };

  const clearYearFilter = () => {
    setTempStartYear(null);
    setTempEndYear(null);
    setStartYear(null);
    setEndYear(null);
  };

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
    if (tempSearch === "") {
      setSearchTerm("");
    }
  }, [tempSearch]);

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

  // -------------------------------------------------------------
  //  FUZZY SEARCH SETUP
  // -------------------------------------------------------------
  const fuse = useMemo(() => {
    return new Fuse(books, {
      includeScore: true,
      includeMatches: true,
      threshold: 0.3,
      keys: ["title", "author", "subject"],
    });
  }, [books]);

  // Store FuseResult<Book> so we can highlight matches
  const fuzzySearchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      // No search => wrap books as FuseResult without matches
      return books.map((b, index) => ({ item: b, matches: [], refIndex: index } as FuseResult<Book>));
    }
    return fuse.search(searchTerm);
  }, [searchTerm, fuse, books]);

  // Extract books for filtering and grouping
  const fuzzySearchBooks = useMemo(() => {
    return fuzzySearchResults.map((r) => r.item);
  }, [fuzzySearchResults]);

  // -------------------------------------------------------------
  //  SECTION GROUPING
  // -------------------------------------------------------------
  const groupedBooks = useMemo(() => {
    const filtered = fuzzySearchBooks.filter((book) => {
      const bookYear = parseYear(book.year);
      const matchesYear =
        (startYear === null || (bookYear && bookYear >= startYear)) &&
        (endYear === null || (bookYear && bookYear <= endYear));

      const isActive =
        book.status !== "Inactive" && (book as any).is_active !== 0;

      return matchesYear && isActive;
    });

    const groups: Record<string, Book[]> = {};
    sections.forEach((sec) => (groups[sec.section_name] = []));

    filtered.forEach((book) => {
      const sectionName =
        book.section?.section_name ||
        sections.find((s) => s.id === book.section_id)?.section_name ||
        "Uncategorized";

      if (!groups[sectionName]) groups[sectionName] = [];
      groups[sectionName].push(book);
    });

    return groups;
  }, [fuzzySearchBooks, startYear, endYear, sections]);

  // -------------------------------------------------------------
  //  HIGHLIGHT FUNCTION
  // -------------------------------------------------------------
  const highlightMatchWithFuse = (
    text: string,
    matches: readonly FuseResultMatch[] | undefined,
    key: string
  ) => {
    if (!matches || matches.length === 0) return text;

    // Find matches for this key
    const match = matches.find((m) => m.key === key);
    if (!match || !match.indices) return text;

    let result: React.ReactNode[] = [];
    let lastIndex = 0;

    match.indices.forEach(([start, end]: [number, number], i: number) => {
      if (start > lastIndex) {
        result.push(text.slice(lastIndex, start));
      }
      result.push(
        <mark key={i} className="bg-purple-300 text-black rounded px-1">
          {text.slice(start, end + 1)}
        </mark>
      );
      lastIndex = end + 1;
    });

    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  };

  // -------------------------------------------------------------
  // Free eBooks
  // -------------------------------------------------------------
  const filteredEbooks = useMemo(() => {
    return ebooks.filter((ebook) => {
      const ebookYear = parseYear(ebook.year);
      const matchesSearch =
        ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ebook.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear =
        (startYear === null || (ebookYear && ebookYear >= startYear)) &&
        (endYear === null || (ebookYear && ebookYear <= endYear));
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

        {/* Filters */}
        <div className="flex items-center gap-2 mt-8 flex-wrap sm:flex-nowrap">
          <Select
            value={searchFilter}
            onChange={(e: any) => setSearchFilter(e.target.value)}
            className="border border-black rounded px-2 py-2 shadow-sm focus:outline-none focus:ring focus:border-black w-32"
          >
            <option value="All">All</option>
            <option value="Title">Title</option>
            <option value="Isbn">Isbn</option>
            <option value="Author">Author</option>
            <option value="Subject">Subject</option>
          </Select>

          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder={`Search by ${searchFilter.toLowerCase()}...`}
              className="border border-black rounded px-2 py-2 shadow-sm focus:outline-none focus:ring focus:border-black w-150 pr-10"
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
              onKeyDown={handleSearchEnter}
            />

            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600 hover:text-gray-900">
              {tempSearch ? (
                <X
                  size={18}
                  onClick={() => {
                    setTempSearch("");
                    setSearchTerm("");
                  }}
                />
              ) : (
                <Search
                  size={18}
                  onClick={() => handleSearch(tempSearch)}
                />
              )}
            </div>
          </div>

          {/* Year filters */}
          <input
            type="number"
            placeholder="Start Year"
            className="border border-black rounded px-2 py-2 w-24 shadow-sm"
            value={tempStartYear ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d{0,4}$/.test(value)) {
                setTempStartYear(value === "" ? null : parseInt(value, 10));
              }
            }}
            onKeyDown={handleYearKeyPress}
          />

          <input
            type="number"
            placeholder="End Year"
            className="border border-black rounded px-2 py-2 w-24 shadow-sm"
            value={tempEndYear ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d{0,4}$/.test(value)) {
                setTempEndYear(value === "" ? null : parseInt(value, 10));
              }
            }}
            onKeyDown={handleYearKeyPress}
          />

          <button
            onClick={clearYearFilter}
            className="bg-gray-300 text-gray-800 px-3 py-2 rounded hover:bg-gray-400 transition"
          >
            Clear
          </button>
        </div>

        {/* Sectioned Books */}
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
                          className="inline-block bg-purple-800 text-white text-xs font-semibold px-3 py-1 rounded-lg hover:bg-purple-900"
                        >
                          See all
                        </Link>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {groupedBooks[sectionName]
                        ?.slice(0, 5)
                        .map((book) => {
                          const resultForBook = fuzzySearchResults.find(
                            (r) => r.item.id === book.id
                          );
                          return (
                            <Link
                              href={route("books.publicShow", { book: book.id })}
                              key={book.id}
                              className="h-auto bg-white rounded-md border border-gray-300 shadow-sm p-2 flex flex-col items-center hover:scale-105 transition"
                            >
                              <img
                                src={book.book_cover || "/placeholder-book.png"}
                                alt={book.title}
                                className="w-50 h-65 object-cover rounded"
                              />

                              <div className="mt-2 w-full text-center">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {highlightMatchWithFuse(
                                    book.title,
                                    resultForBook?.matches,
                                    "title"
                                  )}
                                </h3>
                                <p className="text-xs text-gray-600 truncate">
                                  By: {highlightMatchWithFuse(
                                    book.author,
                                    resultForBook?.matches,
                                    "author"
                                  )}
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
                          );
                        })}
                    </div>
                  </div>
                );
              })
          ) : (
            <p className="text-center text-gray-500">No book sections found.</p>
          )}
        </div>

        {/* Free eBooks */}
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
                    className="mt-3 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm"
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
    </>
  );
}
//2