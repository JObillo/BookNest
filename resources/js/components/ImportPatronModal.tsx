import { Dialog, Input } from "@headlessui/react";
import { router } from "@inertiajs/react";
import { useState } from "react";

interface ImportPatronModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportPatronModal({ isOpen, onClose }: ImportPatronModalProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    router.post("/borrowers/import", formData, {
      onSuccess: () => {
        setFile(null);
        onClose();
      },
      onError: () => console.log("Failed to import"),
    });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true"></div>

      {/* Panel */}
      <div className="bg-white rounded-lg p-6 w-96 z-50 shadow-lg">
        <Dialog.Title className="text-lg font-semibold mb-4">
          Import Borrowers
        </Dialog.Title>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="file"
            accept=".csv, .xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="border px-3 py-2 rounded"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
            >
              Import
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
