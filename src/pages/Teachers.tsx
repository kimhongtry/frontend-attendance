// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import {
//   PlusIcon,
//   MagnifyingGlassIcon,
//   FunnelIcon,
//   PencilSquareIcon,
//   TrashIcon,
//   XMarkIcon,
// } from "@heroicons/react/24/outline";

// interface Teacher {
//   id: number;
//   staffId: string;
//   name: string;
//   subject: string;
//   room: string;
// }

// const TeachersPage = () => {
//   const [teachers, setTeachers] = useState<Teacher[]>([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState(""); // State for search

//   const [formData, setFormData] = useState({
//     staffId: "",
//     name: "",
//     subject: "",
//     room: "",
//   });

//   const token = localStorage.getItem("admin_token");

//   const fetchTeachers = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await fetch("http://localhost:5000/api/teachers/all", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const result = await response.json();

//       // 1. Log this so we can see the exact structure in the console
//       console.log("Database Response:", result);

//       // 2. Smart Detection:
//       // If result is an array, use it.
//       // If result is an object with a 'teachers' or 'data' key, use that.
//       let teachersArray = [];
//       if (Array.isArray(result)) {
//         teachersArray = result;
//       } else if (result && Array.isArray(result.teachers)) {
//         teachersArray = result.teachers;
//       } else if (result && Array.isArray(result.data)) {
//         teachersArray = result.data;
//       }

//       setTeachers(teachersArray);
//     } catch (err) {
//       console.error("Fetch error:", err);
//       setTeachers([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [token]);

//   useEffect(() => {
//     fetchTeachers();
//   }, [fetchTeachers]);

//   // --- Search Logic ---
//   const filteredTeachers = useMemo(() => {
//     return teachers.filter(
//       (t) =>
//         t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         t.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         t.subject.toLowerCase().includes(searchQuery.toLowerCase()),
//     );
//   }, [teachers, searchQuery]);

//   const handleAddTeacher = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await fetch("http://localhost:5000/api/teachers/add", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(formData),
//       });

//       if (response.ok) {
//         setIsModalOpen(false);
//         setFormData({ staffId: "", name: "", subject: "", room: "" });
//         fetchTeachers();
//       } else {
//         alert("Failed to add teacher");
//       }
//     } catch (err) {
//       alert("Server error");
//     }
//   };

//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Delete this teacher?")) return;
//     try {
//       const response = await fetch(`http://localhost:5000/api/teachers/${id}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (response.ok) {
//         setTeachers(teachers.filter((t) => t.id !== id));
//       }
//     } catch (err) {
//       alert("Delete failed");
//     }
//   };

//   return (
//     <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-900 relative">
//       {/* Header Section */}
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
//           <p className="text-gray-500 mt-1">
//             Manage teacher information and schedules
//           </p>
//         </div>
//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 shadow-indigo-200"
//         >
//           <PlusIcon className="w-5 h-5 stroke-[2.5px]" />
//           <span className="font-semibold">Add Teacher</span>
//         </button>
//       </div>

//       {/* Search & Filter Row */}
//       <div className="flex flex-col md:flex-row gap-4 mb-6">
//         <div className="relative flex-1">
//           <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search by name, subject, or ID..."
//             className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//         <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
//           <FunnelIcon className="w-5 h-5" />
//           <span>Filters</span>
//         </button>
//       </div>

