import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Link } from "react-router-dom";

const AdminProfilesPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosClient.get("/api/admin/profiles");
        setRows(res.data || []);
      } catch (err) {
        console.error("Failed to load admin profiles", err);
        setError("Failed to load profiles");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div>Loading profiles...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!rows.length) return <div>No profiles found.</div>;

  return (
    <div>
      <h1>Admin – All Profiles</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Entity</th>
            <th>Jurisdiction</th>
            <th>Type</th>
            <th>Contact Email</th>
            <th>User</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.entity_name}</td>
              <td>{p.jurisdiction}</td>
              <td>{p.profile_type}</td>
              <td>{p.contact_email}</td>
              <td>{p.user_id}</td>
              <td>
                <Link to={`/admin/profiles/${p.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProfilesPage;
