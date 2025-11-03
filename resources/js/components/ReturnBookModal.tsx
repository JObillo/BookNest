import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (fineStatus?: string) => void;
  bookTitle: string;
  isOverdue: boolean;
};

export default function ReturnBookModal({
  isOpen,
  onClose,
  onConfirm,
  bookTitle,
  isOverdue,
}: Props) {
  const [fineStatus, setFineStatus] = useState("cleared");

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* background shadow only (not black) */}
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 z-50">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">Return Book</Dialog.Title>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-500 hover:text-black" />
            </button>
          </div>

          <div className="mb-4 text-gray-800">
            Are you sure you want to mark <strong>"{bookTitle}"</strong> as returned?
          </div>

          {/* Show only if overdue */}
          {isOverdue && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Fine Status</label>
              <select
                value={fineStatus}
                onChange={(e) => setFineStatus(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="cleared">Cleared (paid)</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="w-full md:w-auto py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(fineStatus)}
              className="w-full md:w-auto py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Return Book
            </button>
          </div>
        </Dialog.Panel>
      </div>
      </div>
    </Dialog>
  );
}
