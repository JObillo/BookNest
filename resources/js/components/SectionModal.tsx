import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Toaster, toast } from "sonner";

interface Section {
  id?: number;
  section_name: string;
}

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  section?: Section | null;
}

export default function SectionModal({ isOpen, closeModal, section }: Props) {
  const [formData, setFormData] = useState<Section>({
    section_name: "",
  });


  // Set initial form data and preview when the section is passed
  useEffect(() => {
    if (isOpen) {
      if (section) {
        setFormData({
          section_name: section.section_name,
        });
      } else {
        setFormData({
          section_name: "",
        });
      }
    }
  }, [isOpen, section]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Dynamically set the input's name and value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("section_name", formData.section_name);

    //Toast Notifications
    const successMessage = section?.id
      ? "Section updated successfully."
      : "Section Added successfully.";
    const errorMessage = section?.id
      ? "Failed to update Section."
      : "Failed to Add Section.";

    if (section?.id) {
      data.append("_method", "PUT"); // Method override for update
      router.post(`/section/${section.id}`, data, {
        onSuccess: () => {
          toast.success(successMessage);
          closeModal();
          router.reload();
        },
        onError: (errors) => {
          toast.error(errorMessage);
          console.error(errors.message || "Failed to submit Section.");
        },
      });
    } else {
      router.post("/section", data, {
        onSuccess: () => {
          toast.success(successMessage);
          closeModal();
          router.reload();
        },
        onError: (errors) => {
          toast.error(errorMessage);
          console.error(errors.message || "Failed to submit Section.");
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center border border-black rounded-lg overflow-y-auto bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg rounded-lg shadow w-full max-w-xl transition-all">
        <h2 className="text-lg font-semibold mb-4">
          {section ? "Edit Section" : "Add Section"}
        </h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Section Name */}
          <div className="mb-3">
            <label className="block text-sm font-medium">Section Name</label>
            <input
              type="text"
              name="section_name"
              value={formData.section_name}
              onChange={handleChange} // Added handleChange here
              className="w-full border rounded p-2"
              required
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col-reverse md:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={closeModal}
              className="w-full md:w-auto py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full md:w-auto py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer"
            >
              {section ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
