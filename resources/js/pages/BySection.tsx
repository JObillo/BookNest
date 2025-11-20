import { Select } from '@headlessui/react';
import { Head, Link } from '@inertiajs/react';
import type { FuseResult, FuseResultMatch } from 'fuse.js';
import Fuse from 'fuse.js';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FaHome } from 'react-icons/fa';

type Props = {
    section: {
        id: number;
        section_name: string;
    };
    books: {
        id: number;
        title: string;
        author: string;
        isbn: string;
        subject?: string;
        publisher: string;
        status: string;
        is_active: number;
        accession_number: string;
        call_number: string;
        year?: string | number;
        publication_place: string;
        book_cover?: string;
    }[];
};

export default function BySection({ section, books }: Props) {
    const [tempSearch, setTempSearch] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchFilter, setSearchFilter] = useState<string>('All');
    const [currentPage, setCurrentPage] = useState(1);

    const [startYear, setStartYear] = useState<number | null>(null);
    const [endYear, setEndYear] = useState<number | null>(null);
    const [tempStartYear, setTempStartYear] = useState<number | null>(null);
    const [tempEndYear, setTempEndYear] = useState<number | null>(null);

    // Apply search when Enter is pressed
    const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setSearchTerm(tempSearch.trim());
        }
    };

    // Apply year filter on Enter
    const handleYearKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
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

    useEffect(() => {
        if (tempSearch === '') {
            setSearchTerm('');
        }
    }, [tempSearch]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, searchFilter, startYear, endYear]);

    const parseYear = (y?: number | string): number | undefined => {
        if (!y) return undefined;
        const n = typeof y === 'number' ? y : parseInt(String(y), 10);
        return Number.isFinite(n) ? n : undefined;
    };

    const fuse = useMemo(() => {
        return new Fuse(books, {
            includeScore: true,
            includeMatches: true,
            threshold: 0.3,
            keys: ['title', 'author', 'subject'],
        });
    }, [books]);

    const fuzzySearchResults = useMemo(() => {
        if (!searchTerm.trim()) {
            return books.map((b, index) => ({ item: b, matches: [], refIndex: index }) as FuseResult<typeof b>);
        }
        return fuse.search(searchTerm);
    }, [searchTerm, fuse, books]);

    const filteredFuzzyBooks = useMemo(() => {
        return fuzzySearchResults
            .map((r) => r.item)
            .filter((book) => {
                const y = parseYear(book.year);
                const matchesYear = (startYear === null || (y && y >= startYear)) && (endYear === null || (y && y <= endYear));
                return matchesYear && book.is_active !== 0;
            });
    }, [fuzzySearchResults, startYear, endYear]);

    const highlightMatchWithFuse = (text: string, matches: readonly FuseResultMatch[] | undefined, key: string) => {
        if (!matches || matches.length === 0) return text;
        const match = matches.find((m) => m.key === key);
        if (!match || !match.indices) return text;

        let result: React.ReactNode[] = [];
        let lastIndex = 0;

        match.indices.forEach(([start, end], i) => {
            if (start > lastIndex) result.push(text.slice(lastIndex, start));
            result.push(
                <mark key={i} className="rounded bg-purple-300 px-1 text-black">
                    {text.slice(start, end + 1)}
                </mark>,
            );
            lastIndex = end + 1;
        });

        if (lastIndex < text.length) result.push(text.slice(lastIndex));
        return result;
    };

    const booksPerPage = 5;
    const totalPages = Math.ceil(filteredFuzzyBooks.length / booksPerPage);
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const displayedBooks = filteredFuzzyBooks.slice(startIndex, endIndex);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages || 1);
        }
    }, [filteredFuzzyBooks, totalPages, currentPage]);

    return (
        <>
            <Head title={`Books in ${section.section_name}`} />
            <div className="flex min-h-screen flex-col bg-gray-100 p-4 text-gray-900 sm:p-6">
                {/* Header */}
                <header className="fixed top-0 left-0 z-50 flex w-full flex-col items-center justify-between bg-white px-4 py-4 shadow-md sm:flex-row sm:px-8">
                    <img src="/philcstlogo.png" alt="Library Logo" className="h-10" />
                </header>

                {/* Welcome Text */}
                <div className="mt-24 text-center">
                    <h1 className="lilitaOneFont text-2xl font-bold text-purple-900 sm:text-3xl">Welcome to Online Public Access Catalog</h1>
                    <p className="lilitaOneFont text-md font-semibold text-purple-900 sm:text-lg">
                        PhilCST Library: Your Gateway to Knowledge and Discovery
                    </p>
                </div>

                {/* Section Name */}
                <div className="mt-20 px-2 sm:px-6">
                    <h1 className="royalPurple text-left text-2xl font-bold">Books in {section.section_name}</h1>
                </div>

                {/* Search + Filters */}
                <div className="mt-4 flex flex-col flex-wrap items-center justify-start gap-3 px-2 sm:flex-row sm:flex-nowrap sm:px-6">
                    <Link
                        href={route('home')}
                        className="inline-flex transform items-center gap-2 rounded-lg bg-purple-900 px-4 py-2 font-bold text-white transition hover:scale-105 hover:bg-purple-900"
                        title="Back to Home"
                    >
                        <FaHome /> Home
                    </Link>

                    {/* SEARCH INPUT */}
                    <Select
                        value={searchFilter}
                        onChange={(e: any) => setSearchFilter(e.target.value)}
                        className="w-32 rounded border border-black px-2 py-2 shadow-sm focus:border-black focus:ring focus:outline-none"
                    >
                        <option value="All">All</option>
                        <option value="Title">Title</option>
                        <option value="Isbn">Isbn</option>
                        <option value="Author">Author</option>
                        <option value="Subject">Subject</option>
                    </Select>

                    <div className="relative w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder={`Search by ${searchFilter.toLowerCase()}...`}
                            className="w-150 rounded border border-black px-2 py-2 pr-10 shadow-sm focus:border-black focus:ring focus:outline-none"
                            value={tempSearch}
                            onChange={(e) => setTempSearch(e.target.value)}
                            onKeyDown={handleSearchEnter}
                        />
                        <div className="absolute top-1/2 right-2 -translate-y-1/2 transform cursor-pointer text-gray-600 hover:text-gray-900">
                            {tempSearch ? (
                                <X
                                    size={18}
                                    onClick={() => {
                                        setTempSearch('');
                                        setSearchTerm('');
                                    }}
                                />
                            ) : (
                                <Search size={18} onClick={() => setSearchTerm(tempSearch.trim())} />
                            )}
                        </div>
                    </div>

                    {/* Year filters */}
                    <input
                        type="number"
                        placeholder="Start Year"
                        className="w-24 rounded border border-black px-2 py-2 shadow-sm focus:border-black focus:ring focus:outline-none"
                        value={tempStartYear ?? ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d{0,4}$/.test(value)) {
                                setTempStartYear(value === '' ? null : parseInt(value, 10));
                            }
                        }}
                        onKeyDown={handleYearKeyPress}
                    />

                    <input
                        type="number"
                        placeholder="End Year"
                        className="w-24 rounded border border-black px-2 py-2 shadow-sm focus:border-black focus:ring focus:outline-none"
                        value={tempEndYear ?? ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d{0,4}$/.test(value)) {
                                setTempEndYear(value === '' ? null : parseInt(value, 10));
                            }
                        }}
                        onKeyDown={handleYearKeyPress}
                    />

                    <button onClick={clearYearFilter} className="rounded bg-gray-300 px-3 py-2 text-gray-800 transition hover:bg-gray-400">
                        Clear
                    </button>
                </div>

                {/* Table */}
                <div className="mt-6 w-full overflow-x-auto px-2 sm:px-6">
                    <table className="w-full border-collapse rounded-lg bg-white text-black shadow-sm">
                        <thead>
                            <tr className="border-b bg-purple-900 text-white">
                                {['Book Cover', 'Book', 'Author', 'Publisher', 'Catalog Info', 'Status'].map((header, index) => (
                                    <th key={header} className={`border p-3 text-left ${index === 0 || index === 3 ? 'hidden lg:table-cell' : ''}`}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {displayedBooks.length ? (
                                displayedBooks.map((book) => {
                                    const resultForBook = fuzzySearchResults.find((r) => r.item.id === book.id);
                                    return (
                                        <tr key={book.id} className="border-b hover:bg-gray-100">
                                            <td className="hidden p-3 lg:table-cell">
                                                <Link href={route('books.publicShow', { book: book.id })}>
                                                    {book.book_cover ? (
                                                        <img
                                                            src={book.book_cover}
                                                            alt="Book Cover"
                                                            className="h-28 w-20 rounded object-cover shadow"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-500">No Cover</span>
                                                    )}
                                                </Link>
                                            </td>

                                            <td className="p-3">
                                                <Link href={route('books.publicShow', { book: book.id })}>
                                                    <div className="font-semibold">
                                                        {highlightMatchWithFuse(book.title, resultForBook?.matches, 'title')}
                                                    </div>
                                                    <div className="text-sm text-gray-600">ISBN: {book.isbn}</div>
                                                </Link>
                                            </td>

                                            <td className="p-3">{highlightMatchWithFuse(book.author, resultForBook?.matches, 'author')}</td>
                                            <td className="hidden p-3 lg:table-cell">
                                                {highlightMatchWithFuse(book.subject || '', resultForBook?.matches, 'subject')}
                                            </td>

                                            <td className="hidden p-3 text-sm text-gray-800 lg:table-cell">
                                                <div>Accession #: {book.accession_number}</div>
                                                <div>Call #: {book.call_number}</div>
                                                <div>Year: {book.year?.toString() || 'N/A'}</div>
                                                <div>Place: {book.publication_place}</div>
                                            </td>

                                            <td className={`p-3 font-medium ${book.status === 'Available' ? 'text-green-600' : 'text-red-600'}`}>
                                                {book.status}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-gray-500">
                                        No books found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between px-4 py-3 text-sm text-gray-700">
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            className="rounded border px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            «
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`rounded border px-3 py-1 hover:bg-gray-200 ${page === currentPage ? 'bg-purple-700 text-white' : ''}`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            className="rounded border px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            »
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
