import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { IoMdArrowRoundBack } from 'react-icons/io';

type BookCopy = {
    id: number;
    accession_number: string;
    status: string;
};

export default function BookShow() {
    const { book } = usePage<{ book: any }>().props;

    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null);

    const { post, data, setData, processing } = useForm({
        status: '',
    });

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Books', href: '/books' },
                { title: book.title, href: '#' },
            ]}
        >
            <Head title={`Book — ${book.title}`} />

            <div className="space-y-8 rounded-lg bg-white p-6 text-black shadow-lg">
                {/* Header Info */}
                <div className="flex flex-col gap-6 md:flex-row">
                    {book.book_cover ? (
                        <img src={book.book_cover} alt={book.title} className="h-80 w-50 rounded object-cover" />
                    ) : (
                        <div className="flex h-65 w-50 items-center justify-center rounded bg-gray-200 text-gray-500">No Book Cover</div>
                    )}

                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold">{book.title}</h2>
                        <p className="text-gray-600">by {book.author}</p>
                        <div className="space-y-1 text-sm text-gray-700">
                            <p>
                                <strong>Publisher:</strong> {book.publisher}
                            </p>
                            <p>
                                <strong>ISBN:</strong> {book.isbn}
                            </p>
                            <p>
                                <strong>Copyright Year:</strong> {book.year || 'N/A'}
                            </p>
                            <p>
                                <strong>Place of Publication:</strong> {book.publication_place || 'N/A'}
                            </p>
                            <p>
                                <strong>Section:</strong> {book.section?.section_name || 'N/A'}
                            </p>
                            <p>
                                <strong>Call Number:</strong> {book.call_number || 'N/A'}
                            </p>
                            <p>
                                <strong>Dewey:</strong> {book.dewey_relation?.dewey_classification || 'N/A'}
                            </p>
                            <p>
                                <strong>Subject:</strong> {book.subject || 'N/A'}
                            </p>
                            <p>
                                <strong>Date Purchase:</strong> {book.date_purchase || 'N/A'}
                            </p>
                            <p>
                                <strong>Book Price:</strong> {book.book_price || 'N/A'}
                            </p>
                            <p>
                                <strong>Other info:</strong> {book.other_info || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Copies Table */}
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-800">Book Copies</h3>

                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex transform items-center gap-2 rounded-lg bg-purple-800 px-4 py-2 font-bold text-white transition hover:scale-105 hover:bg-purple-900"
                        >
                            <IoMdArrowRoundBack /> Back
                        </button>
                    </div>

                    {book.copies.length ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse rounded-lg bg-white text-black shadow-md">
                                <thead>
                                    <tr className="bg-purple-900 text-white">
                                        <th className="border p-3 text-left">#</th>
                                        <th className="border p-3 text-left">Accession Number</th>
                                        <th className="border p-3 text-left">Status</th>
                                        <th className="border p-3 text-left">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {book.copies.map((copy: BookCopy, index: number) => (
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
                                                                ? 'text-gray-500'
                                                                : copy.status === 'Lost'
                                                                  ? 'text-red-600'
                                                                  : copy.status === 'Damaged'
                                                                    ? 'text-orange-600'
                                                                    : copy.status === 'Old'
                                                                      ? 'text-blue-600'
                                                                      : 'text-gray-600'
                                                    }`}
                                                >
                                                    {copy.status}
                                                </span>
                                            </td>
                                            <td className="flex gap-2 p-3">
                                                <button
                                                    className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                                                    onClick={() => {
                                                        setSelectedCopy(copy);
                                                        setShowArchiveModal(true);
                                                    }}
                                                >
                                                    Archive
                                                </button>
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

            {/* Archive Modal */}
            {showArchiveModal && selectedCopy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-80 rounded-lg bg-white p-6 shadow-lg">
                        <h3 className="mb-4 text-xl font-semibold">Archive Book Copy</h3>

                        <p className="mb-2 text-gray-600">
                            Accession Number: <strong className="ml-1">{selectedCopy.accession_number}</strong>
                        </p>

                        <label className="mb-1 block text-sm font-medium text-gray-700">Archive Reason</label>

                        <select className="mb-4 w-full rounded border p-2" value={data.status} onChange={(e) => setData('status', e.target.value)}>
                            <option value="">Select status</option>
                            <option value="Lost">Lost</option>
                            <option value="Damaged">Damaged</option>
                            <option value="Old">Old</option>
                        </select>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowArchiveModal(false)}
                                className="w-full rounded-md bg-gray-500 px-6 py-2 text-white transition hover:bg-gray-600 md:w-auto"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={processing || !data.status}
                                onClick={() =>
                                    post(route('bookCopies.archive', selectedCopy.id), {
                                        onSuccess: () => setShowArchiveModal(false),
                                    })
                                }
                                className="w-full rounded-md bg-red-600 px-6 py-2 text-white transition hover:bg-red-700 md:w-auto"
                            >
                                Archive
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
