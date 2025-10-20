import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

type Patron = {
  school_id: string | null;
  name: string;
  email: string;
  course: string | null;
  year: string | null;
  department: string | null;
  patron_type: string;
  contact_number?: string | null;
  address?: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function BorrowerModal({ isOpen, onClose }: Props) {
  const [formData, setFormData] = useState<Patron>({
    school_id: "",
    name: "",
    email: "",
    course: "",
    year: "",
    department: "",
    patron_type: "",
    contact_number: "",
    address: "",
  });

  const patronTypes = ["Student", "Faculty", "Guest"];
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
    if (isOpen) {
      setFormData({
        school_id: "",
        name: "",
        email: "",
        course: "",
        year: "",
        department: "",
        patron_type: "",
        contact_number: "",
        address: "",
      });
    }
  }, [isOpen]);

  // Auto-generate Guest ID
  useEffect(() => {
    if (formData.patron_type === "Guest" && !formData.school_id) {
      const randomId = `G-${Math.floor(10000 + Math.random() * 90000)}`;
      setFormData((prev) => ({ ...prev, school_id: randomId }));
    }
  }, [formData.patron_type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];

    if (!/^[a-zA-Z\s.'-]+$/.test(formData.name)) errors.push("Name contains invalid characters.");

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.push("Email is invalid.");

    if (formData.patron_type === "Student" || formData.patron_type === "Faculty") {
      if (!/^\d{5}$/.test(formData.school_id || "")) 
        errors.push("School ID must be exactly 5 digits.");
    } else if (formData.patron_type === "Guest") {
      if (!/^G-\d+$/.test(formData.school_id || "")) 
        errors.push("Guest ID must be in format G-xxxxx.");
      if (!/^\d+$/.test(formData.contact_number || "")) 
        errors.push("Contact Number must contain numbers only.");
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

    router.post(route("borrowers.store"), formData, {
      onSuccess: () => {
        toast.success("Borrower added successfully");
        onClose();
      },
      onError: () => toast.error("Failed to add borrower"),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
        <h2 className="text-xl font-bold mb-4">Add Borrower</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Borrower Type */}
          <select
            name="patron_type"
            value={formData.patron_type}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          >
            <option value="">Select Borrower Type</option>
            {patronTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {formData.patron_type && (
            <>
              <input
                type="text"
                name="school_id"
                value={formData.school_id || ""}
                onChange={handleChange}
                placeholder={formData.patron_type === "Guest" ? "Guest ID" : "School ID"}
                className="border p-2 w-full rounded"
                readOnly={formData.patron_type === "Guest"}
                required
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="border p-2 w-full rounded"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="border p-2 w-full rounded"
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
                  <select
                    name="course"
                    value={formData.course || ""}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                  <select
                    name="year"
                    value={formData.year || ""}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                    required
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </>
              )}

              {/* Guest-specific fields */}
              {formData.patron_type === "Guest" && (
                <>
                  <input
                    type="text"
                    name="contact_number"
                    value={formData.contact_number || ""}
                    onChange={handleChange}
                    placeholder="Contact Number"
                    className="border p-2 w-full rounded"
                    required
                  />
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleChange}
                    placeholder="Address"
                    className="border p-2 w-full rounded"
                    required
                  />
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
