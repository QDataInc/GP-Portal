import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const AdminInvestmentsPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosClient.get("/api/admin/investments");
        setRows(res.data || []);
      } catch (err) {
        console.error("Failed to load admin investments", err);
        setError("Failed to load investments");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div>Loading investments...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!rows.length) return <div>No investments found.</div>;

  return (
    <div>
      <h1>Admin – All Investments</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Deal</th>
            <th>Invested</th>
            <th>Distributed</th>
            <th>Status</th>
            <th>Uploaded By</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.deal_name}</td>
              <td>{r.investment_total}</td>
              <td>{r.distribution_total}</td>
              <td>{r.status}</td>
              <td>{r.uploaded_by_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminInvestmentsPage;
