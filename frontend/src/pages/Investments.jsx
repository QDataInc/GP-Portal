import { useState } from "react";
import { Info, PlusCircle, Download, FileSpreadsheet } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Investments() {
  // Example dataset for charts
  const contributionData = [
    { name: "Contributions", value: 300000, color: "#2563eb" },
    { name: "Distributions", value: 60000, color: "#22c55e" },
  ];

  const fundingData = [
    { name: "Committed", value: 300000, color: "#2563eb" },
    { name: "Funded", value: 250000, color: "#22c55e" },
  ];

  const [profile, setProfile] = useState("All profiles");

  return (
    <div className="space-y-8">
      {/* Alert banner */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex items-start gap-3">
        <Info size={20} className="mt-0.5 flex-shrink-0" />
        <p className="text-sm">
          You also have investments with other GPs. To see all your investments,{" "}
          <a href="#" className="font-semibold underline hover:text-blue-900">
            switch to Cash Flow Portal
          </a>
          .
        </p>
      </div>

      {/* Profile selector + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <select
          className="border rounded-md px-3 py-2 text-sm text-gray-700 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
        >
          <option>All profiles</option>
          <option>Profile 1</option>
          <option>Profile 2</option>
        </select>

        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 text-sm hover:bg-gray-50">
            <PlusCircle size={16} /> Add investment
          </button>
          <button className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 text-sm hover:bg-gray-50">
            <Download size={16} /> Export report
          </button>
          <button className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 text-sm hover:bg-gray-50">
            <FileSpreadsheet size={16} /> Export SREO
          </button>
        </div>
      </div>

      {/* Active Investments - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contributions vs Distributions */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Active investments</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={contributionData}
              layout="vertical"
              margin={{ left: 50, right: 30, top: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                tickFormatter={(v) => `$${v / 1000}K`}
                stroke="#9ca3af"
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#9ca3af"
                width={100}
              />
              <Tooltip
                formatter={(value) => `$${value.toLocaleString()}`}
                cursor={{ fill: "#f9fafb" }}
              />
              <Bar dataKey="value">
                {contributionData.map((entry, index) => (
                  <cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Committed vs Funded */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Active commitments</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={fundingData}
              layout="vertical"
              margin={{ left: 50, right: 30, top: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                tickFormatter={(v) => `$${v / 1000}K`}
                stroke="#9ca3af"
              />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
              <Tooltip
                formatter={(value) => `$${value.toLocaleString()}`}
                cursor={{ fill: "#f9fafb" }}
              />
              <Bar dataKey="value">
                {fundingData.map((entry, index) => (
                  <cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Investments Table Placeholder */}
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold text-gray-800">Active investments</h2>
          <input
            type="text"
            placeholder="Search active investments..."
            className="border rounded-md px-3 py-1.5 text-sm w-64 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Investment name</th>
                <th className="px-4 py-3 text-left">Offering name</th>
                <th className="px-4 py-3 text-left">Investment profile</th>
                <th className="px-4 py-3 text-left">Invested amount</th>
                <th className="px-4 py-3 text-left">Distributed amount</th>
                <th className="px-4 py-3 text-left">Capital balance</th>
                <th className="px-4 py-3 text-left">Current valuation</th>
                <th className="px-4 py-3 text-left">Deal close date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action required</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">Fund Alpha</td>
                <td className="px-4 py-3">Alpha Capital Partners</td>
                <td className="px-4 py-3">Individual</td>
                <td className="px-4 py-3">$150,000</td>
                <td className="px-4 py-3">$20,000</td>
                <td className="px-4 py-3">$130,000</td>
                <td className="px-4 py-3">$180,000</td>
                <td className="px-4 py-3">06/2025</td>
                <td className="px-4 py-3">Active</td>
                <td className="px-4 py-3 text-blue-600">None</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