//       {/* Table Section */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//         <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
//           <h2 className="text-lg font-bold text-gray-800">
//             Teaching Staff List
//           </h2>
//           <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
//             {filteredTeachers.length} Total Records
//           </span>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="text-gray-400 text-xs uppercase tracking-widest bg-gray-50/50">
//                 <th className="px-6 py-4 font-semibold">Staff ID</th>
//                 <th className="px-6 py-4 font-semibold">Name</th>
//                 <th className="px-6 py-4 font-semibold">Subject</th>
//                 <th className="px-6 py-4 font-semibold">Room</th>
//                 <th className="px-6 py-4 font-semibold text-right">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50 text-sm">
//               {loading ? (
//                 <tr>
//                   <td
//                     colSpan={5}
//                     className="text-center p-10 text-gray-400 animate-pulse"
//                   >
//                     Syncing with Neon DB...
//                   </td>
//                 </tr>
//               ) : filteredTeachers.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={5}
//                     className="text-center p-10 text-gray-400 italic"
//                   >
//                     No teachers found matching your search.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredTeachers.map((teacher) => (
//                   <tr
//                     key={teacher.id}
//                     className="hover:bg-gray-50/80 transition-colors"
//                   >
//                     <td className="px-6 py-4 font-mono text-xs text-gray-500 font-bold">
//                       {teacher.staffId}
//                     </td>
//                     <td className="px-6 py-4 font-semibold text-gray-900">
//                       {teacher.name}
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md font-medium">
//                         {teacher.subject}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-gray-600 italic">
//                       {teacher.room}
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <div className="flex justify-end gap-2">
//                         <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
//                           <PencilSquareIcon className="w-5 h-5" />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(teacher.id)}
//                           className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                         >
//                           <TrashIcon className="w-5 h-5" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* --- ADD TEACHER MODAL --- */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
//           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
//             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
//               <h2 className="text-xl font-bold text-gray-800">
//                 Add New Teacher
//               </h2>
//               <button onClick={() => setIsModalOpen(false)}>
//                 <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
//               </button>
//             </div>
//             <form onSubmit={handleAddTeacher} className="p-6 space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
//                     Staff ID
//                   </label>
//                   <input
//                     required
//                     placeholder="T-1000"
//                     type="text"
//                     className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
//                     value={formData.staffId}
//                     onChange={(e) =>
//                       setFormData({ ...formData, staffId: e.target.value })
//                     }
//                   />
//                 </div>
//                 <div>
//                   <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
//                     Room
//                   </label>
//                   <input
//                     required
//                     placeholder="A-201"
//                     type="text"
//                     className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
//                     value={formData.room}
//                     onChange={(e) =>
//                       setFormData({ ...formData, room: e.target.value })
//                     }
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
//                   Full Name
//                 </label>
//                 <input
//                   required
//                   placeholder="Mr. Dara Vichea"
//                   type="text"
//                   className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
//                   value={formData.name}
//                   onChange={(e) =>
//                     setFormData({ ...formData, name: e.target.value })
//                   }
//                 />
//               </div>
//               <div>
//                 <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
//                   Subject
//                 </label>
//                 <input
//                   required
//                   placeholder="Mathematics"
//                   type="text"
//                   className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
//                   value={formData.subject}
//                   onChange={(e) =>
//                     setFormData({ ...formData, subject: e.target.value })
//                   }
//                 />
//               </div>
//               <button
//                 type="submit"
//                 className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold mt-4 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
//               >
//                 Register Teacher
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TeachersPage;
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// Interface matching your Neon DB columns exactly: id, staffId, name, subject, room
interface Teacher {
  id: number;
  staffId: string;
  name: string;
  subject: string;
  room: string;
}

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    staffId: "",
    name: "",
    subject: "",
    room: "",
  });

  const token = localStorage.getItem("admin_token");

  // 1. Optimized Fetch with Smart Detection for Neon/TypeORM responses
  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/teachers/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      console.log("Database Response:", result);

      // Handles various JSON structures: raw array, { data: [] }, or { teachers: [] }
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
      console.error("Fetch error:", err);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // 2. Search Logic (Filtering by Name, ID, or Subject)
  const filteredTeachers = useMemo(() => {
    return teachers.filter(
      (t) =>
        (t.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (t.staffId?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (t.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
    );
  }, [teachers, searchQuery]);

  // 3. Add Teacher Logic
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/teachers/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ staffId: "", name: "", subject: "", room: "" });
        fetchTeachers(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to add teacher");
      }
    } catch (err) {
      alert("Server error connecting to database");
    }
  };

  // 4. Delete Teacher Logic
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;
    try {
      const response = await fetch(`http://localhost:5000/api/teachers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setTeachers((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert("Could not delete teacher.");
      }
    } catch (err) {
      alert("Delete failed due to network error.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-900 relative">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-indigo-900">
            Teachers
          </h1>
          <p className="text-gray-500 mt-1">
            Manage teacher information and active classroom locations
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchTeachers}
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition-all shadow-sm"
            title="Refresh Data"
          >
            <ArrowPathIcon
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 shadow-indigo-200"
          >
            <PlusIcon className="w-5 h-5 stroke-[2.5px]" />
            <span className="font-semibold">Add Teacher</span>
          </button>
        </div>
      </div>

      {/* Search & Statistics Row */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, subject, or ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
          <span className="text-indigo-600 font-bold text-sm">
            {teachers.length}
          </span>
          <span className="text-indigo-400 text-xs font-medium uppercase tracking-wider">
            Total Staff
          </span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest bg-gray-50/50">
                <th className="px-6 py-4 font-semibold">Staff ID</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Room</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-10 text-gray-400 animate-pulse"
                  >
                    Syncing with Neon DB...
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-10 text-gray-400 italic"
                  >
                    {searchQuery
                      ? "No results match your search."
                      : "No teachers found in database."}
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-indigo-500 font-bold">
                      {teacher.staffId}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md font-medium">
                        {teacher.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 italic">
                      {teacher.room}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD TEACHER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Add New Teacher
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleAddTeacher} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Staff ID
                  </label>
                  <input
                    required
                    placeholder="T-1000"
                    type="text"
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.staffId}
                    onChange={(e) =>
                      setFormData({ ...formData, staffId: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Room
                  </label>
                  <input
                    required
                    placeholder="A-201"
                    type="text"
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.room}
                    onChange={(e) =>
                      setFormData({ ...formData, room: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Full Name
                </label>
                <input
                  required
                  placeholder="Mr. Dara Vichea"
                  type="text"
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Subject
                </label>
                <input
                  required
                  placeholder="Mathematics"
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
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold mt-4 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Register Teacher
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersPage;
