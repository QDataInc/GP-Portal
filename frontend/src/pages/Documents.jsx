import { useEffect, useState } from "react";
import {
  Download,
  Eye,
  PlusCircle,
  Filter,
  Calendar,
  Search,
  Upload,
  X,
} from "lucide-react";
import { uploadDocument, getDocuments } from "../api/documents";

export default function Documents() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const [newDoc, setNewDoc] = useState({
    file: null,
    label: "",
    deal: "",
    profile: "",
  });

  // Fetch documents
  const loadDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data || []);
    } catch (err) {
      console.error("Failed to load documents", err);
      setToast("❌ Failed to load documents");
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Upload handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newDoc.file) {
      setToast("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setToast("");

    try {
      await uploadDocument({
        file: newDoc.file,
        label: newDoc.label,
        dealName: newDoc.deal,
        profileName: newDoc.profile,
      });

      setToast("✅ Document uploaded successfully");
      setIsModalOpen(false);
      setNewDoc({ file: null, label: "", deal: "", profile: "" });
      await loadDocuments(); // refresh table
    } catch (err) {
      console.error("Upload failed", err);
      setToast("❌ Upload failed");
    } finally {
      setLoading(false);
      setTimeout(() => setToast(""), 2500);
    }
  };

  // Search filter
  const filtered = documents.filter((d) => {
    const q = search.toLowerCase();
    return (
      (d.name || "").toLowerCase().includes(q) ||
      (d.label || "").toLowerCase().includes(q) ||
      (d.deal_name || "").toLowerCase().includes(q) ||
      (d.profile_name || "").toLowerCase().includes(q)
    );
  });

  const fileHref = (doc) => {
    if (!doc?.file_path) return "#";
    const normalized = doc.file_path.replace(/\\/g, "/");
    const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    return `${API_BASE}/${normalized}`;
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className="border rounded-md px-3 py-2 text-sm bg-blue-50 border-blue-200 text-blue-800">
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">View documents</h1>
        <p className="text-gray-500 text-sm mt-1">Documents</p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-6 text-sm font-medium">
          {[
            { id: "all", label: "All documents" },
            { id: "tax", label: "Tax documents" },
            { id: "deal", label: "Documents by deal" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 -mb-px border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Search + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 border rounded-md px-4 py-2 text-sm hover:bg-gray-50">
            <Filter size={16} /> Filters <span className="ml-1 text-gray-400 text-xs">(0)</span>
          </button>
          <button
            onClick={() =>
              window.open(
                (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000") +
                  "/api/documents",
                "_blank"
              )
            }
            className="flex items-center gap-2 border rounded-md px-4 py-2 text-sm hover:bg-gray-50"
          >
            <Download size={16} /> Download all
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 border rounded-md px-4 py-2 text-sm hover:bg-gray-50"
          >
            <PlusCircle size={16} /> Add document
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 w-8">
                <input type="checkbox" className="accent-blue-600" />
              </th>
              <th className="px-4 py-3 text-left">Document</th>
              <th className="px-4 py-3 text-left">Document label</th>
              <th className="px-4 py-3 text-left">Deal name</th>
              <th className="px-4 py-3 text-left">Profile name</th>
              <th className="px-4 py-3 text-left flex items-center gap-1">
                Date added <Calendar size={12} />
              </th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => (
              <tr key={doc.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input type="checkbox" className="accent-blue-600" />
                </td>
                <td className="px-4 py-3">
                  <a
                    href={fileHref(doc)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-medium hover:underline"
                  >
                    {doc.name}
                  </a>
                </td>
                <td className="px-4 py-3">{doc.label || "-"}</td>
                <td className="px-4 py-3">{doc.deal_name || "-"}</td>
                <td className="px-4 py-3">{doc.profile_name || "-"}</td>
                <td className="px-4 py-3">
                  {doc.uploaded_at
                    ? new Date(doc.uploaded_at).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-3 flex items-center gap-3 text-gray-500">
                  <a
                    href={fileHref(doc)}
                    target="_blank"
                    rel="noreferrer"
                    title="View"
                  >
                    <Eye size={16} className="hover:text-blue-600" />
                  </a>
                  <a href={fileHref(doc)} download title="Download">
                    <Download size={16} className="hover:text-blue-600" />
                  </a>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={7}>
                  No documents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Upload new document
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload PDF
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setNewDoc({ ...newDoc, file: e.target.files?.[0] || null })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document label
                </label>
                <input
                  type="text"
                  value={newDoc.label}
                  onChange={(e) =>
                    setNewDoc({ ...newDoc, label: e.target.value })
                  }
                  placeholder="e.g., Subscription document"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal name
                </label>
                <input
                  type="text"
                  value={newDoc.deal}
                  onChange={(e) =>
                    setNewDoc({ ...newDoc, deal: e.target.value })
                  }
                  placeholder="e.g., Irving Oaks"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile name
                </label>
                <input
                  type="text"
                  value={newDoc.profile}
                  onChange={(e) =>
                    setNewDoc({ ...newDoc, profile: e.target.value })
                  }
                  placeholder="e.g., QD Wealth Management LLC"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
                >
                  <Upload size={14} className="inline-block mr-1" />
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
