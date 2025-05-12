import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useState, useMemo } from "react";
import "../../css/app.css";

type Book = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  status: string;
  book_cover?: string;
  section_id: number;
  section?: {
    id: number;
    section_name: string;
  };
};

type Section = {
  id: number;
  section_name: string;
};

export default function Welcome() {
  const { props } = usePage<{
    books: Book[];
    sections: Section[];
    flashMessage?: string;
  }>();

  const [books, setBooks] = useState<Book[]>(props.books || []);
  const [sections, setSections] = useState<Section[]>(props.sections || []);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("All");

  useEffect(() => {
    if (props.books) {
      setBooks(props.books);
    }
    if (props.sections) {
      setSections(props.sections);
    }
  }, [props.books, props.sections, props.flashMessage]);

  // This groups the books by section AND applies the search filter
  const groupedBooks = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filteredBooks = books.filter((book) => {
      if (searchFilter === "All") {
        return (
          book.title.toLowerCase().startsWith(lowerSearch) ||
          book.author.toLowerCase().startsWith(lowerSearch) ||
          book.section?.section_name.toLowerCase().startsWith(lowerSearch)
        );
      } else if (searchFilter === "Title") {
        return book.title.toLowerCase().startsWith(lowerSearch);
      } else if (searchFilter === "Author") {
        return book.author.toLowerCase().startsWith(lowerSearch);
      } else if (searchFilter === "Section") {
        return book.section?.section_name.toLowerCase().startsWith(lowerSearch);
      }
      return false;
    });

    const groups: Record<string, Book[]> = {};

    sections.forEach((section) => {
      groups[section.section_name] = [];
    });

    filteredBooks.forEach((book) => {
      const sectionName = book.section?.section_name || sections.find(s => s.id === book.section_id)?.section_name || "Uncategorized";
      if (!groups[sectionName]) {
        groups[sectionName] = [];
      }
      groups[sectionName].push(book);
    });

    return groups;
  }, [books, sections, searchTerm, searchFilter]);

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

        {/* Welcome Message */}
        <div className="text-center mt-24">
          <h1 className="lilitaOneFont royalPurple text-2xl sm:text-3xl font-bold">
            Welcome to Online Public Access Catalog
          </h1>
          <p className="lilitaOneFont royalPurple text-md sm:text-lg font-semibold">
            PhilCST Library: Your Gateway to Knowledge and Discovery
          </p>
        </div>

        {/* Search Inputs */}
        <div className="flex space-x-2 mt-6">
          <select
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="border rounded px-2 py-2 shadow-sm focus:outline-none focus:ring focus:border-purple-500"
          >
            <option value="All">All</option>
            <option value="Title">Title</option>
            <option value="Author">Author</option>
            <option value="Section">Section</option>
          </select>

          <input
            type="text"
            placeholder={`Search by ${searchFilter.toLowerCase()}...`}
            className="border rounded px-2 py-2 w-150 shadow-sm focus:outline-none focus:ring focus:border-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Book Sections */}
        <div className="mt-10 space-y-10">
          {sectionNames.length > 0 ? (
            Object.keys(groupedBooks)
              .filter((sectionName) => groupedBooks[sectionName]?.length > 0)
              .map((sectionName) => {
                const sectionId =
                  groupedBooks[sectionName][0]?.section?.id ||
                  groupedBooks[sectionName][0]?.section_id;

                return (
                  <div key={sectionName}>
                    {/* Section Heading + See All */}
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-semibold">{sectionName}</h2>
                      {sectionId ? (
                        <Link
                          href={route("books.bySection", { section: sectionId })}
                          className="text-blue-500 text-sm hover:underline"
                        >
                          see all
                        </Link>
                      ) : null}
                    </div>

                    {/* Books Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {groupedBooks[sectionName]?.slice(0, 5).map((book) => (
                        <div
                          key={book.id}
                          className="h-auto bg-white rounded-md border border-gray-300 shadow-sm p-2 flex flex-col items-center"
                        >
                          <img
                            src={book.book_cover || "/placeholder-book.png"}
                            alt={book.title}
                            className="w-50 h-65 object-cover rounded cursor-pointer hover:scale-[1.02]"
                          />
                          <div className="mt-2 w-full text-center">
                            <h3 className="text-sm font-semibold truncate">
                              {book.title}
                            </h3>
                            <p className="text-s text-gray-600">
                              By: {book.author}
                            </p>
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
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
          ) : (
            <p className="text-center text-gray-500">No book sections found.</p>
          )}
        </div>
      </div>
    </>
  );
}