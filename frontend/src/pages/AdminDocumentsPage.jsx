// /src/pages/AdminDocumentsPage.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { X, Check, Upload } from "lucide-react";

const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [files, setFiles] = useState([]);
  const [label, setLabel] = useState("");
  const [dealName, setDealName] = useState("");
  const [profileName, setProfileName] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    currentFile: "",
    currentUser: "",
  });
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

  useEffect(() => {
    loadDocuments();
    loadUsers();
  }, []);

  // Helper function to get user display name
  const getUserDisplayName = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    } else if (user.username) {
      return user.username;
    } else if (user.email) {
      return user.email;
    }
    return `User #${user.id}`;
  };

  // Handle multiple user selection
  const handleUserToggle = (userId) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAllUsers = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((user) => user.id));
    }
  };

  // Handle multiple file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setUploadSuccess(false);

    if (files.length === 0) {
      setError("Please select at least one PDF file.");
      return;
    }

    if (selectedUserIds.length === 0) {
      setError("Please select at least one user.");
      return;
    }

    // Validate all files are PDFs
    const invalidFiles = files.filter(
      (file) => !file.name.toLowerCase().endsWith(".pdf")
    );
    if (invalidFiles.length > 0) {
      setError("All files must be PDF format.");
      return;
    }

    setUploadLoading(true);
    const totalUploads = files.length * selectedUserIds.length;
    let completed = 0;
    const errors = [];

    try {
      // Upload each file to each selected user
      for (const file of files) {
        for (const userId of selectedUserIds) {
          const user = users.find((u) => u.id === userId);
          setUploadProgress({
            current: completed + 1,
            total: totalUploads,
            currentFile: file.name,
            currentUser: user ? getUserDisplayName(user) : `User #${userId}`,
          });

          try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("label", label);
            formData.append("deal_name", dealName);
            formData.append("profile_name", profileName);
            formData.append("recipient_user_id", userId.toString());

            await axiosClient.post(
              "/api/admin/documents/upload-for-user",
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            );

            completed++;
          } catch (err) {
            const errorMsg = `Failed to upload ${file.name} to ${user?.email || `User #${userId}`}: ${err.response?.data?.detail || err.message}`;
            errors.push(errorMsg);
            console.error(errorMsg, err);
            completed++;
          }
        }
      }

      if (errors.length > 0) {
        setError(
          `Completed ${completed}/${totalUploads} uploads. Errors: ${errors.join("; ")}`
        );
      } else {
        setUploadSuccess(true);
        // Reset form
        setFiles([]);
        setLabel("");
        setDealName("");
        setProfileName("");
        setSelectedUserIds([]);
      }

      // Reload documents
      await loadDocuments();

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress({
          current: 0,
          total: 0,
          currentFile: "",
          currentUser: "",
        });
      }, 3000);
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Admin – All Documents
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Showing all uploaded documents across all users.
        </p>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Upload Documents
        </h2>
        <form onSubmit={handleUpload} className="space-y-4">
          {/* Multiple User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Users (multiple selection allowed):
            </label>
            <div className="border rounded-md p-3 max-h-48 overflow-y-auto bg-gray-50">
              <label className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={
                    users.length > 0 &&
                    selectedUserIds.length === users.length
                  }
                  onChange={handleSelectAllUsers}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-gray-700">
                  Select All ({users.length} users)
                </span>
              </label>
              <div className="space-y-1">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleUserToggle(user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        {getUserDisplayName(user)}
                      </span>
                      {user.email && user.email !== getUserDisplayName(user) && (
                        <span className="text-xs text-gray-500">
                          {user.email}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
            {selectedUserIds.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {selectedUserIds.length} user(s) selected
              </p>
            )}
          </div>

          {/* Multiple File Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF Files (multiple selection allowed):
            </label>
            <input
              key={files.length} // Reset input when files array changes
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              multiple
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {files.length > 0 && (
              <div className="mt-2 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                  >
                    <span className="text-sm text-gray-700">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <p className="text-sm text-gray-600">
                  {files.length} file(s) selected
                </p>
              </div>
            )}
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label:
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Deal Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deal Name:
            </label>
            <input
              type="text"
              value={dealName}
              onChange={(e) => setDealName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Profile Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Name:
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Upload Progress */}
          {uploadLoading && uploadProgress.total > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  Uploading: {uploadProgress.current} / {uploadProgress.total}
                </span>
                <span className="text-sm text-blue-600">
                  {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-blue-700 mt-2">
                File: {uploadProgress.currentFile}
              </p>
              <p className="text-xs text-blue-700">
                User: {uploadProgress.currentUser}
              </p>
            </div>
          )}

          {/* Success Message */}
          {uploadSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center gap-2">
              <Check size={20} className="text-green-600" />
              <span className="text-sm text-green-800">
                All documents uploaded successfully!
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Upload Button */}
          <button
            type="submit"
            disabled={uploadLoading || files.length === 0 || selectedUserIds.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Upload size={16} />
            {uploadLoading
              ? `Uploading... (${uploadProgress.current}/${uploadProgress.total})`
              : `Upload ${files.length} file(s) to ${selectedUserIds.length} user(s)`}
          </button>
        </form>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">File Name</th>
              <th className="px-4 py-3 text-left">Label</th>
              <th className="px-4 py-3 text-left">Deal</th>
              <th className="px-4 py-3 text-left">Profile</th>
              <th className="px-4 py-3 text-left">Uploaded By</th>
              <th className="px-4 py-3 text-left">Uploaded At</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-gray-500 text-center"
                >
                  No documents found.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{doc.id}</td>
                  <td className="px-4 py-3">{doc.name}</td>
                  <td className="px-4 py-3">{doc.label || "-"}</td>
                  <td className="px-4 py-3">{doc.deal_name || "-"}</td>
                  <td className="px-4 py-3">{doc.profile_name || "-"}</td>
                  <td className="px-4 py-3">
                    {doc.uploaded_by_email
                      ? doc.uploaded_by_email
                      : `User #${doc.uploaded_by_id}`}
                  </td>
                  <td className="px-4 py-3">
                    {doc.uploaded_at
                      ? new Date(doc.uploaded_at).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {doc.file_path ? (
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              setActionLoading(true);
                              const res = await axiosClient.get(
                                `/api/admin/documents/${doc.id}/view`,
                                { responseType: "blob" }
                              );
                              const url = window.URL.createObjectURL(
                                new Blob([res.data], { type: "application/pdf" })
                              );
                              window.open(url, "_blank");
                            } catch (err) {
                              console.error(err);
                              setError("Failed to open document");
                            } finally {
                              setActionLoading(false);
                            }
                          }}
                          disabled={actionLoading}
                          className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50"
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
                              const url = window.URL.createObjectURL(
                                new Blob([res.data], { type: "application/pdf" })
                              );
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
                          className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 disabled:opacity-50"
                        >
                          Download
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">No file</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDocumentsPage;
