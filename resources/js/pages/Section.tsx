import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import SectionModal from "../components/SectionModal";
import AppLayout from "@/layouts/app-layout";
import {Toaster, toast} from "sonner";
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
      title: 'Manage Section',
      href: '/section',
  },
];

type Section = {
    id: number;
    section_name: string;
  };
  

export default function Sections() {
  const { section } = usePage<{ section: Section[] }>().props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const openModal = (section: Section | null = null) => {
    setSelectedSection(section);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    // if (!confirm("Are you sure you want to delete this book?")) return;
    router.delete(`/section/${id}`, {
      onSuccess: () => {
        toast.success("Section deleted successfully.");
        router.reload();
    },
      onError: () => {
        toast.success("Failed to Delete.");

        console.error("Failed to delete Section.")
    },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Sections" />
      <Toaster position="top-right" richColors/>

      <div className="flex flex-col gap-6 p-6 bg-white text-black shadow-lg rounded">
        <div className="flex justify-end">
          <button
            onClick={() => openModal()}
            className="cursor-pointer bg-green-600 text-white font-medium rounded-lg ml-5 px-5 py-2 shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
          >
            Add Section
          </button>
        </div>

        <table className="w-full border-collapse bg-white text-black shadow-sm rounded-lg">
          <thead>
            <tr className="bg-purple-900 text-white border-b">
              {[
                "Section ID",
                "Section Name",
                "Actions",
              ].map((header) => (
                <th key={header} className="border p-3 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.length ? (
              section.map((section) => (
                <tr key={section.id} className="border-b hover:bg-gray-100">
                  <td className="p-3">{section.id}</td>
                  <td className="p-3">{section.section_name}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => openModal(section)}
                      className="bg-blue-500 text-sm text-white px-3 py-1 rounded cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(section.id)}
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

      <SectionModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        section={selectedSection}
      />
    </AppLayout>
  );
}
