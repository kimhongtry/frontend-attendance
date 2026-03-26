import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Teachers from "./pages/Teachers";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import Layout from "./components/layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  // Real Auth Check: If token exists, user is "logged in"
  const isLoggedIn = !!localStorage.getItem("admin_token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes Wrapper */}
        <Route
          path="/"
          element={isLoggedIn ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="reports" element={<Reports />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route
          path="*"
          element={
            <h1 className="p-10 text-center text-2xl">404: Page Not Found</h1>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
