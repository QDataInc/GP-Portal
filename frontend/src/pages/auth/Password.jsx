// /src/pages/auth/Password.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function Password() {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);

  const email = query.get("email") || "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter your password");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosClient.post("/api/auth/login-init", {
        email,
        password
      });

      // If success → OTP sent
      navigate(`/auth/otp?email=${encodeURIComponent(email)}`);

    } catch (err) {
      setLoading(false);

      // User does NOT exist → go register
      if (err.response?.status === 404) {
        navigate(`/auth/register?email=${encodeURIComponent(email)}`);
        return;
      }

      // Wrong password
      if (err.response?.status === 401) {
        setError("Incorrect password. Try again.");
        return;
      }

      setError("Login failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] px-4">
      <div className="bg-[#111827]/80 text-white rounded-2xl p-10 max-w-md w-full border border-gray-700 shadow-xl">

        <h1 className="text-2xl font-bold mb-4 text-center">Enter Password</h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Logging in as <span className="text-violet-400">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-transparent text-white
                         placeholder-gray-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white font-semibold transition"
          >
            {loading ? "Checking..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
