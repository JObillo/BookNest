import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { router } from "@inertiajs/react";


interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ebook: any) => void;
}

export default function AddEbookModal({ isOpen, onClose, onSubmit }: Props) {
  const [form, setForm] = useState({
    title: "",
    author: "",
    publisher: "",
    year: "",
    cover: null as File | null,
    file_url: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const data = new FormData();
  data.append("title", form.title);
  data.append("author", form.author);
  data.append("publisher", form.publisher);
  data.append("year", form.year || "");

  if (form.cover) data.append("cover", form.cover);
  if (form.file_url) data.append("file_url", form.file_url);

  router.post("/ebooks", data, {
    onSuccess: () => {
    toast.success("eBook added successfully.");
    onClose();

  // 🔁 Reload the /ebooks page to get fresh data
  router.visit("/ebooks");
},

    onError: (errors) => {
      console.error("Create errors:", errors);
      toast.error("Failed to add eBook.");
    },
  });
};



  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Dialog.Panel className="bg-white p-6 rounded-xl w-full max-w-lg space-y-4 shadow-xl">
        <Dialog.Title className="text-lg font-bold">Add E-book</Dialog.Title>

        <Input name="title" placeholder="Title" onChange={handleChange} />
        <Input name="author" placeholder="Author" onChange={handleChange} />
        <Input name="publisher" placeholder="Publisher" onChange={handleChange} />
        <Input name="year" placeholder="Year" onChange={handleChange} />

        <label className="block text-sm font-medium">Cover Image</label>
        <Input name="cover" type="file" accept="image/*" onChange={handleFileChange} />

        <label className="block text-sm font-medium">E-book File</label>
        <Input name="file_url" type="file" accept=".pdf,.epub" onChange={handleFileChange} />
    
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add</Button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
