import { useEffect, useState } from "react";
import {
  Filter,
  Search,
  ArrowRight,
  ChevronDown,
  Info,
  Download,
} from "lucide-react";
import { getInvestments, getInvestmentSummary } from "../api/investments";
import { getProfiles } from "../api/profiles";
import { useAuth } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function Investments() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("all");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Fetch all investments
  const loadInvestments = async () => {
    try {
      setLoading(true);
      const data = await getInvestments();
      setInvestments(data || []);
    } catch (err) {
      console.error("Failed to fetch investments", err);
      setToast("❌ Failed to load investments");
    } finally {
      setLoading(false);
    }
  };

  // Fetch profiles
  const loadProfiles = async () => {
    try {
      const data = await getProfiles();
      setProfiles(data || []);
    } catch (err) {
      console.error("Failed to fetch profiles", err);
    }
  };

  // Fetch summary
  const loadSummary = async () => {
    try {
      const data = await getInvestmentSummary();
      setSummary(data);
    } catch (err) {
      console.error("Failed to fetch summary", err);
    }
  };

  useEffect(() => {
    loadInvestments();
    loadProfiles();
    loadSummary();
  }, []);

  // Filter investments by Active status only
  const activeInvestments = investments.filter((inv) => inv.status === "Active");

  // Get user's name for display
  const getUserName = () => {
    // First try profile entity_name
    if (user?.entity_name) return user.entity_name;
    
    // Try to get email from JWT
    try {
      const token = sessionStorage.getItem("token");
      if (token) {
        const payloadBase64 = token.split(".")[1];
        const payloadJson = JSON.parse(atob(payloadBase64));
        const email = payloadJson.sub || "";
        // Extract name from email or use email
        if (email) {
          const emailName = email.split("@")[0];
          return emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
      }
    } catch (e) {
      console.error("Failed to decode user name", e);
    }
    return "User";
  };

  const getUserInitials = () => {
    const name = getUserName();
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (name.length >= 2) {
      return name.substring(0, 2).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // Calculate chart data
  const totalContributions = activeInvestments.reduce(
    (sum, inv) => sum + (inv.investment_total || 0),
    0
  );
  const totalDistributions = activeInvestments.reduce(
    (sum, inv) => sum + (inv.distribution_total || 0),
    0
  );

  // Round to nearest 100K for chart max
  const maxValue = Math.max(totalContributions, totalDistributions);
  const chartMax = Math.ceil(maxValue / 100000) * 100000 || 100000;

  const chart1Data = [
    {
      name: "Contributions",
      value: totalContributions,
    },
    {
      name: "Distributions",
      value: totalDistributions,
    },
  ];

  const chart2Data = [
    {
      name: "Committed",
      value: totalContributions,
    },
    {
      name: "Funded",
      value: totalDistributions,
    },
  ];

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return "$0";
    return `$${(value / 1000).toFixed(0)}K`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return "-";
    }
  };

  // Get profile name for investment
  const getProfileName = (uploadedById) => {
    const profile = profiles.find((p) => p.user_id === uploadedById);
    return profile?.entity_name || "-";
  };

  // Search filter
  const filtered = activeInvestments.filter((i) => {
    const q = search.toLowerCase();
    return (
      (i.deal_name || "").toLowerCase().includes(q) ||
      (i.status || "").toLowerCase().includes(q) ||
      getProfileName(i.uploaded_by_id).toLowerCase().includes(q)
    );
  });

  // Calculate totals for table footer
  const totalInvested = filtered.reduce(
    (sum, inv) => sum + (inv.investment_total || 0),
    0
  );
  const totalDistributed = filtered.reduce(
    (sum, inv) => sum + (inv.distribution_total || 0),
    0
  );
  const totalCapitalBalance = filtered.reduce(
    (sum, inv) =>
      sum + ((inv.investment_total || 0) - (inv.distribution_total || 0)),
    0
  );

  return (
    <div className="space-y-6">
      {toast && (
        <div className="border rounded-md px-3 py-2 text-sm bg-blue-50 border-blue-200 text-blue-800">
          {toast}
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 font-medium">Welcome!</p>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-sm">
          <a
            href="#"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            LinkedIn <ArrowRight size={16} />
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-1 relative"
          >
            Updates <ArrowRight size={16} />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              5
            </span>
          </a>
          <div className="flex items-center gap-2">
            <div className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-semibold">
              {getUserInitials()}
            </div>
            <span className="text-gray-700">{getUserName()}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Informational Banner */}
      <div className="bg-blue-600 text-white rounded-lg p-4 flex items-start gap-3">
        <Info size={20} className="mt-0.5 flex-shrink-0" />
        <p className="text-sm">
          You also have investments with other GPs. To see all your investments,{" "}
          <a href="#" className="underline font-semibold">
            switch to Cash Flow Portal
          </a>
          .
        </p>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            All profiles
          </label>
          <select
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 min-w-[200px]"
          >
            <option value="all">All profiles</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.entity_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 border border-blue-600 text-blue-600 rounded-md px-4 py-2 text-sm hover:bg-blue-50">
            <Download size={16} /> Export report
          </button>
          <button className="flex items-center gap-2 border border-blue-600 text-blue-600 rounded-md px-4 py-2 text-sm hover:bg-blue-50">
            <Download size={16} /> Export SREO
          </button>
        </div>
      </div>

      {/* Two Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Contributions vs Distributions */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Active investments
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chart1Data}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[0, chartMax]}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => `$${value.toLocaleString()}`}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chart1Data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#3b82f6" : "#10b981"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Committed vs Funded */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Active investments
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chart2Data}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[0, chartMax]}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => `$${value.toLocaleString()}`}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chart2Data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#3b82f6" : "#10b981"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Investments Table Section */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Active investments
          </h2>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative w-full sm:w-96">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search active investments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">
                  Investment name{" "}
                  <span className="inline-block ml-1">↑</span>
                </th>
                <th className="px-4 py-3 text-left">
                  Offering name{" "}
                  <span className="inline-block ml-1">↑</span>
                </th>
                <th className="px-4 py-3 text-left">
                  Investment profile{" "}
                  <span className="inline-block ml-1">↑</span>
                </th>
                <th className="px-4 py-3 text-left">
                  Invested amount{" "}
                  <span className="inline-block ml-1">↑</span>
                </th>
                <th className="px-4 py-3 text-left">
                  Distributed amount{" "}
                  <span className="inline-block ml-1">↑</span>
                </th>
                <th className="px-4 py-3 text-left">
                  Capital balance{" "}
                  <span className="inline-block ml-1">↑</span>
                </th>
                <th className="px-4 py-3 text-left">
                  Current valuation{" "}
                  <span className="inline-block ml-1">↑</span>
                </th>
                <th className="px-4 py-3 text-left">
                  Deal close date{" "}
                  <span className="inline-block ml-1">↑</span>
                </th>
                <th className="px-4 py-3 text-left">
                  Status{" "}
                  <span className="inline-block ml-1">↑</span>
                </th>
                <th className="px-4 py-3 text-left">
                  Action required{" "}
                  <span className="inline-block ml-1">↑</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-6 text-gray-500 text-center"
                  >
                    {loading
                      ? "Loading investments..."
                      : "No active investments found."}
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const capitalBalance =
                    (inv.investment_total || 0) -
                    (inv.distribution_total || 0);
                  return (
                    <tr
                      key={inv.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3">{inv.deal_name || "-"}</td>
                      <td className="px-4 py-3">-</td>
                      <td className="px-4 py-3">
                        {getProfileName(inv.uploaded_by_id)}
                      </td>
                      <td className="px-4 py-3">
                        ${(inv.investment_total || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        ${(inv.distribution_total || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        ${capitalBalance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">-</td>
                      <td className="px-4 py-3">
                        {formatDate(inv.close_date)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            inv.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : inv.status === "Closed"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">-</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot className="bg-gray-50 border-t font-semibold">
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-right text-gray-700"
                  >
                    Total:
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    ${totalInvested.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    ${totalDistributed.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    ${totalCapitalBalance.toLocaleString()}
                  </td>
                  <td colSpan={4} className="px-4 py-3"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
