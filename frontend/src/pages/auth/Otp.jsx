// /src/pages/auth/Otp.jsx
import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";

export default function Otp() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email") || "";

  const { loginWithToken } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputsRef = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // allow only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosClient.post("/api/auth/login-verify-otp", {
        email,
        otp: code,
      });

      // Expected response: { access_token }
      const token = res.data?.access_token;

      if (!token) {
        setError("Invalid response from server");
        return;
      }

      // Save token using AuthContext
      loginWithToken(token);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] px-4">
      <div className="bg-[#111827]/80 backdrop-blur-md text-white rounded-2xl p-10 w-full max-w-md shadow-2xl border border-gray-700">

        <h1 className="text-2xl font-bold mb-3 text-center">Enter OTP</h1>
        <p className="text-gray-400 text-sm mb-6 text-center">
          We sent a 6-digit code to <span className="text-violet-400">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* OTP boxes */}
          <div className="flex justify-between gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                maxLength={1}
                inputMode="numeric"
                className="w-12 h-14 text-center text-xl font-semibold rounded-lg
                           bg-slate-900 border border-slate-700 text-white
                           focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            ))}
          </div>

          {/* Error */}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition
              ${loading ? "bg-violet-400 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-700"}`}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

          {/* Back */}
          <div className="text-center text-sm text-gray-500 mt-2">
            <button
              type="button"
              className="hover:text-violet-400 underline"
              onClick={() => navigate(`/auth/password?email=${encodeURIComponent(email)}`)}
            >
              Back
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
