// /src/pages/auth/Register.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Prefill but allow editing
  const initialEmail = queryParams.get("email") || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email validation
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Password validations
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const allValid =
    checks.length &&
    checks.upper &&
    checks.lower &&
    checks.number &&
    checks.special &&
    password === confirmPassword;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!allValid) {
      setError("Password does not meet requirements.");
      return;
    }

    try {
      setLoading(true);

      // REQUIRED BACKEND FORMAT
      await axiosClient.post("/api/auth/register", {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });

      navigate(`/auth/password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setLoading(false);

      if (err.response?.status === 409) {
        setError("This email is already registered.");
        return;
      }

      setError("Account creation failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] px-4">
      <div className="bg-[#111827]/80 backdrop-blur-md text-white rounded-2xl p-10 max-w-md w-full shadow-2xl border border-gray-700">

        <h1 className="text-2xl font-bold text-center mb-3">Create Account</h1>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Join the platform and get started today
        </p>

        <form onSubmit={handleRegister} className="space-y-5">

          {/* First Name */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">First name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Last name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          {/* Password + Visibility */}
          <div className="relative">
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 pr-10 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
            <span
              className="absolute right-3 top-[38px] text-gray-400 hover:text-white cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </span>
          </div>

          {/* Confirm Password + Visibility */}
          <div className="relative">
            <label className="text-sm text-gray-400 mb-1 block">Confirm password</label>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 pr-10 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
            <span
              className="absolute right-3 top-[38px] text-gray-400 hover:text-white cursor-pointer"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </span>
          </div>

          {/* Password Requirements */}
          <ul className="text-xs text-gray-400 space-y-1 pl-1">
            <li className={checks.length ? "text-green-400" : ""}>• At least 8 characters</li>
            <li className={checks.upper ? "text-green-400" : ""}>• At least one uppercase letter</li>
            <li className={checks.lower ? "text-green-400" : ""}>• At least one lowercase letter</li>
            <li className={checks.number ? "text-green-400" : ""}>• At least one number</li>
            <li className={checks.special ? "text-green-400" : ""}>• At least one special character (!@#$%^&*)</li>
            <li className={password === confirmPassword && password ? "text-green-400" : ""}>
              • Passwords match
            </li>
          </ul>

          {/* Error */}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition ${
              loading ? "bg-violet-400 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-700"
            }`}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {/* Back */}
          <div className="text-center text-sm text-gray-500 mt-3">
            <button
              type="button"
              onClick={() => navigate("/auth/start")}
              className="underline hover:text-violet-400"
            >
              Back
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
