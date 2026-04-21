import React, { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  BellIcon,
  PaperAirplaneIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ── Types ──────────────────────────────────────────────────────────────
interface DailyRecord {
  teacherId: number;
  teacherName: string;
  status: "present" | "absent" | "permission";
}

interface WeeklyRecord {
  teacherId: number;
  teacherName: string;
  present: number;
  absent: number;
  permission: number;
}

interface DailyReport {
  date: string;
  total: number;
  records: DailyRecord[];
}

interface WeeklyReport {
  startDate: string;
  endDate: string;
  records: WeeklyRecord[];
}

const BASE_URL = "http://192.168.11.41:5000";

// ── Helpers ────────────────────────────────────────────────────────────
const getWeekRange = () => {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
  };
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatWeekRange = (start: string, end: string) => {
  const s = new Date(start).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const e = new Date(end).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `${s} - ${e}`;
};

// ── Component ──────────────────────────────────────────────────────────
const ReportsPage = () => {
  const token = localStorage.getItem("admin_token");
  const today = new Date().toISOString().split("T")[0];
  const week = getWeekRange();

  const [selectedDate, setSelectedDate] = useState(today);
  const [weekStart, setWeekStart] = useState(week.start);
  const [weekEnd, setWeekEnd] = useState(week.end);

  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [weeklyLoading, setWeeklyLoading] = useState(true);
  const [sendingTelegram, setSendingTelegram] = useState(false);

  // --- EXCEL EXPORT LOGIC ---
  const handleExportExcel = () => {
    if (!sortedWeekly || sortedWeekly.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    // Map the data to clean headers for Excel
    const dataToExport = sortedWeekly.map((row) => {
      const total = row.present + row.absent + row.permission;
      const rate = total > 0 ? Math.round((row.present / total) * 100) : 0;
      return {
        "Teacher Name": row.teacherName,
        "Present Days": row.present,
        "Absent Days": row.absent,
        Permission: row.permission,
        "Attendance Rate": `${rate}%`,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Weekly Report");
    XLSX.writeFile(workbook, `Weekly_Attendance_${weekStart}.xlsx`);
  };

  // --- PDF EXPORT LOGIC ---
  const handleExportPDF = () => {
    if (!sortedWeekly || sortedWeekly.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    const doc = new jsPDF();
    doc.text("Weekly Teacher Attendance Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${weekStart} to ${weekEnd}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [["Teacher Name", "Present", "Absent", "Permission", "Rate"]],
      body: sortedWeekly.map((row) => {
        const total = row.present + row.absent + row.permission;
        const rate = total > 0 ? Math.round((row.present / total) * 100) : 0;
        return [
          row.teacherName,
          row.present,
          row.absent,
          row.permission,
          `${rate}%`,
        ];
      }),
      headStyles: { fillColor: [99, 102, 241] }, // Indigo/Purple theme
    });

    doc.save(`Weekly_Attendance_${weekStart}.pdf`);
  };

  // ── Fetch daily ──────────────────────────────────────────────────────
  const fetchDaily = useCallback(async () => {
    setDailyLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/attendance/report/daily?date=${selectedDate}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      setDailyReport({
        ...data,
        records: Array.isArray(data.records) ? data.records : [],
      });
    } catch (err) {
      console.error("Failed to fetch daily report:", err);
      setDailyReport({ date: selectedDate, total: 0, records: [] });
    } finally {
      setDailyLoading(false);
    }
  }, [selectedDate, token]);

  // ── Fetch weekly ─────────────────────────────────────────────────────
  const fetchWeekly = useCallback(async () => {
    setWeeklyLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/attendance/report/weekly?start=${weekStart}&end=${weekEnd}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      setWeeklyReport({
        ...data,
        records: Array.isArray(data.records) ? data.records : [],
      });
    } catch (err) {
      console.error("Failed to fetch weekly report:", err);
      setWeeklyReport({ startDate: weekStart, endDate: weekEnd, records: [] });
    } finally {
      setWeeklyLoading(false);
    }
  }, [weekStart, weekEnd, token]);

  useEffect(() => {
    fetchDaily();
  }, [fetchDaily]);
  useEffect(() => {
    fetchWeekly();
  }, [fetchWeekly]);

  // ── Derived data ─────────────────────────────────────────────────────
  const present = (dailyReport?.records ?? []).filter(
    (r) => r.status === "present",
  );
  const absent = (dailyReport?.records ?? []).filter(
    (r) => r.status === "absent",
  );
  const permission = (dailyReport?.records ?? []).filter(
    (r) => r.status === "permission",
  );
  const absentAlert = (weeklyReport?.records ?? []).filter(
    (r) => r.absent >= 2,
  );
  const sortedWeekly = [...(weeklyReport?.records ?? [])].sort(
    (a, b) => b.present - a.present,
  );

  // ── Send to Telegram ─────────────────────────────────────────────────
  const handleSendTelegram = async () => {
    if (!dailyReport || dailyReport.records.length === 0) {
      toast.error("No attendance data to send.");
      return;
    }

    setSendingTelegram(true);
    const tid = toast.loading("Sending to Telegram...");

    try {
      const res = await fetch(
        `${BASE_URL}/api/attendance/report/send-telegram?date=${selectedDate}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Report sent to Telegram! 🚀", { id: tid });
      } else {
        toast.error(data.message || "Failed to send.", { id: tid });
      }
    } catch (err) {
      toast.error("Connection error.", { id: tid });
    } finally {
      setSendingTelegram(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-900">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-indigo-600">Reports</h1>
          <p className="text-gray-600 mt-1">
            View attendance reports and analytics
          </p>
        </div>
        <div className="flex gap-3">
          {/* Excel Button */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export Excel
          </button>

          {/* PDF Button */}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>
      {/* Alerts */}
      {absentAlert.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-8 flex items-start gap-3 shadow-sm">
          <BellIcon className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-orange-900 font-bold text-sm">
              Attendance Alerts
            </h4>
            <p className="text-orange-800 text-sm">
              {absentAlert.length} teacher(s) absent 2+ days this week:{" "}
              {absentAlert.map((r) => r.teacherName).join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Daily Report ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Daily Report</h3>
              <p className="text-sm text-gray-600">
                {formatDate(selectedDate)}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
              <CalendarDaysIcon className="w-4 h-4 text-gray-600" />
              <input
                type="date"
                value={selectedDate}
                max={today}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm text-gray-600 bg-transparent outline-none"
              />
            </div>
          </div>

          {dailyLoading ? (
            <div className="py-16 text-center text-gray-600 animate-pulse">
              Loading...
            </div>
          ) : !dailyReport || dailyReport.records.length === 0 ? (
            <div className="py-16 text-center text-gray-600">
              No attendance recorded for this date.
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
                <span className="text-gray-600 font-medium">
                  Total Teachers
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {dailyReport.total}
                </span>
              </div>

              <div className="space-y-4">
                {/* Present */}
                <div className="bg-green-50/50 border border-green-100 p-5 rounded-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-green-800 font-bold">Present</span>
                    <span className="text-xl font-bold text-green-700">
                      {present.length}
                    </span>
                  </div>
                  {present.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {present.map((r) => (
                        <span
                          key={r.teacherId}
                          className="text-green-600 text-sm flex items-center gap-1.5"
                        >
                          <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                          {r.teacherName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-green-600 text-sm">None</p>
                  )}
                </div>

                {/* Absent */}
                <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-red-800 font-bold">Absent</span>
                    <span className="text-xl font-bold text-red-700">
                      {absent.length}
                    </span>
                  </div>
                  {absent.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {absent.map((r) => (
                        <span
                          key={r.teacherId}
                          className="text-red-600 text-sm"
                        >
                          • {r.teacherName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-red-600 text-sm">None</p>
                  )}
                </div>

                {/* Permission */}
                <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-orange-800 font-bold">
                      Permission
                    </span>
                    <span className="text-xl font-bold text-orange-700">
                      {permission.length}
                    </span>
                  </div>
                  {permission.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {permission.map((r) => (
                        <span
                          key={r.teacherId}
                          className="text-orange-600 text-sm"
                        >
                          • {r.teacherName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-orange-600 text-sm">None</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ✅ Telegram button */}
          <button
            onClick={handleSendTelegram}
            disabled={sendingTelegram}
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
          >
            <PaperAirplaneIcon className="w-5 h-5 -rotate-12" />
            {sendingTelegram ? "Sending..." : "Send to Telegram"}
          </button>
        </div>

        {/* ── Weekly Report ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Weekly Report</h3>
              <p className="text-sm text-gray-600">
                {formatWeekRange(weekStart, weekEnd)} · Sorted by Present Days
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
                <span className="text-xs text-gray-600">From</span>
                <input
                  type="date"
                  value={weekStart}
                  max={weekEnd}
                  onChange={(e) => setWeekStart(e.target.value)}
                  className="text-xs text-gray-600 bg-transparent outline-none"
                />
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
                <span className="text-xs text-gray-600">To</span>
                <input
                  type="date"
                  value={weekEnd}
                  min={weekStart}
                  max={today}
                  onChange={(e) => setWeekEnd(e.target.value)}
                  className="text-xs text-gray-600 bg-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {weeklyLoading ? (
            <div className="py-16 text-center text-gray-600 animate-pulse">
              Loading...
            </div>
          ) : sortedWeekly.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              No attendance recorded for this period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-600 text-[10px] uppercase tracking-wider border-b border-gray-50">
                    <th className="pb-4 font-bold">Teacher</th>
                    <th className="pb-4 font-bold text-center">Present</th>
                    <th className="pb-4 font-bold text-center">Absent</th>
                    <th className="pb-4 font-bold text-center">Perm.</th>
                    <th className="pb-4 font-bold text-center">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sortedWeekly.map((row) => {
                    const total = row.present + row.absent + row.permission;
                    const rate =
                      total > 0 ? Math.round((row.present / total) * 100) : 0;
                    return (
                      <tr
                        key={row.teacherId}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-4 text-sm font-medium text-gray-700">
                          {row.teacherName}
                        </td>
                        <td className="py-4 text-center">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                            {row.present}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                            {row.absent}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                            {row.permission}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              rate >= 80
                                ? "bg-green-100 text-green-700"
                                : rate >= 60
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
