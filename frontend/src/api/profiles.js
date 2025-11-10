import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ---- Fetch all profiles ----
export async function getProfiles() {
  const res = await axios.get(`${API_BASE}/api/profiles`);
  return res.data;
}

// ---- Add a new profile ----
export async function addProfile(profile) {
  const res = await axios.post(`${API_BASE}/api/profiles`, profile, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// ---- Update an existing profile ----
export async function updateProfile(id, profile) {
  const res = await axios.put(`${API_BASE}/api/profiles/${id}`, profile, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// ---- Delete a profile ----
export async function deleteProfile(id) {
  const res = await axios.delete(`${API_BASE}/api/profiles/${id}`);
  return res.data;
}
