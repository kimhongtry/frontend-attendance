import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, LogIn } from "lucide-react"; // Install lucide-react or use similar icons

const BASE_URL = process.env.REACT_APP_API_URL;

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("admin_token", data.token);
        navigate("/dashboard");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      alert("Cannot connect to server. Is it running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#6366f1]">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-[450px] transition-all">
        {/* Logo Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#6366f1] p-4 rounded-full shadow-lg shadow-indigo-200">
            <ShieldCheck size={40} color="white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Teacher Attendance
        </h2>
        <p className="text-center text-gray-500 mb-8 font-medium">
          Sign in to access the system
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="email"
              placeholder="Enter your username"
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-indigo-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            disabled={loading}
            className="w-full bg-[#6366f1] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              <>
                <LogIn size={20} /> Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
