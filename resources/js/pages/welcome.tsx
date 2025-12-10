import { Select } from '@headlessui/react';
import { Head, Link, usePage } from '@inertiajs/react';
import type { FuseResult, FuseResultMatch } from 'fuse.js';
import Fuse from 'fuse.js';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import '../../css/app.css';

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

    const [searchFilter, setSearchFilter] = useState<string>('All');
    const [tempSearch, setTempSearch] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [startYear, setStartYear] = useState<number | null>(null);
    const [endYear, setEndYear] = useState<number | null>(null);

    const [tempStartYear, setTempStartYear] = useState<number | null>(null);
    const [tempEndYear, setTempEndYear] = useState<number | null>(null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setSearchTerm(tempSearch.trim());
        }
    };

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

    const handleSearch = (value: string) => {
        setSearchTerm(value);

        if (value.trim() !== '') {
            fetch(route('search.log'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                },
                body: JSON.stringify({ query: value }),
            });
        }
    };

    useEffect(() => {
        if (tempSearch === '') {
            setSearchTerm('');
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
                const res = await fetch('/api/ebooks/free');
                const data = await res.json();
                setEbooks(data);
                localStorage.setItem('freeEbooks', JSON.stringify(data));
            } catch (err) {
                const cached = localStorage.getItem('freeEbooks');
                if (cached) setEbooks(JSON.parse(cached));
            }
            setLoadingEbooks(false);
        };
        fetchEbooks();
    }, []);

    const parseYear = (y?: number | string): number | undefined => {
        if (!y) return undefined;
        const n = typeof y === 'number' ? y : parseInt(String(y), 10);
        return Number.isFinite(n) ? n : undefined;
    };

    // FUZZY SEARCH SETUP
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
            return books.map((b, index) => ({ item: b, matches: [], refIndex: index }) as FuseResult<Book>);
        }
        return fuse.search(searchTerm);
    }, [searchTerm, fuse, books]);

    const fuzzySearchBooks = useMemo(() => {
        return fuzzySearchResults.map((r) => r.item);
    }, [fuzzySearchResults]);

    // SECTION GROUPING
    const groupedBooks = useMemo(() => {
        const filtered = fuzzySearchBooks.filter((book) => {
            const bookYear = parseYear(book.year);
            const matchesYear =
                (startYear === null || (bookYear && bookYear >= startYear)) && (endYear === null || (bookYear && bookYear <= endYear));

            const isActive = book.status !== 'Inactive' && (book as any).is_active !== 0;

            return matchesYear && isActive;
        });

        const groups: Record<string, Book[]> = {};
        sections.forEach((sec) => (groups[sec.section_name] = []));

        filtered.forEach((book) => {
            const sectionName = book.section?.section_name || sections.find((s) => s.id === book.section_id)?.section_name || 'Uncategorized';

            if (!groups[sectionName]) groups[sectionName] = [];
            groups[sectionName].push(book);
        });

        return groups;
    }, [fuzzySearchBooks, startYear, endYear, sections]);

    // HIGHLIGHT FUNCTION
    const highlightMatchWithFuse = (text: string, matches: readonly FuseResultMatch[] | undefined, key: string) => {
        if (!matches || matches.length === 0) return text;

        const match = matches.find((m) => m.key === key);
        if (!match || !match.indices) return text;

        let result: React.ReactNode[] = [];
        let lastIndex = 0;

        match.indices.forEach(([start, end]: [number, number], i: number) => {
            if (start > lastIndex) {
                result.push(text.slice(lastIndex, start));
            }
            result.push(
                <mark key={i} className="rounded bg-purple-300 px-1 text-black">
                    {text.slice(start, end + 1)}
                </mark>,
            );
            lastIndex = end + 1;
        });

        if (lastIndex < text.length) {
            result.push(text.slice(lastIndex));
        }

        return result;
    };

    // Free eBooks filter
    const filteredEbooks = useMemo(() => {
        return ebooks.filter((ebook) => {
            const ebookYear = parseYear(ebook.year);
            const matchesSearch =
                ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) || ebook.author.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesYear =
                (startYear === null || (ebookYear && ebookYear >= startYear)) && (endYear === null || (ebookYear && ebookYear <= endYear));
            return matchesSearch && matchesYear;
        });
    }, [ebooks, searchTerm, startYear, endYear]);

    const sectionNames = sections.map((section) => section.section_name);

    return (
        <>
            <Head title="PhilCST Library" />

            <div className="flex min-h-screen flex-col bg-gray-100 p-4 text-gray-900 sm:p-6 overflow-x-hidden">
                {/* Header */}
                <header className="fixed top-0 left-0 z-50 flex w-full flex-wrap items-center justify-between bg-white px-4 py-3 shadow-md sm:px-6">
                    <img src="philcstlogo.png" alt="Library Logo" className="h-10 mb-2 sm:mb-0" />
                    <div className="flex items-center gap-4">
                        <Link href={route('login')} className="text-sm text-gray-700 hover:text-purple-700 sm:text-base">
                            Login
                        </Link>
                    </div>
                </header>

                {/* Welcome Text */}
                <div className="mt-28 text-center px-2 sm:px-0">
                    <h1 className="lilitaOneFont text-2xl font-bold text-purple-900 sm:text-3xl">
                        Welcome to Online Public Access Catalog
                    </h1>
                    <p className="lilitaOneFont text-md font-semibold text-purple-900 sm:text-lg">
                        PhilCST Library: Your Gateway to Knowledge and Discovery
                    </p>
                </div>

                {/* Filters */}
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
                    <Select
                        value={searchFilter}
                        onChange={(e: any) => setSearchFilter(e.target.value)}
                        className="w-full max-w-xs rounded border border-black px-2 py-2 shadow-sm focus:border-black focus:ring focus:outline-none sm:w-32"
                    >
                        <option value="All">All</option>
                        <option value="Title">Title</option>
                        <option value="Isbn">Isbn</option>
                        <option value="Author">Author</option>
                        <option value="Subject">Subject</option>
                    </Select>
                    <div className="relative w-full sm:w-auto flex-1 max-w-xl">
                        <input
                            type="text"
                            placeholder={`Search by ${searchFilter.toLowerCase()}...`}
                            className="w-full rounded border border-black px-2 py-2 pr-10 shadow-sm focus:border-black focus:ring focus:outline-none"
                            value={tempSearch}
                            onChange={(e) => setTempSearch(e.target.value)}
                            onKeyDown={handleSearchEnter}
                        />

                        <div className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-gray-600 hover:text-gray-900">
                            {tempSearch ? (
                                <X
                                    size={18}
                                    onClick={() => {
                                        setTempSearch('');
                                        setSearchTerm('');
                                    }}
                                />
                            ) : (
                                <Search size={18} onClick={() => handleSearch(tempSearch)} />
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        <input
                            type="number"
                            placeholder="Start Year"
                            className="w-full sm:w-24 rounded border border-black px-2 py-2 shadow-sm"
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
                            className="w-full sm:w-24 rounded border border-black px-2 py-2 shadow-sm"
                            value={tempEndYear ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d{0,4}$/.test(value)) {
                                    setTempEndYear(value === '' ? null : parseInt(value, 10));
                                }
                            }}
                            onKeyDown={handleYearKeyPress}
                        />

                        <button
                            onClick={clearYearFilter}
                            className="w-full sm:w-auto rounded bg-gray-300 px-3 py-2 text-gray-800 transition hover:bg-gray-400"
                        >
                            Clear
                        </button>
                    </div>
                    <button
                        onClick={() => setIsHelpOpen(!isHelpOpen)}
                        className={`flying-book ${isHelpOpen ? "flying-book-open" : "flying-book-closed"} text-5xl`}
                        title="How to Use the Library"
                    >
                        📖
                    </button>
                </div>

                {/* Sectioned Books */}
                <div className="mt-5 space-y-10">
                    {sectionNames.length > 0 ? (
                        Object.keys(groupedBooks)
                            .filter((sectionName) => groupedBooks[sectionName]?.length > 0)
                            .map((sectionName) => {
                                const sectionId = groupedBooks[sectionName][0]?.section?.id || groupedBooks[sectionName][0]?.section_id;

                                return (
                                    <div key={sectionName}>
                                        <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
                                            <h2 className="text-lg font-semibold">{sectionName}</h2>

                                            {groupedBooks[sectionName].length >= 5 && sectionId ? (
                                                <Link
                                                    href={route('books.bySection', { section: sectionId })}
                                                    className="inline-block rounded-lg bg-purple-800 px-3 py-1 text-xs font-semibold text-white hover:bg-purple-900"
                                                >
                                                    See all
                                                </Link>
                                            ) : null}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                            {groupedBooks[sectionName]?.slice(0, 5).map((book) => {
                                                const resultForBook = fuzzySearchResults.find((r) => r.item.id === book.id);
                                                return (
                                                    <Link
                                                        href={route('books.publicShow', { book: book.id })}
                                                        key={book.id}
                                                        className="flex h-auto flex-col items-center rounded-md border border-gray-300 bg-white p-2 shadow-sm transition hover:scale-105"
                                                    >
                                                        {book.book_cover ? (
                                                            <img src={book.book_cover} alt={book.title} className="h-52 w-36 sm:h-65 sm:w-50 rounded object-cover" />
                                                        ) : (
                                                            <div className="flex h-52 w-36 sm:h-65 sm:w-50 items-center justify-center rounded bg-gray-200 text-gray-500">
                                                                No Book Cover
                                                            </div>
                                                        )}

                                                        <div className="mt-2 w-full text-center">
                                                            <h3 className="truncate text-sm font-semibold text-gray-900">
                                                                {highlightMatchWithFuse(book.title, resultForBook?.matches, 'title')}
                                                            </h3>
                                                            <p className="truncate text-xs text-gray-600">
                                                                By: {highlightMatchWithFuse(book.author, resultForBook?.matches, 'author')}
                                                            </p>
                                                            {book.year && <p className="text-xs text-gray-500">Year: {book.year}</p>}
                                                            <span
                                                                className={`rounded px-2 py-1 text-sm text-white ${
                                                                    book.status === 'Available' ? 'bg-green-600' : 'bg-red-600'
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
                    <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                        <h2 className="text-xl font-semibold">Free eBooks</h2>
                        <Link href={route('ebooks.index')} className="text-blue-500 hover:underline">
                            See All
                        </Link>
                    </div>

                    {loadingEbooks ? (
                        <p className="text-gray-500">Loading eBooks...</p>
                    ) : filteredEbooks.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {filteredEbooks.slice(0, 5).map((ebook) => (
                                <div
                                    key={ebook.id}
                                    className="flex h-auto flex-col items-center rounded-md border border-gray-300 bg-white p-2 shadow-sm transition hover:shadow-md"
                                >
                                    <img src={ebook.cover || '/placeholder-book.png'} alt={ebook.title} className="h-48 w-32 sm:h-56 sm:w-40 rounded object-cover" />

                                    <div className="mt-2 w-full text-center">
                                        <h3 className="truncate text-sm font-semibold">{ebook.title}</h3>
                                        <p className="text-xs text-gray-600">By: {ebook.author}</p>
                                        <span className="text-xs text-gray-500">Published: {ebook.year}</span>
                                    </div>

                                    <a
                                        href={ebook.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
                                    >
                                        Download
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No eBooks available.</p>
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
                        📘 How to Borrow Books
                    </h2>

                    <ul className="space-y-2 text-gray-700">
                        <li>• Check book availability using the OPAC.</li>
                        <li>• Copy the Call Number, Author, and Title.</li>
                        <li>• Give the your copy to the librarian for assistance.</li>
                        <li>• For photocopying, write your name in the logbook and submit the book at the charging desk.</li>
                        <li>• Books may be borrowed for <strong>ONE DAY ONLY</strong>.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-6 mb-4 text-purple-800">
                        📗 How to Return Books
                    </h2>

                    <ul className="space-y-2 text-gray-700">
                        <li>• Return the book to the librarian on duty with your Library ID.</li>
                        <li>• Lost books must be reported immediately and settled within 10 days.</li>
                        <li>• If the book is overdue, pay the corresponding fine at the Accounting Office.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-6 mb-4 text-purple-800">
                        🕒 Library Operating Hours
                    </h2>

                    <ul className="space-y-1 text-gray-700">
                        <li>• <strong>Mon–Fri:</strong> 8:00 AM – 6:00 PM</li>
                        <li>• <strong>Saturday:</strong> 8:00 AM – 5:00 PM</li>
                    </ul>
                    </div>
                </div>
                )}
        </>
    );
}
