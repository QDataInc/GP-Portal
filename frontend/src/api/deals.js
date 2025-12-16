import axiosClient from "./axiosClient";

export async function getDeals() {
  const res = await axiosClient.get("/api/deals");
  return res.data;
}

export async function getDealById(dealId) {
  const res = await axiosClient.get(`/api/deals/${dealId}`);
  return res.data;
}

export async function showInterest(dealId) {
  const res = await axiosClient.post(`/api/deals/${dealId}/interest`);
  return res.data;
}
