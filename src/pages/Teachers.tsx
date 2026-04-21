import React, { useEffect, useState, useCallback, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";

import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface Teacher {
  id: number;
  staffId: string;
  name: string;
  subject: string;
  room: string;
}

const BASE_URL = process.env.REACT_APP_API_URL;

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // NEW: State to track if we are editing a specific teacher
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    staffId: "",
    name: "",
    subject: "",
    room: "",
  });

  const token = localStorage.getItem("admin_token");

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/teachers/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      let teachersArray = [];
      if (Array.isArray(result)) {
        teachersArray = result;
      } else if (result && Array.isArray(result.teachers)) {
        teachersArray = result.teachers;
      } else if (result && Array.isArray(result.data)) {
        teachersArray = result.data;
      }

      setTeachers(teachersArray);
    } catch (err) {
      toast.error("Failed to fetch teachers");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(
      (t) =>
        (t.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (t.staffId?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (t.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
    );
  }, [teachers, searchQuery]);

  // --- NEW: Handle opening modal for EDIT ---
  const handleEditClick = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setFormData({
      staffId: teacher.staffId,
      name: teacher.name,
      subject: teacher.subject,
      room: teacher.room,
    });
    setIsModalOpen(true);
  };

  // --- UPDATED: Combined Add/Update Logic ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(
      editingId ? "Updating teacher..." : "Registering teacher...",
    );

    // Determine URL and Method based on mode (Edit vs Add)
    const url = editingId
      ? `${BASE_URL}/api/teachers/${editingId}` // PUT /api/teachers/:id
      : `${BASE_URL}/api/teachers/add`; // POST /api/teachers/add

    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingId ? "Teacher updated!" : "Teacher registered!", {
          id: loadingToast,
        });
        closeModal();
        fetchTeachers();
      } else {
        toast.error(data.message || "Failed to process request", {
          id: loadingToast,
        });
      }
    } catch (err) {
      toast.error("Server error connecting to database", { id: loadingToast });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ staffId: "", name: "", subject: "", room: "" });
  };

  // --- UPDATED: Delete Logic ---
  const handleDelete = (id: number) => {
    // Instead of window.confirm, we trigger a custom toast
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-700">
            Are you sure you want to delete this teacher?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-xs font-semibold text-gray-00 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id); // Close the confirm toast
                await proceedWithDelete(id); // Call the actual API function
              }}
              className="px-3 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: 6000, // Give them 6 seconds to decide
        position: "top-center",
        style: {
          minWidth: "300px",
          padding: "16px",
        },
      },
    );
  };

  // This function actually talks to the database
  const proceedWithDelete = async (id: number) => {
    const tid = toast.loading("Deleting record...");
    try {
      const resp = await fetch(`${BASE_URL}/api/teachers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.ok) {
        toast.success("Teacher removed", { id: tid });
        setTeachers((prev) => prev.filter((t) => t.id !== id));
      } else {
        toast.error("Delete failed", { id: tid });
      }
    } catch (err) {
      toast.error("Network error", { id: tid });
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-700 relative">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-indigo-600">
            Teachers
          </h1>
          <p className="text-gray-600 mt-1">
            Manage staff information and room locations
          </p>
          <input
            type="text"
            placeholder="Search by name, staff ID, or subject..."
            className="mt-3 w-80 p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchTeachers}
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 hover:bg-gray-100 transition-all shadow-sm"
          >
            <ArrowPathIcon
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <PlusIcon className="w-5 h-5 stroke-[2.5px]" />
            <span className="font-semibold">Add Teacher</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-800 text-xs uppercase tracking-widest bg-gray-50/50">
                <th className="px-6 py-4 font-semibold">Staff ID</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Room</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {!loading &&
                filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold uppercase">
                      {/* staffId usually looks better in all Uppercase */}
                      {teacher.staffId}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 capitalize">
                      {/* Forces Name to: "Try Kimhong" */}
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md font-medium capitalize">
                        {/* Forces Subject to: "Mathematics" */}
                        {teacher.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-800 capitalize">
                      {/* Forces Room to: "Room 101" */}
                      {teacher.room}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* EDIT BUTTON */}
                        <button
                          onClick={() => handleEditClick(teacher)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "Update Teacher" : "Add New Teacher"}
              </h2>
              <button onClick={closeModal}>
                <XMarkIcon className="w-6 h-6 text-gray-700 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-800">
                    Staff ID
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600"
                    value={formData.staffId}
                    onChange={(e) =>
                      setFormData({ ...formData, staffId: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-800">
                    Room
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600"
                    value={formData.room}
                    onChange={(e) =>
                      setFormData({ ...formData, room: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  Subject
                </label>
                <input
                  required
                  type="text"
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold mt-4 hover:bg-indigo-600 transition-all shadow-lg"
              >
                {editingId ? "Update Information" : "Register Teacher"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersPage;
