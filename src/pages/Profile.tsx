import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

import {
  UserCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const BASE_URL = import.meta.env.VITE_API_URL || "http://192.168.11.41:5000";
const token = localStorage.getItem("admin_token");

const ProfilePage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    profile_image: null as string | null,
  });
  const [editingInfo, setEditingInfo] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", email: "" });
  const [editingPassword, setEditingPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPass: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.admin) {
          setProfile(data.admin);
          setEditForm({
            username: data.admin.username,
            email: data.admin.email,
          });
          localStorage.setItem("admin_email", data.admin.email);
        }
      } catch {
        toast.error("Failed to load profile.");
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    const tid = toast.loading("Uploading avatar...");
    const formData = new FormData();
    formData.append("profile_image", file);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        const imageUrl = data.admin.profile_image;
        setProfile((p) => ({
          ...p,
          profile_image: `${imageUrl}?t=${Date.now()}`,
        }));
        window.dispatchEvent(
          new CustomEvent("profileUpdated", {
            detail: { username: profile.username, profile_image: imageUrl },
          }),
        );
        toast.success("Avatar updated!", { id: tid });
      } else {
        toast.error(data.message || "Upload failed.", { id: tid });
      }
    } catch {
      toast.error("Connection error.", { id: tid });
    } finally {
      setAvatarLoading(false);
      e.target.value = "";
    }
  };

  const handleUpdateInfo = async () => {
    if (!editForm.username || !editForm.email) {
      toast.error("Username and email are required.");
      return;
    }
    setLoading(true);
    const tid = toast.loading("Saving...");
    const formData = new FormData();
    formData.append("username", editForm.username);
    formData.append("email", editForm.email);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((p) => ({
          ...p,
          username: data.admin.username,
          email: data.admin.email,
        }));
        localStorage.setItem("admin_email", data.admin.email);
        window.dispatchEvent(
          new CustomEvent("profileUpdated", {
            detail: {
              username: data.admin.username,
              profile_image: profile.profile_image,
            },
          }),
        );
        toast.success("Profile updated!", { id: tid });
        setEditingInfo(false);
      } else {
        toast.error(data.message || "Failed to update.", { id: tid });
      }
    } catch {
      toast.error("Connection error.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    if (passwords.newPass.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const tid = toast.loading("Updating password...");
    try {
      const res = await fetch(`${BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.newPass,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated successfully!", { id: tid });
        setEditingPassword(false);
        setPasswords({ current: "", newPass: "", confirm: "" });
        setShowPasswords({ current: false, newPass: false, confirm: false });
      } else {
        toast.error(data.message || "Failed to update password.", { id: tid });
      }
    } catch {
      toast.error("Connection error.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const passwordFields = [
    {
      key: "current",
      label: "Current Password",
      placeholder: "Enter current password",
    },
    {
      key: "newPass",
      label: "New Password",
      placeholder: "Enter new password",
    },
    {
      key: "confirm",
      label: "Confirm New Password",
      placeholder: "Confirm new password",
    },
  ] as const;

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-900">
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-600">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* ── Avatar & Name Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex items-center gap-6">
          <div className="relative flex-shrink-0 group/avatar">
            {/* The Avatar Container */}
            <div
              className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-indigo-400 transition-all"
              onClick={() => profile.profile_image && setIsViewOpen(true)} // Open viewer on click
            >
              {profile.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-3xl font-black uppercase">
                  {profile.username?.charAt(0) || "A"}
                </span>
              )}
            </div>

            {/* Buttons overlay (Camera for change, Eye for view) */}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none group-hover/avatar:pointer-events-auto">
              {profile.profile_image && (
                <button
                  onClick={() => setIsViewOpen(true)}
                  className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                  title="View Picture"
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                title="Change Picture"
              >
                <CameraIcon className="w-5 h-5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 capitalize">
              {profile.username}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              PSE Teacher Attendance System
            </p>
          </div>
        </div>

        {/* --- IMAGE VIEWER MODAL --- */}
        {isViewOpen && profile.profile_image && (
          <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setIsViewOpen(false)}
          >
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white"
              onClick={() => setIsViewOpen(false)}
            >
              <XMarkIcon className="w-10 h-10" />
            </button>

            <img
              src={profile.profile_image}
              alt="Full Profile"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
          </div>
        )}

        {/* ── Account Info Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest">
              Account Information
            </h3>
            {!editingInfo && (
              <button
                onClick={() => setEditingInfo(true)}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <PencilSquareIcon className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>
          {!editingInfo ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <UserCircleIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase">
                    Username
                  </p>
                  <p className="text-gray-800 font-semibold capitalize">
                    {profile.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <EnvelopeIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase">
                    Email
                  </p>
                  <p className="text-gray-800 font-semibold">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <ShieldCheckIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase">
                    Role
                  </p>
                  <p className="text-gray-800 font-semibold">Administrator</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateInfo}
                  disabled={loading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 active:scale-95"
                >
                  <CheckIcon className="w-4 h-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setEditingInfo(false);
                    setEditForm({
                      username: profile.username,
                      email: profile.email,
                    });
                  }}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Security Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest">
              Security
            </h3>
            {!editingPassword && (
              <button
                onClick={() => setEditingPassword(true)}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <PencilSquareIcon className="w-3.5 h-3.5" />
                Change Password
              </button>
            )}
          </div>

          {!editingPassword ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <LockClosedIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">
                  Password
                </p>
                <p className="text-gray-800 font-semibold">••••••••</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {passwordFields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    {label}
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showPasswords[key] ? "text" : "password"}
                      value={passwords[key]}
                      onChange={(e) =>
                        setPasswords({ ...passwords, [key]: e.target.value })
                      }
                      className="w-full p-3 pr-10 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      placeholder={placeholder}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((p) => ({ ...p, [key]: !p[key] }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords[key] ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 active:scale-95"
                >
                  <CheckIcon className="w-4 h-4" />
                  {loading ? "Saving..." : "Save Password"}
                </button>
                <button
                  onClick={() => {
                    setEditingPassword(false);
                    setPasswords({ current: "", newPass: "", confirm: "" });
                    setShowPasswords({
                      current: false,
                      newPass: false,
                      confirm: false,
                    });
                  }}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sign Out ── */}
        <button
          onClick={() => {
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_email");
            window.location.href = "/login";
          }}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 py-3.5 rounded-xl font-bold transition-all active:scale-95"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
