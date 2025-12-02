// /src/pages/AdminDocumentsPage.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState("");
  const [dealName, setDealName] = useState("");
  const [profileName, setProfileName] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

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
    const loadUsers = async () => {
      try {
        const res = await axiosClient.get("/api/admin/users");
        setUsers(res.data || []);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };
    loadDocuments();
    loadUsers();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    if (!file || !selectedUserId) {
      setError("Please select a user and a PDF file.");
      return;
    }
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("label", label);
      formData.append("deal_name", dealName);
      formData.append("profile_name", profileName);
      formData.append("recipient_user_id", selectedUserId);
      const res = await axiosClient.post("/api/admin/documents/upload-for-user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("File uploaded successfully!");
      setFile(null);
      setLabel("");
      setDealName("");
      setProfileName("");
      setSelectedUserId("");
      await loadDocuments();
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploadLoading(false);
    }
  };
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

      {/* Upload Form */}
      <form onSubmit={handleUpload} style={{ marginBottom: 32 }}>
        <label>
          Select User:
          <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required>
            <option value="">-- Select User --</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.email || `User #${user.id}`}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          PDF File:
          <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} required />
        </label>
        <br />
        <label>
          Label:
          <input type="text" value={label} onChange={e => setLabel(e.target.value)} />
        </label>
        <br />
        <label>
          Deal Name:
          <input type="text" value={dealName} onChange={e => setDealName(e.target.value)} />
        </label>
        <br />
        <label>
          Profile Name:
          <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} />
        </label>
        <br />
        <button
          type="submit"
          disabled={uploadLoading}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            fontWeight: 'bold',
            padding: '10px 24px',
            borderRadius: '6px',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            fontSize: '1rem',
            cursor: uploadLoading ? 'not-allowed' : 'pointer',
            marginTop: '12px',
            marginBottom: '16px',
            transition: 'background 0.2s',
            outline: 'none',
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#2563eb'}
        >
          {uploadLoading ? "Uploading..." : "Upload Document"}
        </button>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </form>

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
