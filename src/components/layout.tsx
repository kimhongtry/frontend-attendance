import { NavLink, Outlet, Link, useNavigate } from "react-router-dom"; // 1. Added Link and useNavigate
import { useEffect, useRef, useState } from "react";

const Layout = () => {
  const navigate = useNavigate(); // 2. Hook for logout redirection
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeClass =
    "flex items-center gap-2 p-2 rounded-lg bg-purple-500 text-white font-semibold";
  const normalClass =
    "flex items-center gap-2 p-2 rounded-lg hover:bg-purple-200 text-gray-700";

  const [adminName, setAdminName] = useState("Admin");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const toggleDropdown = () => setDropdownOpen((open) => !open);

  useEffect(() => {
    // Fetch profile on mount
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) return;

        const res = await fetch("/api/auth/profile", {
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
          <h1 className="text-xl font-bold text-purple-600 mb-6 text-center">
            Teacher Attendance
          </h1>
          <nav className="flex flex-col gap-2">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? activeClass : normalClass}>
              <span>🏠</span> Dashboard
            </NavLink>
            <NavLink to="/teachers" className={({ isActive }) => isActive ? activeClass : normalClass}>
              <span>👩‍🏫</span> Teachers
            </NavLink>
            <NavLink to="/attendance" className={({ isActive }) => isActive ? activeClass : normalClass}>
              <span>📝</span> Attendance
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => isActive ? activeClass : normalClass}>
              <span>📊</span> Reports
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <div className="flex items-center justify-end bg-white p-4 shadow-sm border-b">
          
          {/* Admin Profile Dropdown Container */}
          <div ref={dropdownRef} className="relative">
            <div
              onClick={toggleDropdown}
              className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition"
            >
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{adminName}</p>
                <p className="text-[10px] text-green-500 font-bold uppercase">Online</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold shadow-md">
                A
              </div>
            </div>

            {/* Dropdown Menu - THIS IS WHERE YOU PUT THE LINK */}
            <div
              className={`absolute right-0 mt-1 w-44 bg-white shadow-xl rounded-xl border border-gray-100 transition-all z-50 p-1 ${
                dropdownOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
              }`}
            >
              
              {/* REPLACED BUTTON WITH LINK */}
              <Link 
                to="/profile" 
                className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition"
              >
                👤 View Profile
              </Link>

              <Link 
                to="/settings" 
                className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition"
              >
                ⚙️ Settings
              </Link>

              <hr className="my-1 border-gray-50" />

              <button 
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Outlet for pages */}
        <div className="flex-1 p-8 overflow-auto bg-gray-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
