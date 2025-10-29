import React from "react";
import { Button } from "@/components/ui/button";

interface RestoreModalProps {
  isOpen: boolean;
  isLoading: boolean;
  restoreFile: File | null;
  adminPassword: string;
  onFileChange: (file: File | null) => void;
  onPasswordChange: (password: string) => void;
  onClose: () => void;
  onStartRestore: () => void;
}

const RestoreModal: React.FC<RestoreModalProps> = ({
  isOpen,
  isLoading,
  restoreFile,
  adminPassword,
  onFileChange,
  onPasswordChange,
  onClose,
  onStartRestore,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-60 max-w-xl w-full bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-2">♻️ Restore Backup</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload a <strong>.sql</strong> or <strong>.zip</strong> file and enter the admin
          password to start the restore. This will overwrite the current database.
        </p>

        <div className="space-y-3">
          <label className="block text-sm">
            <span className="text-xs text-gray-600">Select backup file</span>
            <input
              type="file"
              accept=".sql,.zip"
              onChange={(e) => onFileChange(e.target.files?.[0] || null)}
              className="mt-2 block w-full text-sm border px-3 py-2"
            />
            {restoreFile && (
              <div className="mt-2 text-xs text-gray-700">
                Selected: {restoreFile.name}
              </div>
            )}
          </label>

          <label className="block text-sm">
            <span className="text-xs text-gray-600">Admin password</span>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Enter admin password"
              className="mt-2 block w-full rounded-md border px-3 py-2"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onStartRestore}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Restoring..." : "Start Restore"}
          </Button>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Tip: Use a recent backup file. Large files may take time to upload and process.
        </div>
      </div>
    </div>
  );
};

export default RestoreModal;
