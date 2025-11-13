// /src/pages/Documents.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState("");
  const [dealName, setDealName] = useState("");
  const [profileName, setProfileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all documents
  const loadDocuments = async () => {
    try {
      const res = await axiosClient.get("/api/documents");
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to load documents", err);
      setError("Failed to load documents");
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // ✅ Upload new document
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!file) {
      setError("Please select a PDF file to upload.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("label", label);
      formData.append("deal_name", dealName);
      formData.append("profile_name", profileName);

      const res = await axiosClient.post("/api/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload success:", res.data);
      await loadDocuments();
      alert("File uploaded successfully!");
    } catch (err) {
      console.error("Upload failed", err);
      if (err.response?.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else if (err.response?.status === 400) {
        setError(err.response.data.detail || "Upload failed. Bad request.");
      } else {
        setError("Upload failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">View documents</h1>

      {error && (
        <p className="text-red-500 bg-red-100 border border-red-400 rounded p-2 mb-3">
          {error}
        </p>
      )}

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <div>
          <label className="block mb-1 text-sm">Upload PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <input
          type="text"
          placeholder="Document label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="border rounded p-2 w-full"
        />
        <input
          type="text"
          placeholder="Deal name"
          value={dealName}
          onChange={(e) => setDealName(e.target.value)}
          className="border rounded p-2 w-full"
        />
        <input
          type="text"
          placeholder="Profile name"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          className="border rounded p-2 w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {/* Documents Table */}
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Document</th>
            <th className="border px-3 py-2 text-left">Label</th>
            <th className="border px-3 py-2 text-left">Deal Name</th>
            <th className="border px-3 py-2 text-left">Profile Name</th>
            <th className="border px-3 py-2 text-left">Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {documents.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                No documents found.
              </td>
            </tr>
          ) : (
            documents.map((doc) => (
              <tr key={doc.id}>
                <td className="border px-3 py-2">{doc.name}</td>
                <td className="border px-3 py-2">{doc.label || "-"}</td>
                <td className="border px-3 py-2">{doc.deal_name || "-"}</td>
                <td className="border px-3 py-2">{doc.profile_name || "-"}</td>
                <td className="border px-3 py-2">
                  {new Date(doc.uploaded_at).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
