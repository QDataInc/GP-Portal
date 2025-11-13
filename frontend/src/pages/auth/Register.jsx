// /src/pages/auth/Register.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 👁️ Toggles for visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ✅ Password strength info
  const [strength, setStrength] = useState("");

  // ✅ clear stray ?email=
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.search) {
      url.search = "";
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  // ✅ Allowed domains
  const allowedDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "microsoft.com",
    "icloud.com",
    "protonmail.com",
  ];

  // ✅ Regex patterns
  const validations = {
    length: /.{8,}/,
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /\d/,
    special: /[@$!%*?&]/,
  };

  // ✅ Password strength label
  const evaluateStrength = (password) => {
    if (!password) return "";
    let score = 0;
    Object.values(validations).forEach((regex) => {
      if (regex.test(password)) score++;
    });
    if (score <= 2) return "Weak";
    if (score === 3 || score === 4) return "Medium";
    return "Strong";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "password") {
      setStrength(evaluateStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { first_name, last_name, email, password, confirmPassword } = form;

    if (!first_name || !last_name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    // ✅ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address (e.g. user@gmail.com).");
      return;
    }
    const domain = email.split("@")[1].toLowerCase();
    if (!allowedDomains.includes(domain)) {
      setError(
        "Please register using a valid email provider like Gmail, Yahoo, Outlook, or Microsoft."
      );
      return;
    }

    // ✅ Password validation
    const isStrong =
      validations.length.test(password) &&
      validations.uppercase.test(password) &&
      validations.lowercase.test(password) &&
      validations.number.test(password) &&
      validations.special.test(password);

    if (!isStrong) {
      setError("Password must meet all the required conditions below.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await register(first_name, last_name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setLoading(false);
      if (err?.response?.status === 409) {
        setError("This email is already registered. Redirecting to Sign In...");
        setTimeout(() => {
          navigate(`/auth/signin?email=${encodeURIComponent(email)}`);
        }, 1800);
        return;
      }
      setError("Registration failed. Please try again.");
    }
  };

  const getStrengthColor = (level) => {
    switch (level) {
      case "Weak":
        return "text-red-400";
      case "Medium":
        return "text-yellow-400";
      case "Strong":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e]">
      <div className="bg-[#111827]/80 backdrop-blur-md text-white rounded-2xl p-10 w-full max-w-md shadow-2xl border border-gray-700">
        <h1 className="text-2xl font-bold mb-3 text-center">Create Account</h1>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Join the platform and get started today
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First / Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">First name</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="John"
                className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Last name</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@gmail.com"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 pr-10 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 outline-none"
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

          {/* Password Strength */}
          {strength && (
            <p className={`text-sm mt-1 ${getStrengthColor(strength)}`}>
              Password Strength: {strength}
            </p>
          )}

          {/* Password Requirement Checklist */}
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex items-center gap-2">
              {validations.length.test(form.password) ? (
                <FaCheckCircle className="text-green-400" />
              ) : (
                <FaTimesCircle className="text-red-400" />
              )}
              <span>At least 8 characters</span>
            </div>
            <div className="flex items-center gap-2">
              {validations.uppercase.test(form.password) ? (
                <FaCheckCircle className="text-green-400" />
              ) : (
                <FaTimesCircle className="text-red-400" />
              )}
              <span>At least one uppercase letter</span>
            </div>
            <div className="flex items-center gap-2">
              {validations.lowercase.test(form.password) ? (
                <FaCheckCircle className="text-green-400" />
              ) : (
                <FaTimesCircle className="text-red-400" />
              )}
              <span>At least one lowercase letter</span>
            </div>
            <div className="flex items-center gap-2">
              {validations.number.test(form.password) ? (
                <FaCheckCircle className="text-green-400" />
              ) : (
                <FaTimesCircle className="text-red-400" />
              )}
              <span>At least one number</span>
            </div>
            <div className="flex items-center gap-2">
              {validations.special.test(form.password) ? (
                <FaCheckCircle className="text-green-400" />
              ) : (
                <FaTimesCircle className="text-red-400" />
              )}
              <span>At least one special character (@$!%*?&)</span>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="relative mt-5">
            <label className="block text-sm text-gray-400 mb-1">Confirm password</label>
            <input
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 pr-10 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-[34px] text-gray-400 hover:text-white"
            >
              {showConfirm ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
          </div>

          {/* Error */}
          {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-3 py-2 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-violet-400 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-700"
            }`}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {/* Navigation Links */}
          <div className="text-center text-sm text-gray-400 mt-3">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() =>
                navigate(`/auth/signin?email=${encodeURIComponent(form.email)}`)
              }
              className="text-violet-400 hover:text-violet-300 underline"
            >
              Sign in
            </button>
          </div>

          <div className="text-center text-sm text-gray-500 mt-2">
            <button
              type="button"
              onClick={() => navigate("/auth/start")}
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
