import { Head, usePage } from '@inertiajs/react';
import { IoMdArrowRoundBack } from 'react-icons/io';

export type Book = {
    id: number;
    title: string;
    author: string;
    isbn?: string;
    publisher: string;
    publication_place?: string;
    year?: string;
    call_number?: string;
    section_id?: number;
    section?: { id: number; section_name: string };
    subject?: string;
    book_copies?: number;
    copies_available?: number;
    status: string;
    book_cover?: string;
    copies?: {
        id: number;
        accession_number: string;
        status: string;
    }[];
};

export default function BookDetail() {
    const { props } = usePage<{ book: Book }>();
    const { book } = props;

    return (
        <>
            <Head title={book.title} />

            <div className="min-h-screen bg-gray-100 p-6">
                {/* Header */}
                <header className="fixed top-0 left-0 z-50 flex w-full flex-col items-center justify-between bg-white px-4 py-4 shadow-md sm:flex-row sm:px-8">
                    <img src="/philcstlogo.png" alt="Library Logo" className="h-10" />
                </header>

                {/* Main content */}
                <div className="mx-auto mt-20 max-w-5xl rounded bg-white p-6 shadow">
                    {/* Back Button */}
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex transform items-center gap-2 rounded-lg bg-purple-900 px-4 py-2 font-bold text-white transition hover:scale-105 hover:bg-purple-900"
                    >
                        <IoMdArrowRoundBack /> Back
                    </button>

                    {/* Book Section */}
                    <div className="mt-8 flex flex-col gap-8 md:flex-row">
                        {/* Left: Book Cover */}
                        <div className="flex w-full flex-col items-center md:w-1/3">
                            {book.book_cover ? (
                                <img src={book.book_cover} alt={book.title} className="h-65 w-50 rounded object-cover" />
                            ) : (
                                <div className="flex h-65 w-50 items-center justify-center rounded bg-gray-200 text-gray-500">No Book Cover</div>
                            )}

                            <div className="mt-4 text-center">
                                <p className="font-semibold">Status</p>
                                <p className={`font-medium ${book.status === 'Available' ? 'text-green-600' : 'text-red-600'}`}>{book.status}</p>
                            </div>
                        </div>

                        {/* Right: Title + Details */}
                        <div className="w-full text-gray-900 md:w-2/3">
                            {/* Inline Title beside cover */}
                            <h1 className="mb-4 border-b pb-2 text-3xl font-bold">{book.title}</h1>

                            {/* Book details */}
                            <div className="space-y-2">
                                {[
                                    { label: 'Author', value: book.author },
                                    { label: 'ISBN', value: book.isbn },
                                    { label: 'Publisher', value: book.publisher },
                                    {
                                        label: 'Place of publication',
                                        value: book.publication_place,
                                    },
                                    { label: 'Copyright year', value: book.year },
                                    { label: 'Call Number', value: book.call_number },
                                    {
                                        label: 'Section',
                                        value: book.section?.section_name || 'N/A',
                                    },
                                    { label: 'Subject', value: book.subject || 'N/A' },
                                ].map(
                                    (item) =>
                                        item.value && (
                                            <div key={item.label} className="flex justify-between border-b py-1">
                                                <span className="font-medium text-gray-700">{item.label}</span>
                                                <span className="text-right">{item.value}</span>
                                            </div>
                                        ),
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Book Copies */}
                    <div className="mt-10">
                        <h2 className="mb-3 text-lg font-semibold text-gray-800">Book Copies</h2>

                        {book.copies && book.copies.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse rounded-lg bg-white text-black shadow-md">
                                    <thead>
                                        <tr className="bg-purple-900 text-white">
                                            <th className="border p-3 text-left">#</th>
                                            <th className="border p-3 text-left">Accession Number</th>
                                            <th className="border p-3 text-left">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {book.copies.map((copy, index) => (
                                            <tr key={copy.id} className="border-b transition hover:bg-gray-100">
                                                <td className="border p-3">{index + 1}</td>
                                                <td className="border p-3 font-medium">{copy.accession_number}</td>
                                                <td className="border p-3">
                                                    <span
                                                        className={`font-semibold ${
                                                            copy.status === 'Available'
                                                                ? 'text-green-600'
                                                                : copy.status === 'Borrowed'
                                                                  ? 'text-yellow-600'
                                                                  : copy.status === 'Reserve'
                                                                    ? 'text-orange-500'
                                                                    : 'text-gray-600'
                                                        }`}
                                                    >
                                                        {copy.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No copies available.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
