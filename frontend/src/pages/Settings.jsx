import { useState, useEffect } from "react";
import { Mail, CheckCircle } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "Investor",
    email: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  // Hide toast after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Submitted data:", formData);
      setSuccess(true);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* ✅ Success Toast */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-md shadow-md flex items-center gap-2 animate-fadeIn">
          <CheckCircle size={18} />
          <p className="text-sm font-medium">Settings saved successfully!</p>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account and security preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b flex gap-8 text-sm font-medium">
        {[
          { id: "account", label: "Account" },
          { id: "security", label: "Security" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 -mb-px border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Account Tab */}
      {activeTab === "account" && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-xl shadow-sm p-6 space-y-8"
        >
          {/* Information Section */}
          <div>
            <h2 className="font-semibold text-gray-800 mb-4">Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 ${
                    errors.firstName ? "border-red-500" : "focus:ring-blue-500"
                  }`}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 ${
                    errors.lastName ? "border-red-500" : "focus:ring-blue-500"
                  }`}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={formData.role}
                  disabled
                  className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h2 className="font-semibold text-gray-800 mb-4">Contact details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 ${
                      errors.email ? "border-red-500" : "focus:ring-blue-500"
                    }`}
                  />
                  <a
                    href="#"
                    className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
                  >
                    <Mail size={14} /> Email log
                  </a>
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 ${
                    errors.phone ? "border-red-500" : "focus:ring-blue-500"
                  }`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="font-semibold text-gray-800 mb-4">Address</h2>
            <div>
              <input
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="Search or enter address"
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Save changes
            </button>
          </div>
        </form>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Security settings</h2>
          <p className="text-gray-500 text-sm">
            Manage your password and two-factor authentication here. (Coming soon)
          </p>
        </div>
      )}
    </div>
  );
}
