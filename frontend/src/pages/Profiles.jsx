// src/pages/Profiles.jsx
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getMyProfile, addProfile, updateProfile } from "../api/profiles";

export default function Profiles() {
  const [showEIN, setShowEIN] = useState(false);

  // form fields (keep exactly as your UI expects)
  const [formData, setFormData] = useState({
    profileType: "",
    entityName: "",
    jurisdiction: "",
    dateFormed: "",
    iraLLC: "No",
    members: "",
    federalTax: "",
    llcTax: "",
    disregarded: "No",
    ein: "*****5024",
  });

  // backend profile id
  const [profileId, setProfileId] = useState(null);

  // Load profile on page load
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getMyProfile();

        setProfileId(profile.id);

        // Map backend → frontend fields
        setFormData((prev) => ({
          ...prev,
          profileType: profile.profile_type || "",
          entityName: profile.entity_name || "",
          jurisdiction: profile.jurisdiction || "",
          federalTax: profile.tax_classification || "",
          // keep all UI-only fields (dateFormed, iraLLC, etc.) unchanged
        }));
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }

    loadProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save profile to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Map frontend → backend fields
    const payload = {
      entity_name: formData.entityName,
      jurisdiction: formData.jurisdiction || null,
      tax_classification: formData.federalTax || null,
      profile_type: formData.profileType || null,
      contact_email: null,
      contact_phone: null,
    };

    try {
      if (profileId) {
        await updateProfile(profileId, payload);
      } else {
        const created = await addProfile(payload);
        setProfileId(created.id);
      }

      alert("Profile details saved!");
      console.log("Profile saved:", payload);
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profile details</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your entity’s legal and tax information.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-xl shadow-sm p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile type <span className="text-red-500">*</span>
            </label>
            <select
              name="profileType"
              value={formData.profileType}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              <option>LLC</option>
              <option>Corporation</option>
              <option>Partnership</option>
              <option>Trust</option>
              <option>Solo 401(k)</option>
              <option>Checkbook IRA</option>
            </select>
          </div>

          {/* Entity name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entity name <span className="text-red-500">*</span>
            </label>
            <input
              name="entityName"
              type="text"
              value={formData.entityName}
              onChange={handleChange}
              placeholder="e.g., QD Wealth Management LLC"
              required
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Jurisdiction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jurisdiction of registration <span className="text-red-500">*</span>
            </label>
            <input
              name="jurisdiction"
              type="text"
              value={formData.jurisdiction}
              onChange={handleChange}
              placeholder="e.g., Texas"
              required
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date formed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date formed
            </label>
            <input
              name="dateFormed"
              type="date"
              value={formData.dateFormed}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* IRA LLC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Is this an IRA LLC?
            </label>
            <select
              name="iraLLC"
              value={formData.iraLLC}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option>No (most common)</option>
              <option>Yes</option>
            </select>
          </div>

          {/* Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of members
            </label>
            <input
              name="members"
              type="number"
              value={formData.members}
              onChange={handleChange}
              placeholder="e.g., 2"
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Federal tax classification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Federal tax classification <span className="text-red-500">*</span>
            </label>
            <select
              name="federalTax"
              value={formData.federalTax}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select classification</option>
              <option>LLC (excluding single-member LLC)</option>
              <option>Single-member LLC</option>
              <option>Corporation</option>
              <option>Partnership</option>
            </select>
          </div>

          {/* LLC tax classification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LLC tax classification <span className="text-red-500">*</span>
            </label>
            <select
              name="llcTax"
              value={formData.llcTax}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select classification</option>
              <option>S Corporation</option>
              <option>C Corporation</option>
              <option>Partnership</option>
            </select>
          </div>

          {/* Disregarded entity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Is this a disregarded entity?
            </label>
            <select
              name="disregarded"
              value={formData.disregarded}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>

          {/* EIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              EIN/Tax ID of entity <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="ein"
                type={showEIN ? "text" : "password"}
                value={formData.ein}
                onChange={handleChange}
                required
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowEIN(!showEIN)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showEIN ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}