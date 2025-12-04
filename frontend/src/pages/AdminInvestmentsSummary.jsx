import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const AdminInvestmentsSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosClient.get("/api/admin/investments/summary");
        setSummary(res.data || null);
      } catch (err) {
        console.error("Failed to load investments summary", err);
        setError("Failed to load summary");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div>Loading summary...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!summary) return <div>No summary data.</div>;

  return (
    <div>
      <h1>Admin – Investments Summary</h1>
      <ul>
        <li>Total Invested: {summary.total_invested}</li>
        <li>Total Distributed: {summary.total_distributed}</li>
        <li>Active Count: {summary.active_count}</li>
        <li>Closed Count: {summary.closed_count}</li>
      </ul>
    </div>
  );
};

export default AdminInvestmentsSummary;