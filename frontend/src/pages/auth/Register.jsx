import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: searchParams.get("email") || "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form.first_name, form.last_name, form.email, form.password);
      navigate("/dashboard");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">Create your account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="first_name" onChange={handleChange} placeholder="First name" className="border w-full p-2 rounded" />
          <input name="last_name" onChange={handleChange} placeholder="Last name" className="border w-full p-2 rounded" />
          <input name="email" value={form.email} readOnly className="border w-full p-2 rounded bg-gray-100" />
          <input name="password" type="password" onChange={handleChange} placeholder="Password" className="border w-full p-2 rounded" />
          <button type="submit" className="bg-blue-600 w-full py-2 text-white rounded">Register</button>
        </form>
      </div>
    </div>
  );
}
