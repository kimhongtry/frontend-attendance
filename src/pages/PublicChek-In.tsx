import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

const PublicCheckIn = () => {
  const [formData, setFormData] = useState({ staffId: "", name: "" });
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if they already scanned today
  useEffect(() => {
    const lastDate = localStorage.getItem("last_checkin_date");
    const today = new Date().toISOString().split("T")[0];
    if (lastDate === today) {
      setHasCheckedIn(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasCheckedIn) return;

    setLoading(true);
    const tid = toast.loading("Recording attendance...");

    try {
      const response = await fetch(
        "http://192.168.11.31:5000/api/attendance/public-checkin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        // Save today's date to their phone to block a second scan
        const today = new Date().toISOString().split("T")[0];
        localStorage.setItem("last_checkin_date", today);

        setHasCheckedIn(true);
        toast.success("Attendance Recorded!", { id: tid });
      } else {
        const data = await response.json();
        toast.error(data.message || "Submission failed", { id: tid });
      }
    } catch (err) {
      toast.error("Network error", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  if (hasCheckedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border border-green-100">
          <CheckBadgeIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">
            Already Checked In
          </h1>
          <p className="text-gray-500 mt-2">
            You have already recorded your attendance for today. See you
            tomorrow!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center p-6">
      <Toaster position="top-center" />
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl">
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Teacher Check-In
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Please enter your details to mark attendance.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">
              Staff ID
            </label>
            <input
              required
              className="w-full mt-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. T-1005"
              value={formData.staffId}
              onChange={(e) =>
                setFormData({ ...formData, staffId: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">
              Full Name
            </label>
            <input
              required
              className="w-full mt-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? "Submiting..." : "Confirm Attendance"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicCheckIn;
