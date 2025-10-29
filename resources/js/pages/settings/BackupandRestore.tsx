import React, { useEffect, useState, createContext, useContext, useCallback } from "react";
import axios from "axios";
import { Head } from "@inertiajs/react";
import SettingsLayout from "@/layouts/settings/layout";
import AppLayout from "@/layouts/app-layout";
import HeadingSmall from "@/components/heading-small";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import RestoreModal from "@/components/RestoreModal"
import ConfirmRestoreModal from "@/components/ConfirmRestoreModal";


// 🧠 Context for progress
interface ProgressContextType {
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
}
const ProgressContext = createContext<ProgressContextType | undefined>(undefined);
const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
};

// 📊 Simple progress bar component
const ProgressBar: React.FC = () => {
  const { progress } = useProgress();
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 mt-3 overflow-hidden">
      <div
        className="h-3 bg-blue-600 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// 📦 Backup type
interface Backup {
  filename: string;
  created_at: string;
}

// -----------------------------------------------------------
// BackupRestore Component (with confirmation modal)
// -----------------------------------------------------------
export default function BackupRestore() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Modal states
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [adminPassword, setAdminPassword] = useState("");

  // Confirmation modal states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingRestore, setPendingRestore] = useState(false);

  // fetch backups
  const fetchBackups = useCallback(async () => {
    try {
      const res = await axios.get<Backup[]>("/settings/backups");
      setBackups(res.data);
    } catch {
      toast.error("❌ Failed to fetch backups");
    }
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  // create backup
  const createBackup = async () => {
    try {
      setIsLoading(true);
      setProgress(10);
      toast.loading("Creating backup... Please wait.", { id: "backup" });

      await axios.post("/settings/backup/store");
      setProgress(70);

      setTimeout(async () => {
        setProgress(100);
        toast.dismiss("backup");
        toast.success("✅ Backup completed successfully!");
        await fetchBackups();
        setIsLoading(false);
        setProgress(0);
      }, 1800);
    } catch {
      toast.dismiss("backup");
      toast.error("❌ Error creating backup.");
      setIsLoading(false);
      setProgress(0);
    }
  };

  // download backup
  const downloadBackup = async (filename: string) => {
    try {
      setIsLoading(true);
      setProgress(20);
      toast.loading("Downloading backup...", { id: "download" });

      const res = await axios.get(`/settings/backups/download/${filename}`, {
        responseType: "blob",
        onDownloadProgress: (event) => {
          if (event.total) setProgress((event.loaded / event.total) * 100);
        },
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.dismiss("download");
      toast.success("📦 Backup downloaded!");
      setProgress(100);
    } catch {
      toast.dismiss("download");
      toast.error("❌ Error downloading backup.");
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // Open modal (clears previous values)
  const openRestoreModal = () => {
    setRestoreFile(null);
    setAdminPassword("");
    setIsRestoreModalOpen(true);
  };

  const closeRestoreModal = () => {
    setIsRestoreModalOpen(false);
    setRestoreFile(null);
    setAdminPassword("");
  };

  // handle Escape key to close modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRestoreModal();
    };
    if (isRestoreModalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isRestoreModalOpen]);

  // Upload & restore handler (open confirm modal first)
  const handleRestoreUpload = async () => {
    if (!restoreFile || !adminPassword) {
      toast.error("⚠️ Please select a file and enter the admin password.");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  // Confirm restore (proceed after modal)
  const confirmRestore = async () => {
    setIsConfirmModalOpen(false);
    setPendingRestore(true);

    const formData = new FormData();
    formData.append("file", restoreFile!);
    formData.append("password", adminPassword);

    try {
      setIsLoading(true);
      toast.loading("Starting restore...", { id: "restore" });

      const res = await axios.post("/settings/backups/upload-restore", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.dismiss("restore");

      if (res.data?.success) {
        toast.success("✅ Restore completed successfully!");
        closeRestoreModal();

        // 🧠 Auto logout after short delay
        setTimeout(async () => {
          try {
            await axios.post("/logout");
            toast.success("🔒 You’ve been logged out for security.");
            window.location.href = "/login";
          } catch {
            window.location.href = "/login";
          }
        }, 1000);
      } else {
        toast.error(res.data?.message || "❌ Restore failed.");
      }
    } catch (err: any) {
      toast.dismiss("restore");
      toast.error(err?.response?.data?.message || "❌ Restore failed.");
    } finally {
      setIsLoading(false);
      setPendingRestore(false);
    }
  };

  return (
    <ProgressContext.Provider value={{ progress, setProgress }}>
      <AppLayout>
        <Head title="Backup and Restore" />
        <SettingsLayout>
          <div className="space-y-6">
            <HeadingSmall
              title="Backup & Restore"
              description="Create, download, and restore database backups."
            />

            {/* Top actions: Restore (modal) + Create Backup */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
              <div className="flex items-center gap-3">
                <Button
                  onClick={createBackup}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                >
                  {isLoading ? "Processing..." : "💾 Create Backup"}
                </Button>
                <Button
                  onClick={openRestoreModal}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                   Restore
                </Button>
              </div>
            </div>

            {isLoading && <ProgressBar />}

            {/* Backups table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow bg-white mt-4">
              <table className="min-w-full text-sm text-gray-700">
                <thead>
                  <tr className="bg-purple-900 text-white text-left">
                    <th className="p-3">Filename</th>
                    <th className="p-3">Created</th>
                    <th className="p-3 text-center w-56">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.length ? (
                    backups.map((b, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-3 break-all">{b.filename}</td>
                        <td className="p-3 whitespace-nowrap">{b.created_at}</td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              onClick={() => downloadBackup(b.filename)}
                              disabled={isLoading}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Download
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-gray-500">
                        No backups found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* -------------------------
                Restore Modal
               ------------------------- */}
            <RestoreModal
              isOpen={isRestoreModalOpen}
              isLoading={isLoading}
              restoreFile={restoreFile}
              adminPassword={adminPassword}
              onFileChange={setRestoreFile}
              onPasswordChange={setAdminPassword}
              onClose={closeRestoreModal}
              onStartRestore={handleRestoreUpload}
            />

            <ConfirmRestoreModal
              isOpen={isConfirmModalOpen}
              isLoading={isLoading}
              pendingRestore={pendingRestore}
              onClose={() => setIsConfirmModalOpen(false)}
              onConfirm={confirmRestore}
            />
          </div>
        </SettingsLayout>
      </AppLayout>
    </ProgressContext.Provider>
  );
}
