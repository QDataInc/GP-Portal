import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function uploadDocument({ file, label, dealName, profileName }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("label", label || "");
  formData.append("deal_name", dealName || "");
  formData.append("profile_name", profileName || "");

  const response = await axios.post(`${API_BASE}/api/documents/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

export async function getDocuments() {
  const response = await axios.get(`${API_BASE}/api/documents`);
  return response.data;
}
