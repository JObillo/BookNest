import { Fragment, useState } from "react";
import { Dialog, Input, Transition } from "@headlessui/react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  closeModal: () => void;
};

export default function ImportCSVModal({ isOpen, closeModal }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a CSV or Excel file.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    router.post("/books/import", formData, {
      onFinish: () => setLoading(false),
      onSuccess: (page) => {
        const props: any = page.props;

        // Show imported rows count
        if (props.imported) {
          toast.success(`${props.imported} row(s) imported successfully.`);
        }

        // Show detailed row errors
        if (props.errors && props.errors.length > 0) {
          props.errors.forEach((err: string) => toast.error(err));
        }

        setFile(null);
        closeModal();
      },
      preserveScroll: true,
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Import Books CSV/Excel
              </Dialog.Title>

              <form onSubmit={handleUpload} className="flex flex-col gap-3">
                <Input
                  type="file"
                  accept=".csv, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="border px-2 py-1 rounded"
                />

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-1 rounded border hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {loading ? "Importing..." : "Upload"}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
