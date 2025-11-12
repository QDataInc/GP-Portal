// /src/pages/auth/Signin.jsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function Signin() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Allowed real-world email domains
  const allowedDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "microsoft.com",
    "icloud.com",
    "protonmail.com",
  ];

  // ✅ Validate email format and domain
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    const domain = email.split("@")[1].toLowerCase();
    return allowedDomains.includes(domain);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    // ✅ validate email before sending request
    if (!validateEmail(email)) {
      setError(
        "Please enter a valid email (e.g. user@gmail.com, user@outlook.com, user@yahoo.com)."
      );
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setLoading(false);

      if (err.response?.status === 404) {
        setError("Email not found. Please register one.");
      } else if (err.response?.status === 401) {
        setError("Incorrect password. Please try again.");
      } else {
        setError("Login failed. Please try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e]">
      <div className="bg-[#111827]/80 backdrop-blur-md text-white rounded-2xl p-10 w-full max-w-md shadow-2xl border border-gray-700">
        <h1 className="text-2xl font-bold mb-3 text-center">Welcome back</h1>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Sign in to access your dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              autoComplete="username"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Password field with toggle */}
          <div className="relative">
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 pr-10 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-400 hover:text-white"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
          </div>

          {/* Error messages */}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-violet-400 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-700"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Navigation links */}
          <div className="text-center text-sm text-gray-400">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setEmail("");
                navigate("/auth/register");
              }}
              className="text-violet-400 hover:text-violet-300 underline"
            >
              Create one
            </button>
          </div>

          <div className="text-center text-sm text-gray-500 mt-2">
            <button
              type="button"
              onClick={() => {
                setEmail("");
                setPassword("");
                navigate("/auth/start");
              }}
              className="hover:text-violet-400 underline transition"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
