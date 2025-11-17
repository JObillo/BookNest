import { Dialog, Input } from "@headlessui/react";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Flash {
  success?: string;
  error?: string;
}

interface ImportPatronModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportPatronModal({ isOpen, onClose }: ImportPatronModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a CSV or Excel file.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    router.post("/borrowers/import", formData, {
      onSuccess: (page) => {
        setFile(null);
        onClose();
        setLoading(false);

        const flash = page.props.flash as Flash | undefined;
        if (flash?.success) toast.success(flash.success);
        else if (flash?.error) toast.error(flash.error);
        else toast.success("Borrowers imported successfully");

        router.reload({ only: ["patrons"] });
      },
      onError: () => {
        toast.error("Failed to import borrowers");
        setLoading(false);
      },
      onFinish: () => setLoading(false),
    });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
      <div className="bg-white rounded-lg p-6 w-96 z-50 shadow-lg">
        <Dialog.Title className="text-lg font-semibold mb-4">
          Import Borrowers
        </Dialog.Title>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="border px-3 py-2 rounded"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer bg-gray-500 px-4 py-2 text-white border rounded hover:bg-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 flex items-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Importing..." : "Import"}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
