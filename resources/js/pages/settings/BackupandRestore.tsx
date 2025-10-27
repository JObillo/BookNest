import React, { useEffect, useState, createContext, useContext } from "react";
import axios from "axios";
import { Head } from "@inertiajs/react";
import SettingsLayout from "@/layouts/settings/layout";
import AppLayout from "@/layouts/app-layout";
import HeadingSmall from "@/components/heading-small";
import { Button } from "@/components/ui/button";

// 🧠 Progress Context
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

// 📊 Progress Bar
const ProgressBar: React.FC = () => {
  const { progress } = useProgress();
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
      <div
        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

// 📦 BackupRestore Component
interface Backup {
  filename: string;
  created_at: string;
}

export default function BackupRestore() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // 📂 Fetch existing backups
  const fetchBackups = async () => {
    try {
      const res = await axios.get<Backup[]>("/settings/backups");
      setBackups(res.data);
    } catch (error) {
      console.error("Failed to fetch backups", error);
    }
  };

  // 💾 Create backup
  const createBackup = async () => {
    try {
      setIsLoading(true);
      setProgress(0);

      const res = await axios.post("/settings/backup/store", {}, {
        onDownloadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });

      setProgress(100);
      setModalMessage(res.data.message || "✅ Backup created successfully!");
      setShowModal(true);
      await fetchBackups();
    } catch (error: any) {
      setModalMessage("❌ Error creating backup: " + (error.response?.data?.message || error.message));
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ⬇️ Download backup
  const downloadBackup = async (filename: string) => {
    try {
      setIsLoading(true);
      setProgress(0);

      const res = await axios.get(`/settings/backups/download/${filename}`, {
        responseType: "blob",
        onDownloadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setProgress(100);
    } catch (error: any) {
      setModalMessage(error.response?.data?.message || "Error downloading backup");
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ♻️ Restore backup
  const restoreBackup = async (filename: string) => {
    try {
      setIsLoading(true);
      setProgress(0);
      const res = await axios.post(`/settings/backups/restore/${filename}`);
      setModalMessage(res.data.message || "Restoring database...");
      setShowModal(true);

      const interval = setInterval(async () => {
        try {
          const statusRes = await axios.get("/settings/restore-status");
          const { status, percent } = statusRes.data;

          if (percent !== undefined) setProgress(percent);

          if (status === "done") {
            clearInterval(interval);
            setProgress(100);
            setModalMessage("✅ Restore completed successfully!");
            setIsLoading(false);
          } else if (status === "error") {
            clearInterval(interval);
            setModalMessage("❌ Restore failed. Please check logs.");
            setIsLoading(false);
          }
        } catch {
          clearInterval(interval);
          setModalMessage("⚠️ Failed to check restore status.");
          setIsLoading(false);
        }
      }, 2000);
    } catch (error: any) {
      setIsLoading(false);
      setModalMessage("❌ Error starting restore: " + (error.response?.data?.message || error.message));
      setShowModal(true);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  return (
    <ProgressContext.Provider value={{ progress, setProgress }}>
      <AppLayout>
        <Head title="Backup & Restore" />
        <SettingsLayout>
          <div className="space-y-6 overflow-x-hidden">
            <HeadingSmall
              title="Backup & Restore"
              description="Create, download, and restore database backups."
            />

            {/* Actions */}
            <div className="flex justify-start">
              <Button
                onClick={createBackup}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? "Processing..." : "💾 Create Backup"}
              </Button>
            </div>

            {isLoading && <ProgressBar />}

            {/* Backups Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow bg-white mt-4">
              <table className="min-w-full text-sm text-gray-700">
                <thead>
                  <tr className="bg-purple-900 text-white text-left">
                    <th className="p-3">Filename</th>
                    <th className="p-3">Created At</th>
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
                            <Button
                              onClick={() => restoreBackup(b.filename)}
                              disabled={isLoading}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Restore
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
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/40">
              <div className="bg-white rounded-2xl shadow-lg p-6 w-80 text-center">
                <h2 className="text-lg font-semibold mb-3">System Message</h2>
                <p className="text-gray-700 mb-4">{modalMessage}</p>
                <Button onClick={() => setShowModal(false)} className="bg-green-600 text-white hover:bg-green-700">
                  OK
                </Button>
              </div>
            </div>
          )}
        </SettingsLayout>
      </AppLayout>
    </ProgressContext.Provider>
  );
}
