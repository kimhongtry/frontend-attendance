import { NavLink, Outlet } from "react-router-dom";

const Layout = () => {
  const activeClass =
    "flex items-center gap-2 p-2 rounded-lg bg-purple-500 text-white font-semibold";
  const normalClass =
    "flex items-center gap-2 p-2 rounded-lg hover:bg-purple-200";

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
        <div className="flex items-center justify-between bg-white p-4 shadow-md">
          {/* Admin Profile */}
          <div className="relative group">
            <div className="flex items-center gap-3 cursor-pointer">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                A
              </div>

              {/* Info */}
              <div className="text-right">
                <p className="text-sm font-semibold">Admin</p>
              </div>
            </div>

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg opacity-0 group-hover:opacity-100 transition z-10">
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Profile
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Settings
              </button>
              <button className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Outlet for pages */}
        <div className="flex-1 p-6 overflow-auto bg-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
