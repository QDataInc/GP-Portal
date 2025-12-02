// /src/pages/AdminDocumentsPage.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

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
            <th>Actions</th>
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
              <td>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString() : "-"}</td>
              <td>
                {doc.file_path ? (
                  <>
                    <button
                      onClick={async () => {
                        try {
                          setActionLoading(true);
                          const res = await axiosClient.get(
                            `/api/admin/documents/${doc.id}/view`,
                            { responseType: "blob" }
                          );
                          const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
                          window.open(url, "_blank");
                        } catch (err) {
                          console.error(err);
                          setError("Failed to open document");
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      style={{ marginRight: 8 }}
                      disabled={actionLoading}
                    >
                      View
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          setActionLoading(true);
                          const res = await axiosClient.get(
                            `/api/admin/documents/${doc.id}/download`,
                            { responseType: "blob" }
                          );
                          const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = doc.name || `document_${doc.id}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          window.URL.revokeObjectURL(url);
                        } catch (err) {
                          console.error(err);
                          setError("Failed to download document");
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      disabled={actionLoading}
                    >
                      Download
                    </button>
                  </>
                ) : (
                  "No file"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDocumentsPage;
