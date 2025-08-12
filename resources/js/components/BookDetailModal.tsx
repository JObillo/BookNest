type BookDetailProps = {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function BookDetailModal({ book, isOpen, onClose }: BookDetailProps) {
  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
        <p className="text-gray-700 mb-1"><strong>Author:</strong> {book.author}</p>
        <p className="text-gray-700 mb-1"><strong>ISBN:</strong> {book.isbn}</p>
        <p className="text-gray-700 mb-1"><strong>Publisher:</strong> {book.publisher}</p>
        <p className="text-gray-700 mb-1"><strong>Call Number:</strong> {book.call_number}</p>
        <p className="text-gray-700 mb-1"><strong>Description:</strong> {book.description || "N/A"}</p>
        {book.book_cover && (
          <img
            src={book.book_cover}
            alt={book.title}
            className="mt-4 w-32 h-44 object-cover border"
          />
        )}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}
