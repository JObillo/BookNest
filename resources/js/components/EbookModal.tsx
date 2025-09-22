import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import axios from "axios";

type Ebook = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  year: string;
  cover: string | null;
  file_url: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ebook: Ebook) => void; // Pass the new ebook to parent
}

export default function AddEbookModal({ isOpen, onClose, onSubmit }: Props) {
  const [form, setForm] = useState({
    title: "",
    author: "",
    publisher: "",
    year: "",
    description: "",
    cover: null as File | null,
    file_url: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const resetForm = () => {
    setForm({
      title: "",
      author: "",
      publisher: "",
      year: "",
      description: "",
      cover: null,
      file_url: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append("title", form.title);
    data.append("author", form.author);
    data.append("publisher", form.publisher || "");
    data.append("description", form.description);
    data.append("year", form.year || "");
    if (form.cover) data.append("cover", form.cover);
    if (form.file_url) data.append("file_url", form.file_url);

    try {
      const response = await axios.post("/ebooks", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newEbook = response.data.newEbook;
      if (newEbook) onSubmit(newEbook); // Add ebook to parent list immediately

      toast.success("Ebook added successfully!");
      resetForm();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to add ebook.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster />
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        <Dialog.Panel className="bg-white p-6 rounded-xl w-full max-w-lg space-y-4 shadow-xl">
          <Dialog.Title className="text-lg font-bold">Add E-book</Dialog.Title>

          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="space-y-4"
          >
            <Input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            <Input
              name="author"
              placeholder="Author"
              value={form.author}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            <Input
              name="publisher"
              placeholder="Publisher"
              value={form.publisher}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <Input
              name="year"
              placeholder="Year"
              value={form.year}
              onChange={handleChange}
              disabled={isSubmitting}
            />

            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full border rounded p-2"
              disabled={isSubmitting}
            />

            <label className="block text-sm font-medium">Cover Image</label>
            <Input
              name="cover"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />

            <label className="block text-sm font-medium">E-book File</label>
            <Input
              name="file_url"
              type="file"
              accept=".pdf,.epub"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add"}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}
