import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";

type Flash = {
  imported?: number;
  duplicate?: string[];
  errors_import?: string[];
  success?: string;
};

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  flash?: Flash;
};

export default function ImportCSVModal({ isOpen, closeModal, flash }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Show toast messages when flash changes
  useEffect(() => {
    if (!flash) return;

    if (flash.imported && flash.imported > 0) {
      toast.success(`Successfully imported ${flash.imported} row(s).`);
    }

    if (flash.duplicate && flash.duplicate.length > 0) {
      flash.duplicate.forEach((dup) => {
        toast.error(`The book "${dup}" is already imported.`);
      });
    }

    if (flash.errors_import && flash.errors_import.length > 0) {
      flash.errors_import.forEach((err) => toast.error(err));
    }
  }, [flash]);

  if (!isOpen) return null;

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a CSV or Excel file.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    router.post("/books/import", formData, {
      preserveScroll: true,
      onFinish: () => setLoading(false),
      onSuccess: () => {
        setFile(null);
        closeModal();
      },
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 overflow-auto">
      <div className="relative w-full max-w-lg p-8 bg-white rounded-md shadow-xl transition-all">
        <h2 className="text-lg font-semibold mb-4">Import Books (CSV / Excel)</h2>

        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select File</label>
            <Input
              type="file"
              accept=".csv, .xlsx, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={closeModal}
              className="py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Importing..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
