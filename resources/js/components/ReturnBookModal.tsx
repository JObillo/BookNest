import React from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookTitle: string;
};

export default function ReturnBookModal({ isOpen, onClose, onConfirm, bookTitle }: Props) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">Return Book</Dialog.Title>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-500 hover:text-black" />
            </button>
          </div>
          <div className="mb-4 text-gray-800">
            Are you sure you want to mark <strong>"{bookTitle}"</strong> as returned?
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
            >
              Return Book
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
