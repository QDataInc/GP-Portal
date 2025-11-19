// /src/pages/auth/Start.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function Start() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleContinue = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);

      // ❗ Try login-init with dummy password to check if user exists
      const response = await axiosClient.post("/api/auth/login-init", {
        email,
        password: "dummy_password_for_check"
      });

      // If backend responds OK (rare), treat as existing user
      navigate(`/auth/password?email=${encodeURIComponent(email)}`);

    } catch (err) {
      setLoading(false);

      // ❗ Backend says: user does NOT exist
      if (err.response?.status === 404) {
        setError("Account not registered. Create one below.");
        return;
      }

      // ❗ Backend says: email exists (wrong password)
      if (err.response?.status === 401 || err.response?.status === 422) {
        navigate(`/auth/password?email=${encodeURIComponent(email)}`);
        return;
      }

      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] px-4">
      <div className="bg-[#111827]/80 backdrop-blur-md text-white rounded-2xl p-10 w-full max-w-md shadow-2xl border border-gray-700">

        <h1 className="text-3xl font-bold text-center mb-3">Welcome</h1>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Log in to your account or create a new one
        </p>

        <form onSubmit={handleContinue} className="space-y-5">

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="you@example.com"
              autoComplete="username"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-transparent text-white
                         placeholder-gray-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center -mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg text-white font-semibold bg-violet-600 hover:bg-violet-700 transition"
          >
            {loading ? "Checking..." : "Continue"}
          </button>
        </form>

        {/* Create Account Link */}
        <div className="text-center text-sm text-gray-400 mt-4">
          Don't have an account?{" "}
          <button
            onClick={() =>
              navigate(`/auth/register?email=${encodeURIComponent(email || "")}`)
            }
            className="text-violet-400 hover:text-violet-300 underline"
          >
            Create one
          </button>
        </div>
      </div>
    </div>
  );
}
