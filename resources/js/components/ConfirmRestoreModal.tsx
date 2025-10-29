import React from "react";
import { Button } from "@/components/ui/button";

interface ConfirmRestoreModalProps {
  isOpen: boolean;
  isLoading: boolean;
  pendingRestore: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmRestoreModal: React.FC<ConfirmRestoreModalProps> = ({
  isOpen,
  isLoading,
  pendingRestore,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-60 max-w-md w-full bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-3">⚠️ Confirm Restore</h3>
        <p className="text-sm text-gray-600 mb-5">
          Restoring will <strong>overwrite your current database</strong>. Are you sure you
          want to continue?
        </p>

        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isLoading || pendingRestore}
          >
            {pendingRestore ? "Restoring..." : "Yes, Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRestoreModal;
