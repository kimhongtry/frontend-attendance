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
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface Teacher {
  id: number;
  name: string;
  staffId: string;
}

interface AttendanceRecord {
  teacherId: number;
  status: string;
  checkInMethod: string;
}

const BASE_URL = process.env.REACT_APP_API_URL;
const AttendancePage = () => {
  const [activeTab, setActiveTab] = useState("manual");
  const [showQRModal, setShowQRModal] = useState(false);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<number, string>>(
    {},
  );
  const [qrScannedIds, setQrScannedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const token = localStorage.getItem("admin_token");
  const today = new Date().toISOString().split("T")[0];

  // ─── 1. Fetch teachers ──────────────────────────────────────────────
  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/teachers/all`, {
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

  // ─── 2. Fetch today's attendance from DB (runs every 5s) ────────────
  const fetchTodayAttendance = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;

      const data = await response.json();
      const records: AttendanceRecord[] = Array.isArray(data)
        ? data
        : data.records || data.data || [];

      if (records.length === 0) return;

      // ✅ Merge DB records into local state
      setAttendanceData((prev) => {
        const updated = { ...prev };
        records.forEach((r) => {
          updated[r.teacherId] = r.status;
        });
        return updated;
      });

      // ✅ Track which teachers came in via QR
      setQrScannedIds((prev) => {
        const updated = new Set(prev);
        records.forEach((r) => {
          if (
            r.checkInMethod === "QR_PUBLIC" ||
            r.checkInMethod === "QR_SCAN"
          ) {
            updated.add(r.teacherId);
          }
        });
        return updated;
      });

      setLastSynced(new Date());
    } catch (err) {
      console.error("Failed to fetch today attendance:", err);
    }
  }, [token]);

  // ─── 3. Initial load ────────────────────────────────────────────────
  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    fetchTodayAttendance();
  }, [fetchTodayAttendance]);

  // ─── 4. Poll every 5 seconds ────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(fetchTodayAttendance, 5000);
    return () => clearInterval(interval);
  }, [fetchTodayAttendance]);

  // ─── 5. Manual checkbox toggle ──────────────────────────────────────
  const handleStatusChange = (teacherId: number, status: string) => {
    if (qrScannedIds.has(teacherId)) {
      toast("This teacher already checked in via QR scan.", { icon: "📱" });
      return;
    }
    setAttendanceData((prev) => {
      if (prev[teacherId] === status) {
        const newState = { ...prev };
        delete newState[teacherId];
        return newState;
      }
      return { ...prev, [teacherId]: status };
    });
  };

  // ─── 6. Save manual attendance ──────────────────────────────────────
  const handleSaveAttendance = async () => {
    if (Object.keys(attendanceData).length === 0) {
      return toast.error("Please mark at least one teacher.");
    }

    const tId = toast.loading("Saving attendance records...");

    try {
      const response = await fetch(`${BASE_URL}/api/attendance/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: today, records: attendanceData }),
      });

      if (response.ok) {
        toast.success("Attendance saved!", { id: tId });
        fetchTodayAttendance();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to save.", { id: tId });
      }
    } catch (err) {
      toast.error("Connection error. Check server.", { id: tId });
    }
  };

  // ─── 7. Mark all unmarked as present ────────────────────────────────
  const markAllAsPresent = () => {
    const newData = { ...attendanceData };
    teachers.forEach((t) => {
      if (!newData[t.id]) newData[t.id] = "present";
    });
    setAttendanceData(newData);
    toast.success("Marked remaining as Present");
  };

  // ─── Derived counts ──────────────────────────────────────────────────
  const markedCount = Object.keys(attendanceData).length;
  const unmarkedCount = teachers.length - markedCount;
  const presentCount = Object.values(attendanceData).filter(
    (v) => v === "present",
  ).length;
  const absentCount = Object.values(attendanceData).filter(
    (v) => v === "absent",
  ).length;
  const permissionCount = Object.values(attendanceData).filter(
    (v) => v === "permission",
  ).length;

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-900 relative">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-indigo-600">Attendance</h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          {/* ✅ Live sync indicator */}
          {lastSynced && (
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <ArrowPathIcon className="w-3 h-3" />
              Live sync · last updated {lastSynced.toLocaleTimeString()}
            </p>
          )}
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

      {/* Reminder bar */}
      {unmarkedCount > 0 && !loading && (
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3 mb-8 shadow-sm">
          <BellIcon className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-orange-900 font-bold">
              Pending: {unmarkedCount} Teacher{unmarkedCount !== 1 ? "s" : ""}
            </h4>
            <p className="text-orange-800 text-xs mt-1">
              Please complete the daily record to ensure accurate reports.
            </p>
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div className="bg-gray-200/50 p-1 rounded-xl inline-flex mb-8">
        <button
          onClick={() => setActiveTab("manual")}
          className={`px-8 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
            activeTab === "manual"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-gray-600 hover:text-gray-700"
          }`}
        >
          <PencilSquareIcon className="w-4 h-4" /> Manual Entry
        </button>
        <button
          onClick={() => setActiveTab("qr")}
          className={`px-8 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
            activeTab === "qr"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-gray-600 hover:text-gray-700"
          }`}
        >
          <QrCodeIcon className="w-4 h-4" /> QR Scan
        </button>
      </div>

      {/* ── Manual Tab ── */}
      {activeTab === "manual" ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 text-[10px] uppercase tracking-widest bg-gray-50/50">
                  <th className="px-8 py-5 font-bold">Teacher Name</th>
                  <th className="px-4 py-5 font-bold text-center">Present</th>
                  <th className="px-4 py-5 font-bold text-center">Absent</th>
                  <th className="px-4 py-5 font-bold text-center">
                    Permission
                  </th>
                  <th className="px-4 py-5 font-bold text-center">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-10 text-center text-gray-600 animate-pulse"
                    >
                      Loading teachers...
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-400">
                      No teachers found.
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => {
                    const isQrScanned = qrScannedIds.has(t.id);
                    return (
                      <tr
                        key={t.id}
                        className={`transition-colors ${
                          isQrScanned
                            ? "bg-green-50/40 hover:bg-green-50/60"
                            : "hover:bg-gray-50/50"
                        }`}
                      >
                        <td className="px-8 py-5">
                          <div className="font-semibold text-gray-800">
                            {t.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {t.staffId}
                          </div>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <input
                            type="checkbox"
                            className="w-6 h-6 rounded-md border-gray-300 accent-green-600 cursor-pointer hover:scale-110 transition-transform disabled:cursor-not-allowed disabled:opacity-60"
                            onChange={() => handleStatusChange(t.id, "present")}
                            checked={attendanceData[t.id] === "present"}
                            disabled={isQrScanned}
                          />
                        </td>
                        <td className="px-4 py-5 text-center">
                          <input
                            type="checkbox"
                            className="w-6 h-6 rounded-md border-gray-300 accent-red-600 cursor-pointer hover:scale-110 transition-transform disabled:cursor-not-allowed disabled:opacity-60"
                            onChange={() => handleStatusChange(t.id, "absent")}
                            checked={attendanceData[t.id] === "absent"}
                            disabled={isQrScanned}
                          />
                        </td>
                        <td className="px-4 py-5 text-center">
                          <input
                            type="checkbox"
                            className="w-6 h-6 rounded-md border-gray-300 accent-orange-500 cursor-pointer hover:scale-110 transition-transform disabled:cursor-not-allowed disabled:opacity-60"
                            onChange={() =>
                              handleStatusChange(t.id, "permission")
                            }
                            checked={attendanceData[t.id] === "permission"}
                            disabled={isQrScanned}
                          />
                        </td>
                        <td className="px-4 py-5 text-center">
                          {isQrScanned ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                              📱 QR
                            </span>
                          ) : attendanceData[t.id] ? (
                            <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                              ✏️ Manual
                            </span>
                          ) : (
                            <span className="text-gray-100 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with live counts + save button */}
          <div className="p-6 bg-gray-50/50 flex items-center justify-between border-t border-gray-100 flex-wrap gap-4">
            <div className="flex gap-4 text-sm flex-wrap">
              <span className="text-green-600 font-bold">
                {presentCount} Present
              </span>
              <span className="text-red-500 font-bold">
                {absentCount} Absent
              </span>
              <span className="text-orange-500 font-bold">
                {permissionCount} Permission
              </span>
              <span className="text-gray-400">{unmarkedCount} Unmarked</span>
            </div>
            <button
              onClick={handleSaveAttendance}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all"
            >
              Save Attendance
            </button>
          </div>
        </div>
      ) : (
        /* ── QR Tab ── */
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

          {/* ✅ QR scanned teachers list */}
          {qrScannedIds.size > 0 && (
            <div className="mb-6 bg-green-50 rounded-2xl p-4 border border-green-100">
              <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-3">
                📱 Checked in via QR ({qrScannedIds.size})
              </p>
              <div className="flex flex-wrap gap-2">
                {teachers
                  .filter((t) => qrScannedIds.has(t.id))
                  .map((t) => (
                    <span
                      key={t.id}
                      className="bg-white border border-green-200 text-green-700 text-xs font-semibold px-3 py-1 rounded-full"
                    >
                      {t.name}
                    </span>
                  ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setShowQRModal(true);
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            <QrCodeIcon className="w-7 h-7" />
            Launch QR Check-In Terminal
          </button>
        </div>
      )}

      {/* ── QR Modal ── */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Scan QR Code
                </h2>
                <p className="text-xs text-green-500 mt-0.5">
                  {presentCount} checked in · {unmarkedCount} remaining
                </p>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="p-10 flex flex-col items-center bg-gray-50/50">
              <div className="bg-white p-6 rounded-3xl shadow-inner border border-gray-100 mb-6">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http://192.168.11.36:3000/checkin`}
                  alt="Attendance QR Code"
                  className="w-56 h-56"
                />
              </div>
            </div>
            <div className="p-6">
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=http://192.168.11.41:3000/checkin&download=1`}
                download="attendance-qr.png"
                className="w-full border-2 border-gray-100 text-gray-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
              >
                <ArrowDownTrayIcon className="w-5 h-5" /> Download QR Image
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
