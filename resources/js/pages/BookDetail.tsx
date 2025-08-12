import { Head, Link, usePage } from "@inertiajs/react";

// type Dewey = {
//   id: number;
//   dewey_number: string;
//   description?: string;
// };

type Book = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  status: string;
  book_cover?: string;
  description?: string;
  section?: {
    id: number;
    section_name: string;
  };
  published_date?: string;
  edition?: string;
  pages?: number;
  isbn?: string;
  isbn_10?: string;
  isbn_13?: string;
  accession_number?: string;
  call_number?: string;
  dewey_classifiaction?: string;
  book_copies?: number;
};

export default function BookDetail() {
  const { props } = usePage<{ book: Book }>();
  const { book } = props;

  return (
    <>
      <Head title={book.title} />

      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto bg-white rounded shadow p-6">
          <Link
            href={route("home")}
            className="text-blue-600 hover:underline block mb-4"
          >
            ← Back to Catalog
          </Link>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-8">{book.title}</h1>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Cover + Status */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <img
                src={book.book_cover || "/placeholder-book.png"}
                alt={book.title}
                className="w-60 h-80 object-cover rounded border"
              />
              <div className="mt-4 text-center">
                <p className="font-semibold">Status</p>
                <p
                  className={`font-medium ${
                    book.status === "Available" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {book.status}
                </p>
                <p className="text-sm mt-1">
                  Copies Available: {book.book_copies ?? "N/A"}
                </p>
              </div>
            </div>

            {/* Right: Details */}
            <div className="w-full md:w-2/3">
              <div className="space-y-2">
                {[
                  { label: "Author", value: book.author },
                  { label: "Publisher", value: book.publisher },
                  { label: "Published", value: book.published_date },
                  { label: "Edition", value: book.edition },
                  { label: "Pages", value: book.pages },
                  { label: "ISBN", value: book.isbn },
                  { label: "Accession No", value: book.accession_number },
                  { label: "Call No", value: book.call_number },
                  { label: "Dewey Classification", value: book.dewey_classifiaction },
                  {
                    label: "Shelf Section",
                    value: `${book.section?.section_name}`,
                  },
                ].map(
                  (item) =>
                    item.value && (
                      <div
                        key={item.label}
                        className="flex justify-between border-b py-1"
                      >
                        <span className="font-medium text-gray-700">
                          {item.label}
                        </span>
                        <span className="text-gray-900">{item.value}</span>
                      </div>
                    )
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Description:</h2>
            {book.description && book.description.trim() !== "" && book.description !== " " ? (
              <p className="text-justify whitespace-pre-wrap text-gray-800">
                {book.description}
              </p>
            ) : (
              <p className="text-gray-500 italic">
                No description available for this book.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}