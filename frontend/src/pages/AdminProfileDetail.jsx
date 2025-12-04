import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useParams, useNavigate } from "react-router-dom";

const AdminProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosClient.get(`/api/admin/profiles/${id}`);
        setRec(res.data || null);
      } catch (err) {
        console.error("Failed to load profile", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!rec) return <div>Profile not found.</div>;

  return (
    <div>
      <h1>Profile #{rec.id}</h1>
      <p><strong>Entity:</strong> {rec.entity_name}</p>
      <p><strong>Jurisdiction:</strong> {rec.jurisdiction}</p>
      <p><strong>Tax:</strong> {rec.tax_classification}</p>
      <p><strong>Type:</strong> {rec.profile_type}</p>
      <p><strong>Contact Email:</strong> {rec.contact_email}</p>
      <p><strong>Contact Phone:</strong> {rec.contact_phone}</p>
      <p><strong>User ID:</strong> {rec.user_id}</p>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
};

export default AdminProfileDetail;