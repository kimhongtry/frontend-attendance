import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Teachers from "./pages/Teachers";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import Layout from "./components/layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const isLoggedIn = true; // replace with your auth logic

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={isLoggedIn ? <Layout /> : <Navigate to="/login" />}
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="reports" element={<Reports />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>

        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
