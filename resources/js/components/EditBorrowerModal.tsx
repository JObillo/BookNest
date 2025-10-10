import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

type Patron = {
  id: number;
  school_id?: string | null;
  name: string;
  email: string;
  course?: string | null;
  year?: string | null;
  department?: string | null;
  patron_type: "Student" | "Faculty" | "Guest";
  contact_number?: string | null;
  address?: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  patron: Patron;
};

export default function EditBorrowerModal({ isOpen, onClose, patron }: Props) {
  const [formData, setFormData] = useState<Patron>(patron);

  const courses = ["BSIT", "BSCS", "BSCpE", "BSED", "BEED", "BSBA", "BSHM", "BSCRIM"];
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const departments = [
    "College of Education",
    "College of Computer Studies",
    "College of Business",
    "College of Criminology",
    "College of Hospitality Management",
  ];

  useEffect(() => {
    if (isOpen) setFormData({ ...patron });
  }, [isOpen, patron]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!/^[a-zA-Z\s]+$/.test(formData.name)) errors.push("Name must contain letters only.");
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.push("Email is invalid.");

    if (formData.patron_type === "Student" || formData.patron_type === "Faculty") {
      if (!/^\d{6}$/.test(formData.school_id || "")) errors.push("School ID must be 6 digits.");
    } else if (formData.patron_type === "Guest") {
      if (!/^G-\d+$/.test(formData.school_id || "")) errors.push("Guest ID must be in format G-xxxxx.");
      if (!/^\d+$/.test(formData.contact_number || "")) errors.push("Contact Number must contain numbers only.");
    }

    if (formData.patron_type === "Student") {
      if (!formData.department) errors.push("Department is required.");
      if (!formData.course) errors.push("Course is required.");
      if (!formData.year) errors.push("Year is required.");
    }

    if (formData.patron_type === "Faculty" && !formData.department) errors.push("Department is required.");

    if (errors.length) {
      toast.error(errors.join(" "));
      return;
    }

    router.put(`/borrowers/${patron.id}`, formData, {
      onSuccess: () => {
        toast.success("Borrower updated successfully");
        onClose();
      },
      onError: () => toast.error("Failed to update borrower"),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
        <h2 className="text-xl font-bold mb-4">Edit Borrower</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="school_id"
            value={formData.school_id || ""}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            placeholder={formData.patron_type === "Guest" ? "Guest ID" : "School ID"}
            required
          />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            placeholder="Full Name"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            placeholder="Email"
            required
          />

          {/* Department for Student & Faculty */}
          {(formData.patron_type === "Student" || formData.patron_type === "Faculty") && (
            <select
              name="department"
              value={formData.department || ""}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}

          {/* Student-specific fields */}
          {formData.patron_type === "Student" && (
            <>
              <select name="course" value={formData.course || ""} onChange={handleChange} className="border p-2 w-full rounded" required>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select name="year" value={formData.year || ""} onChange={handleChange} className="border p-2 w-full rounded" required>
                <option value="">Select Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </>
          )}

          {/* Guest-specific fields */}
          {formData.patron_type === "Guest" && (
            <>
              <input type="text" name="contact_number" value={formData.contact_number || ""} onChange={handleChange} className="border p-2 w-full rounded" placeholder="Contact Number" required />
              <input type="text" name="address" value={formData.address || ""} onChange={handleChange} className="border p-2 w-full rounded" placeholder="Address" required />
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}
