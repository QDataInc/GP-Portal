// /src/api/documents.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const getDocuments = async () => {
  const res = await axios.get(`${API_BASE}/api/documents`);
  return res.data;
};

export const uploadDocument = async ({ file, label, dealName, profileName }) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("label", label);
  formData.append("dealName", dealName);
  formData.append("profileName", profileName);

  const res = await axios.post(`${API_BASE}/api/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
