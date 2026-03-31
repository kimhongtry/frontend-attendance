import React, { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
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
  staffId: string;
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

      const list = Array.isArray(data)
        ? data
        : data.teachers || data.data || [];

      setTeachers(list);
    } catch (err) {
      toast.error("Failed to sync teacher list");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // 2. Attendance Logic (Checkbox Toggle)
  const handleStatusChange = (teacherId: number, status: string) => {
    setAttendanceData((prev) => {
      // Logic: If user clicks the SAME checkbox, uncheck it.
      // If they click a DIFFERENT checkbox, switch to that one.
      if (prev[teacherId] === status) {
        const newState = { ...prev };
        delete newState[teacherId];
        return newState;
      }
      return { ...prev, [teacherId]: status };
    });
  };

  const handleSaveAttendance = async () => {
    if (Object.keys(attendanceData).length === 0) {
      return toast.error("Please mark at least one teacher.");
    }

    const tId = toast.loading("Saving attendance records...");

    try {
      const response = await fetch("http://localhost:5000/api/teachers/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          records: attendanceData,
        }),
      });

      if (response.ok) {
        toast.success("Attendance saved to Neon DB!", { id: tId });
      } else {
        toast.error("Failed to save. Check server connection.", { id: tId });
      }
    } catch (err) {
      toast.error("Connection error.", { id: tId });
    }
  };

  // Bulk Action: Mark all remaining as Present
  const markAllAsPresent = () => {
    const newData = { ...attendanceData };
    teachers.forEach((t) => {
      if (!newData[t.id]) newData[t.id] = "present";
    });
    setAttendanceData(newData);
    toast.success("Marked remaining as Present");
  };

  // Derived State
  const unmarkedCount = teachers.length - Object.keys(attendanceData).length;
  const presentCount = Object.values(attendanceData).filter(
    (v) => v === "present",
  ).length;

  // Timer Logic for QR
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showQRModal && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showQRModal, timeLeft]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-900 relative">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        {activeTab === "manual" && (
          <button
            onClick={markAllAsPresent}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
          >
            Mark All Present
          </button>
        )}
      </div>

      {/* Reminder Bar */}
      {unmarkedCount > 0 && !loading && (
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3 mb-8 shadow-sm">
          <BellIcon className="w-5 h-5 text-orange-500 mt-0.5" />
          <div>
            <h4 className="text-orange-900 font-bold">
              Pending: {unmarkedCount} Teachers
            </h4>
            <p className="text-orange-800 text-xs mt-1">
              Please complete the daily record to ensure accurate reports.
            </p>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="bg-gray-200/50 p-1 rounded-xl inline-flex mb-8">
        <button
          onClick={() => setActiveTab("manual")}
          className={`px-8 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${activeTab === "manual" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <PencilSquareIcon className="w-4 h-4" /> Manual Entry
        </button>
        <button
          onClick={() => setActiveTab("qr")}
          className={`px-8 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${activeTab === "qr" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <QrCodeIcon className="w-4 h-4" /> QR Scan
        </button>
      </div>

      {activeTab === "manual" ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-widest bg-gray-50/50">
                  <th className="px-8 py-5 font-bold">Teacher Name</th>
                  <th className="px-4 py-5 font-bold text-center">Present</th>
                  <th className="px-4 py-5 font-bold text-center">Absent</th>
                  <th className="px-4 py-5 font-bold text-center">
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
                      Loading teachers from Neon...
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-8 py-5 font-semibold text-gray-800">
                        {t.name}
                      </td>

                      {/* Checkbox Inputs */}
                      <td className="px-4 py-5 text-center">
                        <input
                          type="checkbox"
                          className="w-6 h-6 rounded-md border-gray-300 accent-green-600 cursor-pointer hover:scale-110 transition-transform"
                          onChange={() => handleStatusChange(t.id, "present")}
                          checked={attendanceData[t.id] === "present"}
                        />
                      </td>
                      <td className="px-4 py-5 text-center">
                        <input
                          type="checkbox"
                          className="w-6 h-6 rounded-md border-gray-300 accent-red-600 cursor-pointer hover:scale-110 transition-transform"
                          onChange={() => handleStatusChange(t.id, "absent")}
                          checked={attendanceData[t.id] === "absent"}
                        />
                      </td>
                      <td className="px-4 py-5 text-center">
                        <input
                          type="checkbox"
                          className="w-6 h-6 rounded-md border-gray-300 accent-orange-500 cursor-pointer hover:scale-110 transition-transform"
                          onChange={() =>
                            handleStatusChange(t.id, "permission")
                          }
                          checked={attendanceData[t.id] === "permission"}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-gray-50/50 flex justify-end border-t border-gray-100">
            <button
              onClick={handleSaveAttendance}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all"
            >
              Save Attendance
            </button>
          </div>
        </div>
      ) : (
        /* QR Content Section */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 p-6 rounded-2xl text-center border border-green-100">
              <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-3xl font-black text-green-700">
                {presentCount}
              </div>
              <div className="text-xs text-green-600 font-bold uppercase tracking-wide">
                Present Today
              </div>
            </div>
            <div className="bg-indigo-50 p-6 rounded-2xl text-center border border-indigo-100">
              <ClockIcon className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <div className="text-3xl font-black text-indigo-700">
                {unmarkedCount}
              </div>
              <div className="text-xs text-indigo-600 font-bold uppercase tracking-wide">
                Waiting for Scan
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setTimeLeft(40);
              setShowQRModal(true);
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            <QrCodeIcon className="w-7 h-7" />
            Launch QR Check-In Terminal
          </button>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Scan QR Code</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="p-10 flex flex-col items-center bg-gray-50/50">
              <div className="bg-white p-6 rounded-3xl shadow-inner border border-gray-100 mb-6">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http://192.168.11.31:3000/teacher/checkin?session=${new Date().getTime()}`}
                  alt="Attendance QR"
                  className="w-56 h-56"
                />
              </div>
              <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-6 py-2 rounded-full font-bold text-sm animate-pulse">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                Refreshing in {timeLeft}s
              </div>
            </div>
            <div className="p-6">
              <button className="w-full border-2 border-gray-100 text-gray-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                <ArrowDownTrayIcon className="w-5 h-5" /> Download QR Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
