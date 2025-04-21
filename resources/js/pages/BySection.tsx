import { Head } from '@inertiajs/react';

type Props = {
  section: {
    id: number;
    section_name: string;
  };
  books: {
    id: number;
    title: string;
    author: string;
    publisher: string;
    book_cover?: string;
  }[];
};

export default function BySection({ section, books }: Props) {
  return (
    <>
      <Head title={`Books in ${section.section_name}`} />
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">
          Books in {section.section_name}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {books.map((book) => (
            <div key={book.id} className="bg-white border p-3 rounded shadow">
              <img
                src={book.book_cover || "/placeholder-book.png"}
                alt={book.title}
                className="h-40 object-cover w-full rounded"
              />
              <h2 className="text-sm font-semibold mt-2 truncate">{book.title}</h2>
              <p className="text-xs text-gray-500">{book.author}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
