import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import { JSX } from "react";

// Helper to check authentication
const isAuthenticated = () => !!localStorage.getItem("admin_token");

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const loggedIn = isAuthenticated();

  return (
    <Routes>
      {/* 1. ROOT LOGIC */}
      {/* If logged in, go to dashboard. If not, go to login. */}
      <Route
        path="/"
        element={
          loggedIn ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 2. PUBLIC ROUTES */}
      {/* If a user is already logged in and tries to go to /login, send them back to dashboard */}
      <Route
        path="/login"
        element={loggedIn ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* 3. PROTECTED ROUTES (NESTED) */}
      <Route
        element={
          <AdminRoute>
            <Layout />
          </AdminRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add more protected routes here, e.g., /reports, /settings */}
      </Route>

      {/* 4. CATCH-ALL */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
