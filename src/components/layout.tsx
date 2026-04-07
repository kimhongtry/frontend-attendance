import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://192.168.11.36:5000";
const token = localStorage.getItem("admin_token");

const Layout = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeClass =
    "flex items-center gap-2 p-2 rounded-lg bg-purple-500 text-white font-semibold";
  const normalClass =
    "flex items-center gap-2 p-2 rounded-lg hover:bg-purple-200";

  const [adminName, setAdminName] = useState("Admin");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch profile on mount
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.admin) {
          setAdminName(data.admin.username);
          setAvatarUrl(data.admin.profile_image || null);
        }
      } catch {
        console.error("Failed to load profile in layout.");
      }
    };
    fetchProfile();

    // Listen for profile updates from ProfilePage
    const handleProfileUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.username) setAdminName(detail.username);
      if (detail.profile_image) {
        setAvatarUrl(`${detail.profile_image}?t=${Date.now()}`);
      }
    };
    window.addEventListener("profileUpdated", handleProfileUpdated);

    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdated);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_email");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4">
          <h1 className="text-xl font-bold text-purple-600 mb-6">
            Teacher Attendance
          </h1>
          <nav className="flex flex-col gap-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? activeClass : normalClass
              }
            >
              <span>🏠</span> Dashboard
            </NavLink>
            <NavLink
              to="/teachers"
              className={({ isActive }) =>
                isActive ? activeClass : normalClass
              }
            >
              <span>👩‍🏫</span> Teachers
            </NavLink>
            <NavLink
              to="/attendance"
              className={({ isActive }) =>
                isActive ? activeClass : normalClass
              }
            >
              <span>📝</span> Attendance
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                isActive ? activeClass : normalClass
              }
            >
              <span>📊</span> Reports
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <div className="flex items-center justify-end bg-white p-4 shadow-md">
          {/* Dropdown wrapper — ref for outside click detection */}
          <div ref={dropdownRef} className="relative">
            {/* Avatar + Name — click to toggle */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <div className="w-10 h-10 rounded-full bg-purple-500 overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold uppercase">
                    {adminName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold capitalize">{adminName}</p>
              </div>
            </div>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg z-10">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto bg-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
