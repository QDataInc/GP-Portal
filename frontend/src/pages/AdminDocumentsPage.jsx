// /src/pages/AdminDocumentsPage.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simple load of /api/admin/documents
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const res = await axiosClient.get("/api/admin/documents");
        setDocuments(res.data || []);
      } catch (err) {
        console.error("Failed to load admin documents", err);
        setError("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  if (loading) {
    return <div>Loading documents...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!documents.length) {
    return <div>No documents found.</div>;
  }

  return (
    <div>
      <h1>Admin – All Documents</h1>
      <p>Showing all uploaded documents across all users.</p>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>File Name</th>
            <th>Label</th>
            <th>Deal</th>
            <th>Profile</th>
            <th>Uploaded By</th>
            <th>Uploaded At</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.id}</td>
              <td>{doc.name}</td>
              <td>{doc.label}</td>
              <td>{doc.deal_name}</td>
              <td>{doc.profile_name}</td>
              <td>
                {doc.uploaded_by_email
                  ? doc.uploaded_by_email
                  : `User #${doc.uploaded_by_id}`}
              </td>
              <td>{doc.uploaded_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDocumentsPage;
