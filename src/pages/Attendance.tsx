import React, { useState, useEffect, useCallback } from "react";
import {
  BellIcon,
  QrCodeIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

interface Teacher {
  id: number;
  name: string;
}

const AttendancePage = () => {
  const [activeTab, setActiveTab] = useState("manual");
  const [showQRModal, setShowQRModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40);

  // State for Database Integration
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<number, string>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("admin_token");

  // 1. Fetch live teachers from your DB
  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/teachers/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      // Handle array or nested object
      const list = Array.isArray(data)
        ? data
        : data.teachers || data.data || [];
      setTeachers(list);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // 2. Attendance Logic
  const handleStatusChange = (teacherId: number, status: string) => {
    setAttendanceData((prev) => ({ ...prev, [teacherId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (Object.keys(attendanceData).length === 0)
      return alert("Please mark at least one teacher.");

    try {
      const response = await fetch(
        "http://localhost:5000/api/attendance/mark",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: new Date().toISOString().split("T")[0],
            records: attendanceData,
          }),
        },
      );

      if (response.ok) {
        alert("Attendance saved to Neon DB!");
      }
    } catch (err) {
      alert("Failed to save attendance.");
    }
  };

  // 3. Dynamic Derived State
  const unmarkedTeachers = teachers.filter((t) => !attendanceData[t.id]);
  const presentCount = Object.values(attendanceData).filter(
    (v) => v === "present",
  ).length;

  // Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showQRModal && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showQRModal, timeLeft]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-900 relative">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Dynamic Reminder Bar */}
      {unmarkedTeachers.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3 mb-8 shadow-sm animate-in slide-in-from-top duration-300">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <BellIcon className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h4 className="text-orange-900 font-bold">
              ⚠️ Reminder: {unmarkedTeachers.length} Teacher(s) Not Marked
            </h4>
            <p className="text-orange-800 text-xs mt-1">
              {unmarkedTeachers.map((t) => t.name).join(", ")} have not been
              recorded yet.
            </p>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="bg-gray-200/50 p-1 rounded-xl inline-flex mb-8">
        <button
          onClick={() => setActiveTab("manual")}
          className={`px-10 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${activeTab === "manual" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`}
        >
          <PencilSquareIcon className="w-4 h-4" /> Manual Entry
        </button>
        <button
          onClick={() => setActiveTab("qr")}
          className={`px-10 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${activeTab === "qr" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`}
        >
          <QrCodeIcon className="w-4 h-4" /> QR Scan
        </button>
      </div>

      {/* Main Content */}
      {activeTab === "manual" ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Mark Attendance</h2>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {Object.keys(attendanceData).length} / {teachers.length} Marked
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-widest bg-gray-50/30">
                  <th className="px-8 py-5 font-semibold">Teacher</th>
                  <th className="px-8 py-5 font-semibold text-center">
                    Present
                  </th>
                  <th className="px-8 py-5 font-semibold text-center">
                    Absent
                  </th>
                  <th className="px-8 py-5 font-semibold text-center">
                    Permission
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-10 text-center text-gray-400 animate-pulse"
                    >
                      Loading teachers...
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-8 py-4 font-medium text-gray-700">
                        {t.name}
                      </td>
                      {["present", "absent", "permission"].map((status) => (
                        <td key={status} className="px-8 py-4 text-center">
                          <input
                            type="radio"
                            name={`status-${t.id}`}
                            className="w-5 h-5 accent-indigo-600 cursor-pointer"
                            onChange={() => handleStatusChange(t.id, status)}
                            checked={attendanceData[t.id] === status}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-gray-50/30 flex justify-end border-t border-gray-50">
            <button
              onClick={handleSaveAttendance}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-xl font-bold shadow-md active:scale-95 transition-all"
            >
              Save Attendance
            </button>
          </div>
        </div>
      ) : (
        /* QR Content Section */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 text-center">
            Check-In Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 border border-green-100 p-6 rounded-2xl text-center">
              <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-black text-green-700">
                {presentCount}
              </div>
              <div className="text-sm text-green-600 font-medium">
                Present via QR
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl text-center">
              <ClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-2xl font-black text-gray-600">
                {unmarkedTeachers.length}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Pending Scan
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setTimeLeft(40);
              setShowQRModal(true);
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg"
          >
            <QrCodeIcon className="w-6 h-6" />
            Open QR Check-In Terminal
          </button>
        </div>
      )}

      {/* QR Modal (Unchanged from your design, just added countdown text) */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Secure Attendance QR</h2>
              <button onClick={() => setShowQRModal(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="bg-gray-50 p-8 rounded-3xl flex flex-col items-center mb-6">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=attendance-${new Date().toISOString()}`}
                alt="QR"
                className="w-48 h-48 mb-4"
              />
              <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-1 rounded-full animate-pulse">
                Refreshing in {timeLeft}s
              </div>
            </div>
            <button className="w-full border py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
              <ArrowDownTrayIcon className="w-5 h-5" /> Download for Display
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
