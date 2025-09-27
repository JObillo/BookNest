import { Input, Select } from "@headlessui/react";
import { useState, useEffect } from "react";

type Props = {
  isOpen: boolean;
  semester?: {
    id?: number;
    name?: string;
    school_year?: string;
    start_date?: string;
    end_date?: string;
    status?: "Active" | "Inactive";
  };
  onClose: () => void;
  onSave: (data: any) => void;
};

export default function SemesterModal({ isOpen, semester, onClose, onSave }: Props) {
  const [name, setName] = useState("1st Semester"); // default
  const [schoolYear, setSchoolYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Inactive"); // default to Inactive

  useEffect(() => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return dateString.split("T")[0] || dateString.split(" ")[0]; // handles both ISO and MySQL formats
  };

  if (semester) {
    setName(semester.name || "1st Semester");
    setSchoolYear(semester.school_year || "");
    setStartDate(formatDate(semester.start_date));
    setEndDate(formatDate(semester.end_date));
    setStatus(semester.status || "Inactive");
  } else {
    setName("1st Semester");
    setSchoolYear("");
    setStartDate("");
    setEndDate("");
    setStatus("Inactive");
  }
}, [semester]);


  if (!isOpen) return null;

  const toggleStatus = () => {
    setStatus(status === "Active" ? "Inactive" : "Active");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, school_year: schoolYear, start_date: startDate, end_date: endDate, status });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">{semester ? "Edit Semester" : "Add Semester"}</h2>

        {/* Semester Dropdown */}
        <label className="block mb-1 font-semibold">Semester</label>
        <Select
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-2 py-1 mb-2"
          required
        >
          <option value="1st Semester">1st Semester</option>
          <option value="2nd Semester">2nd Semester</option>
        </Select>

        {/* School Year */}
        <label className="block mb-1 font-semibold">School Year</label>
        <input
          type="text"
          placeholder="e.g. 2025-2026"
          value={schoolYear}
          onChange={(e) => setSchoolYear(e.target.value)}
          className="w-full border px-2 py-1 mb-2"
          required
        />

        {/* Start Date */}
        <label className="block mb-1 font-semibold">Start Date</label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border px-2 py-1 mb-2"
          required
        />

        {/* End Date */}
        <label className="block mb-1 font-semibold">End Date</label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full border px-2 py-1 mb-2"
          required
        />

        {/* Status Button */}
        <button
          type="button"
          onClick={toggleStatus}
          className={`w-full py-1 mb-4 rounded font-semibold ${
            status === "Active" ? "bg-green-600 text-white" : "bg-gray-400 text-black"
          }`}
        >
          {semester
            ? status === "Active"
              ? "Deactivate"
              : "Activate"
            : status === "Active"
            ? "Active"
            : "Inactive"}
        </button>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-1 border rounded">
            Cancel
          </button>
          <button type="submit" className="px-4 py-1 bg-purple-700 text-white rounded">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
