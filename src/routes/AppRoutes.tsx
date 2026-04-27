import { Routes, Route, Navigate } from "react-router-dom"; // REMOVED BrowserRouter from here
import Layout from "../components/layout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import { JSX } from "react";

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("admin_token");
  return token ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTES */}
      <Route path="/login" element={<Login />} />

      {/* 2. PROTECTED ROUTES (NESTED) */}
      <Route
        element={
          <AdminRoute>
            <Layout />
          </AdminRoute>
        }
      >
        {/* These show up inside the Sidebar's <Outlet /> */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* 3. REDIRECTS */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
