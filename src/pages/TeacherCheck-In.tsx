import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

const BASE_URL = process.env.REACT_APP_API_URL;

const TeacherCheckIn = () => {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const token = localStorage.getItem("teacher_token"); // Teachers must login once on their phone

  const handleConfirm = async () => {
    // Check if token exists before trying to fetch
    if (!token) {
      toast.error("Please login first!");
      return;
    }

    setStatus("loading");
    const tid = toast.loading("Verifying identity...");

    try {
      const response = await fetch(
        `${BASE_URL}/api/attendance/qr-checkin`, // ✅ Updated to your real IP
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Ensure your backend expects 'Bearer'
          },
        },
      );

      if (response.ok) {
        setStatus("success");
        toast.success("Attendance Marked!", { id: tid });
      } else {
        const data = await response.json();
        // If the backend returns an error (like "Invalid Token"), show it
        toast.error(data.message || "Check-in failed", { id: tid });
        setStatus("idle");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Network error: Cannot reach server", { id: tid });
      setStatus("idle");
    }
  };
  return (
    <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center p-6 text-white">
      <Toaster />
      <div className="bg-white text-gray-900 w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl">
        {status === "success" ? (
          <div className="animate-bounce">
            <CheckBadgeIcon className="w-20 h-20 text-green-500 mx-auto" />
            <h1 className="text-2xl font-black mt-4">Done!</h1>
            <p className="text-gray-600">You are marked present for today.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black mb-2">Teacher Check-In</h1>
            <p className="text-gray-600 mb-8 text-sm">
              Please confirm your presence at PSE Campus.
            </p>
            <button
              disabled={status === "loading"}
              onClick={handleConfirm}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {status === "loading" ? "Processing..." : "Confirm Presence"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherCheckIn;
