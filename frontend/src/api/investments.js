import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * Fetch all investments
 */
export async function getInvestments() {
  const response = await axios.get(`${API_BASE}/api/investments`);
  return response.data;
}

/**
 * Add a new investment record
 */
export async function addInvestment(data) {
  const response = await axios.post(`${API_BASE}/api/investments`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}
