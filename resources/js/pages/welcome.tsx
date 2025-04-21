import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (props.books) {
      setBooks(props.books);
    }

    if (props.sections) {
      setSections(props.sections);
    }
  }, [props.books, props.sections, props.flashMessage]);

  const sectionNames = sections.map((section) => section.section_name);

  // Group books by section (with search filter applied)
  const groupedBooks: Record<string, Book[]> = {};
  sectionNames.forEach((sectionName) => {
    groupedBooks[sectionName] = [];
  });

  books
    .filter((book) =>
      book.title.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().startsWith(searchTerm.toLowerCase())
    )
    .forEach((book) => {
      if (book.section && book.section.section_name) {
        const sectionName = book.section.section_name;
        if (!groupedBooks[sectionName]) {
          groupedBooks[sectionName] = [];
        }
        groupedBooks[sectionName].push(book);
      } else if (book.section_id) {
        const section = sections.find((s) => s.id === book.section_id);
        if (section) {
          const sectionName = section.section_name;
          if (!groupedBooks[sectionName]) {
            groupedBooks[sectionName] = [];
          }
          groupedBooks[sectionName].push(book);
        }
      } else {
        if (!groupedBooks["Uncategorized"]) {
          groupedBooks["Uncategorized"] = [];
        }
        groupedBooks["Uncategorized"].push(book);
      }
    });

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

        {/* Search Bar (Left side) */}
        <div className="mt-4 sm:mt-6 flex justify-start w-full max-w-3xl">
          <input
            type="text"
            placeholder="Search by book title or author..."
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Book Sections */}
        <div className="mt-10 space-y-10">
          {sectionNames.length > 0 ? (
            Object.keys(groupedBooks).map((sectionName) => {
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
                    ) : (
                      <span className="text-gray-400 text-sm cursor-not-allowed">
                        see all
                      </span>
                    )}
                  </div>

                  {/* Books Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {groupedBooks[sectionName]?.length > 0 ? (
                      groupedBooks[sectionName]
                        .slice(0, 5)
                        .map((book) => (
                          <div
                            key={book.id}
                            className="h-auto bg-white rounded-md border border-gray-300 shadow-sm p-2 flex flex-col items-center"
                          >
                            <img
                              src={book.book_cover || "/placeholder-book.png"}
                              alt={book.title}
                              className="w-full h-32 object-cover rounded"
                            />
                            <div className="mt-2 w-full text-center">
                              <h3 className="text-sm font-semibold truncate">
                                {book.title}
                              </h3>
                              <p className="text-xs text-gray-600">
                                {book.author}
                              </p>
                              <span className="text-xs text-purple-600">
                                {book.status || "Available"}
                              </span>
                            </div>
                          </div>
                        ))
                    ) : (
                      <>
                        {[...Array(5)].map((_, idx) => (
                          <div
                            key={idx}
                            className="h-48 bg-white rounded-md border border-gray-300 shadow-sm p-2 flex items-center justify-center text-gray-400 text-xs"
                          >
                            Temporary Book
                          </div>
                        ))}
                      </>
                    )}
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
