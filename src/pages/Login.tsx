import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/api/auth/login", {
        email: username,
        password,
      });

      console.log(res.data);

      // save token
      localStorage.setItem("token", res.data.token);

      alert("Login success 🚀");
      // TODO: redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Login failed ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600">
      <div className="bg-white w-[400px] rounded-2xl shadow-lg p-8">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 flex items-center justify-center bg-purple-500 text-white rounded-full text-xl">
            🛡️
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-1">
          Teacher Attendance
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Sign in to access the system
        </p>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <label className="block text-sm mb-1">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          {/* Show/Hide */}
          <span
            className="absolute right-3 top-9 cursor-pointer text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            👁️
          </span>
        </div>

        {/* Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
        >
          → Sign In
        </button>
      </div>
    </div>
  );
};

export default Login;
