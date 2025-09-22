import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useState, useMemo } from "react";
import "../../css/app.css";
import { Select } from "@headlessui/react";
import { SelectIcon } from "@radix-ui/react-select";

type Book = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  status: string;
  book_cover?: string;
  section_id: number;
  description?: string; // ✅ Add this
  section?: {
    id: number;
    section_name: string;
  };
};

type Section = {
  id: number;
  section_name: string;
};

type Ebook = {  // ✅ Added Ebook type definition
  id: number;
  title: string;
  author: string;
  year: number;
  cover?: string;
  file_url: string;
};


export default function Welcome() {
  const { props } = usePage<{
    books: Book[];
    sections: Section[];
    flashMessage?: string;
    ebooks: Ebook[];  // ✅ Added ebooks to the props
  }>();

  const [books, setBooks] = useState<Book[]>(props.books || []);
  const [sections, setSections] = useState<Section[]>(props.sections || []);
  const [ebooks, setEbooks] = useState<Ebook[]>(props.ebooks || []); // ✅ State for ebooks (added)
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("All");
  const handleSearch = (value: string) => {
  setSearchTerm(value);

  // Log search to backend
  if (value.trim() !== "") {
    fetch(route("search.log"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ""
      },
      body: JSON.stringify({
        query: value,
      }),
    });
  }
};


  // ✅ State for detail modal
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const openDetailModal = (book: Book) => {
    setSelectedBook(book);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedBook(null);
    setIsDetailModalOpen(false);
  };

  useEffect(() => {
    if (props.books) {
      setBooks(props.books);
    }
    if (props.sections) {
      setSections(props.sections);
    }
  }, [props.books, props.sections, props.flashMessage]);
  useEffect(() => {
  if (props.ebooks) {
    setEbooks(props.ebooks);
  }
}, [props.ebooks]);
 // ✅ Added: Set ebooks state based on props

  const groupedBooks = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filteredBooks = books.filter((book) => {
      if (searchFilter === "All") {
        return (
          book.title.toLowerCase().includes(lowerSearch) ||
          book.author.toLowerCase().includes(lowerSearch) ||
          book.section?.section_name.toLowerCase().includes(lowerSearch)
        );
      } else if (searchFilter === "Title") {
        return book.title.toLowerCase().includes(lowerSearch);
      } else if (searchFilter === "Author") {
        return book.author.toLowerCase().includes(lowerSearch);
      } else if (searchFilter === "Section") {
        return book.section?.section_name.toLowerCase().includes(lowerSearch);
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
          <Select
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="border rounded px-2 py-2 shadow-sm focus:outline-none focus:ring focus:border-purple-500"
          >
            <option value="All">All</option>
            <option value="Title">Title</option>
            <option value="Author">Author</option>
            <option value="Section">Section</option>
          </Select>

          <input
            type="text"
            placeholder={`Search by ${searchFilter.toLowerCase()}...`}
            className="border rounded px-2 py-2 w-150 shadow-sm focus:outline-none focus:ring focus:border-purple-500"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
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
                    {/* Show "See All" only if 5 or more books */}
                    {groupedBooks[sectionName].length >= 5 && sectionId ? (
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
                            <h3 className="text-sm font-semibold truncate">{book.title}</h3>
                            <p className="text-s text-gray-600">By: {book.author}</p>
                            <span
                              className={`px-2 py-1 rounded text-white text-sm ${
                                book.status === "Available" ? "bg-green-600" : "bg-red-600"
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
        {/* eBook Section */}
          <div className="mt-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">eBooks</h2>
              <Link href={route('ebooks.index')} className="text-blue-500 hover:underline">
                See All
              </Link>
            </div>

            {ebooks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {ebooks.slice(0, 5).map((ebook) => (
                  <div
                    key={ebook.id}
                    className="h-auto bg-white rounded-md border border-gray-300 shadow-sm p-2 flex flex-col items-center hover:shadow-md transition"
                  >
                    <img
                      src={ebook.cover ? `/storage/${ebook.cover}` : "/placeholder-book.png"}
                      alt={ebook.title}
                      className="w-40 h-56 object-cover rounded"
                    />
                    <div className="mt-2 w-full text-center">
                      <h3 className="text-sm font-semibold truncate">{ebook.title}</h3>
                      <p className="text-s text-gray-600">By: {ebook.author}</p>
                      <span className="text-xs text-gray-500">Published: {ebook.year}</span>
                    </div>

                    {/* Download Button */}
                    <a
                      href={`/ebooks/${ebook.id}/download`}
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

      {/* ✅ Book Detail Modal */}
      {isDetailModalOpen && selectedBook && (
        <div className="fixed inset-0 z-50 bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative shadow-lg">
            <button
              onClick={closeDetailModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
            >
              &times;
            </button>
            <div className="flex flex-col items-center">
              <img
                src={selectedBook.book_cover || "/placeholder-book.png"}
                alt={selectedBook.title}
                className="w-40 h-56 object-cover rounded mb-4"
              />
              <h2 className="text-lg font-bold mb-1">{selectedBook.title}</h2>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Author:</strong> {selectedBook.author}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Publisher:</strong> {selectedBook.publisher}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Section:</strong> {selectedBook.section?.section_name}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Status:</strong> {selectedBook.status}
              </p>
              {selectedBook.description && (
                <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap text-justify">
                  {selectedBook.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
