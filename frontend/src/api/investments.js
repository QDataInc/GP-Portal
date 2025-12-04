// /src/api/investments.js
import axiosClient from "./axiosClient";

// ✅ Get all investments
export const getInvestments = async () => {
  const res = await axiosClient.get("/api/investments");
  return res.data;
};

// ✅ Add new investment
export const addInvestment = async (investment) => {
  const res = await axiosClient.post("/api/investments", investment);
  return res.data;
};

// ✅ Delete investment (optional)
export const deleteInvestment = async (id) => {
  const res = await axiosClient.delete(`/api/investments/${id}`);
  return res.data;
};

// ✅ Get investment summary
export const getInvestmentSummary = async () => {
  const res = await axiosClient.get("/api/investments/summary");
  return res.data;
};