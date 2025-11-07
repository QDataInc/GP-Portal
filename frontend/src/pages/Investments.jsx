import { useEffect, useState } from "react";
import {
  Filter,
  PlusCircle,
  Download,
  Search,
  X,
  Upload,
} from "lucide-react";
import { getInvestments, addInvestment } from "../api/investments";

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const [newInvestment, setNewInvestment] = useState({
    id: "",
    deal_name: "",
    investment_total: "",
    distribution_total: "",
    status: "Active",
  });

  // Fetch all investments
  const loadInvestments = async () => {
    try {
      const data = await getInvestments();
      setInvestments(data || []);
    } catch (err) {
      console.error("Failed to fetch investments", err);
      setToast("❌ Failed to load investments");
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !newInvestment.id ||
      !newInvestment.deal_name ||
      !newInvestment.investment_total
    ) {
      setToast("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await addInvestment({
        ...newInvestment,
        investment_total: parseFloat(newInvestment.investment_total),
        distribution_total: parseFloat(newInvestment.distribution_total || 0),
      });

      setToast("✅ Investment added successfully");
      setIsModalOpen(false);
      setNewInvestment({
        id: "",
        deal_name: "",
        investment_total: "",
        distribution_total: "",
        status: "Active",
      });
      await loadInvestments();
    } catch (err) {
      console.error("Add investment failed", err);
      setToast("❌ Failed to add investment");
    } finally {
      setLoading(false);
      setTimeout(() => setToast(""), 2500);
    }
  };

  // Search filter
  const filtered = investments.filter((i) => {
    const q = search.toLowerCase();
    return (
      (i.deal_name || "").toLowerCase().includes(q) ||
      (i.status || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {toast && (
        <div className="border rounded-md px-3 py-2 text-sm bg-blue-50 border-blue-200 text-blue-800">
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Investments</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your active and closed deals.</p>
      </div>

      {/* Search + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search investments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 border rounded-md px-4 py-2 text-sm hover:bg-gray-50">
            <Filter size={16} /> Filters
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 border rounded-md px-4 py-2 text-sm hover:bg-gray-50"
          >
            <PlusCircle size={16} /> Add Investment
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Deal name</th>
              <th className="px-4 py-3 text-left">Investment total</th>
              <th className="px-4 py-3 text-left">Distribution total</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{inv.id}</td>
                <td className="px-4 py-3">{inv.deal_name}</td>
                <td className="px-4 py-3">${inv.investment_total?.toLocaleString()}</td>
                <td className="px-4 py-3">${inv.distribution_total?.toLocaleString()}</td>
                <td className="px-4 py-3">{inv.status}</td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-gray-500 text-center">
                  No investments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Investment Modal */}
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
              Add New Investment
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment ID
                </label>
                <input
                  type="number"
                  value={newInvestment.id}
                  onChange={(e) =>
                    setNewInvestment({ ...newInvestment, id: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal Name
                </label>
                <input
                  type="text"
                  value={newInvestment.deal_name}
                  onChange={(e) =>
                    setNewInvestment({
                      ...newInvestment,
                      deal_name: e.target.value,
                    })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Total ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newInvestment.investment_total}
                  onChange={(e) =>
                    setNewInvestment({
                      ...newInvestment,
                      investment_total: e.target.value,
                    })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distribution Total ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newInvestment.distribution_total}
                  onChange={(e) =>
                    setNewInvestment({
                      ...newInvestment,
                      distribution_total: e.target.value,
                    })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newInvestment.status}
                  onChange={(e) =>
                    setNewInvestment({
                      ...newInvestment,
                      status: e.target.value,
                    })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option>Active</option>
                  <option>Closed</option>
                  <option>Pending</option>
                </select>
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
                  {loading ? "Saving..." : "Add Investment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
