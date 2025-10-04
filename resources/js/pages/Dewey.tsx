import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import DeweyModal from "../components/DeweyModal";
import AppLayout from "@/layouts/app-layout";
import { Toaster, toast } from "sonner";
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
      title: 'Manage Dewey',
      href: '/deweys',
  },
];

type Dewey = {
  id: number;
  dewey_number: string;
  dewey_classification: string;
};

export default function Deweys() {
  // Fix: Destructuring 'deweys' instead of 'dewey'
  const { deweys } = usePage<{ deweys: Dewey[] }>().props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDewey, setSelectedDewey] = useState<Dewey | null>(null);

  const openModal = (dewey: Dewey | null = null) => {
    setSelectedDewey(dewey);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    // if (!confirm("Are you sure you want to delete this book?")) return;
    router.delete(`/dewey/${id}`, {
      onSuccess: () => {
        toast.success("Dewey deleted successfully.");
        router.reload();
      },
      onError: () => {
        toast.success("Failed to Delete.");
        console.error("Failed to delete Section.");
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dewey" />
      <Toaster position="top-right" richColors />

      <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded">
        <div className="flex justify-end">
          <button
            onClick={() => openModal()}
            className="bg-green-600 text-white font-medium rounded-lg px-4 py-2 shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-200 mr-5"
          >
            Add Dewey
          </button>
        </div>

        <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
          <thead>
            <tr className="bg-purple-900 text-white border-b">
              {[
                "Dewey ID",
                "Dewey Number",
                "Dewey Classification",
                "Actions",
              ].map((header) => (
                <th key={header} className="border p-3 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deweys.length ? (
              deweys.map((dewey) => (
                <tr key={dewey.id} className="border-b hover:bg-gray-100">
                  <td className="p-3">{dewey.id}</td>
                  <td className="p-3">{dewey.dewey_number}</td>
                  <td className="p-3">{dewey.dewey_classification}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => openModal(dewey)}
                      className="bg-blue-500 text-sm text-white px-3 py-1 rounded cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dewey.id)}
                      className="bg-red-500 text-sm text-white px-3 py-1 rounded cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center p-4 text-gray-600">
                  No Section found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DeweyModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        dewey={selectedDewey}
      />
    </AppLayout>
  );
}
