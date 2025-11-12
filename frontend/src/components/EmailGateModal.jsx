import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function EmailGateModal() {
  const { checkEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ---------------------------------------------------------
  // Handle Continue button
  // ---------------------------------------------------------
  const handleContinue = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const exists = await checkEmail(email);
      setLoading(false);

      if (exists) {
        // ✅ Existing user → go to Sign In
        navigate(`/auth/signin?email=${encodeURIComponent(email)}`);
      } else {
        // ✅ New user → show message, don’t redirect automatically
        setError("Email not found. Please register one.");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Server error. Please try again.");
    }
  };

  // ---------------------------------------------------------
  // Handle "Create one" link → clean state, open register page
  // ---------------------------------------------------------
  const handleCreateAccount = () => {
    setEmail("");
    setError("");
    const cleanUrl = new URL(window.location.href);
    cleanUrl.search = "";
    window.history.replaceState({}, "", cleanUrl.toString());
    navigate("/auth/register", { replace: true });
  };

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
      className="fixed inset-0 bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] flex items-center justify-center z-50"
    >
      <div className="bg-[#111827]/80 backdrop-blur-md text-white rounded-2xl p-10 w-full max-w-md shadow-2xl border border-gray-700 transition-transform transform hover:scale-[1.01]">
        <h2
          id="email-modal-title"
          className="text-2xl font-bold mb-3 text-center"
        >
          Welcome
        </h2>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Log in to your account or create a new one
        </p>

        <form onSubmit={handleContinue} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="you@example.com"
              autoComplete="username"
              disabled={loading}
              autoFocus
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
            />
          </div>

          {/* ✅ Show error messages below input */}
          {error && (
            <p className="text-red-400 text-sm text-center -mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-violet-400 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-700"
            }`}
          >
            {loading ? "Checking..." : "Continue"}
          </button>

          <div className="text-center text-sm text-gray-400">
            No account?{" "}
            <button
              type="button"
              onClick={handleCreateAccount}
              className="text-violet-400 hover:text-violet-300 underline"
            >
              Create one
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
