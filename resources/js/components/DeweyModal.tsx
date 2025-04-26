import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Toaster, toast } from "sonner";

interface Dewey {
  id?: number;
  dewey_number: string;
  dewey_classification: string;
}

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  dewey?: Dewey | null;
}

export default function DeweyModal({ isOpen, closeModal, dewey }: Props) {
  const [formData, setFormData] = useState<Dewey>({
    dewey_number: "",
    dewey_classification: "",
  });

  // Set initial form data and preview when the dewey is passed
  useEffect(() => {
    if (isOpen) {
      if (dewey) {
        setFormData({
          dewey_number: dewey.dewey_number,
          dewey_classification: dewey.dewey_classification,
        });
      } else {
        setFormData({
          dewey_number: "",
          dewey_classification: "",
        });
      }
    }
  }, [isOpen, dewey]);

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
    data.append("dewey_number", formData.dewey_number);
    data.append("dewey_classification", formData.dewey_classification);

    // Toast Notifications
    const successMessage = dewey?.id
      ? "Dewey updated successfully."
      : "Dewey added successfully.";
    const errorMessage = dewey?.id
      ? "Failed to update Dewey."
      : "Failed to add Dewey.";

    if (dewey?.id) {
      // Method override for update
      data.append("_method", "PUT");
      // Update Dewey (corrected URL)
      router.post(`/deweys/${dewey.id}`, data, {
        onSuccess: () => {
          toast.success(successMessage);
          closeModal();
          router.reload();
        },
        onError: (errors) => {
          toast.error(errorMessage);
          console.error(errors.message || "Failed to submit Dewey.");
        },
      });
    } else {
      // Create new Dewey (corrected URL)
      router.post("/deweys", data, {
        onSuccess: () => {
          toast.success(successMessage);
          closeModal();
          router.reload();
        },
        onError: (errors) => {
          toast.error(errorMessage);
          console.error(errors.message || "Failed to submit Dewey.");
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center border border-black rounded-lg overflow-y-auto bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg rounded-lg border-3 border-gray-600 shadow w-full max-w-xl">
        <h2 className="text-lg font-semibold mb-4">
          {dewey ? "Edit Dewey" : "Add Dewey"}
        </h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Dewey Number */}
          <div className="mb-3">
            <label className="block text-sm font-medium">Dewey Number</label>
            <input
              type="text"
              name="dewey_number"
              value={formData.dewey_number}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>

          {/* Dewey Classification */}
          <div className="mb-3">
            <label className="block text-sm font-medium">Dewey Classification</label>
            <input
              type="text"
              name="dewey_classification"
              value={formData.dewey_classification}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {dewey ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
