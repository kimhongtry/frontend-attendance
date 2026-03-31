import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

const TeacherCheckIn = () => {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const token = localStorage.getItem("teacher_token"); // Teachers must login once on their phone

  const handleConfirm = async () => {
    setStatus("loading");
    const tid = toast.loading("Verifying location and identity...");

    try {
      const response = await fetch(
        "http://your-ip-address:5000/api/attendance/qr-checkin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setStatus("success");
        toast.success("Attendance Marked!", { id: tid });
      } else {
        const data = await response.json();
        toast.error(data.message || "Check-in failed", { id: tid });
        setStatus("idle");
      }
    } catch (err) {
      toast.error("Network error", { id: tid });
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
            <p className="text-gray-500">You are marked present for today.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black mb-2">Teacher Check-In</h1>
            <p className="text-gray-500 mb-8 text-sm">
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
