import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Signin() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} readOnly className="border w-full p-2 rounded bg-gray-100" />
          <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border w-full p-2 rounded" />
          <button type="submit" className="bg-blue-600 w-full py-2 text-white rounded">Sign In</button>
        </form>
      </div>
    </div>
  );
}
