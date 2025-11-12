// /src/pages/auth/Register.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // ✅ Always start blank (no query param prefill)
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ (Optional safety) strip any stray ?email= from URL
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.search) {
      url.search = "";
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await register(form.first_name, form.last_name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setLoading(false);

      // ✅ If email already exists, silently route to Sign In (no popup)
      if (err?.response?.status === 409) {
        navigate(`/auth/signin?email=${encodeURIComponent(form.email)}`);
        return;
      }

      setError("Registration failed. Please try again.");
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">First name</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="John"
                className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Last name</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Confirm password</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center -mt-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition ${
              loading ? "bg-violet-400 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-700"
            }`}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <div className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate(`/auth/signin?email=${encodeURIComponent(form.email)}`)}
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
