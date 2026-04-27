import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

const BASE_URL = process.env.REACT_APP_API_URL;

const PublicCheckIn = () => {
  const [formData, setFormData] = useState({ staffId: "", name: "" });
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lastDate = localStorage.getItem("last_checkin_date");
    const today = new Date().toISOString().split("T")[0];
    if (lastDate === today) setHasCheckedIn(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.staffId.trim() || !formData.name.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    // 1. CHECK FOR BROWSER GEOLOCATION SUPPORT
    if (!navigator.geolocation) {
      toast.error("GPS is not supported by your browser.");
      return;
    }

    setLoading(true);
    const tid = toast.loading("Verifying your location...");

    // 2. GET CURRENT POSITION
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `${BASE_URL}/api/attendance/public-checkin`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...formData,
                lat: latitude,
                lon: longitude,
              }),
            },
          );

          const data = await response.json();

          if (response.ok) {
            localStorage.setItem(
              "last_checkin_date",
              new Date().toISOString().split("T")[0],
            );
            setHasCheckedIn(true);
            toast.success(data.message || "Attendance Recorded!", { id: tid });
          } else {
            toast.error(data.message || "Submission failed.", { id: tid });
          }
        } catch (err) {
          toast.error("Network error: Check your internet connection.", {
            id: tid,
          });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        toast.error("Please enable Location/GPS to mark attendance.", {
          id: tid,
        });
      },
    );
  };

  if (hasCheckedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border border-green-100">
          <CheckBadgeIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">
            Already Checked In
          </h1>
          <p className="text-gray-500 mt-2">See you tomorrow!</p>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Staff ID (e.g. T-1005)"
            value={formData.staffId}
            onChange={(e) =>
              setFormData({ ...formData, staffId: e.target.value })
            }
          />
          <input
            required
            className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Confirm Attendance"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicCheckIn;
