import { Search } from "lucide-react";

export default function Deals() {
  const joinedDeals = [
    {
      dealName: "Irving Oaks",
      dealStage: "Asset managing",
      closeDate: "08/17/2023",
      includes: "-",
      sponsors: "Victory Multifamily",
      investmentTotal: "$300,000",
      distributionTotal: "$27,048.30",
      action: "-",
    },
  ];

  const inProgress = [
    {
      offeringName: "New Fund 2025",
      sponsors: "Victory Capital Group",
      amount: "$500,000",
      class: "Class A",
      profile: "QD Wealth Management LLC",
      status: "In review",
      action: "Pending approval",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Deals</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your current and in-progress investments.</p>
      </div>

      {/* Joined Deals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Joined deals</h2>
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search deals..."
              className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Deal name</th>
                <th className="px-4 py-3 text-left">Deal stage</th>
                <th className="px-4 py-3 text-left">Close date</th>
                <th className="px-4 py-3 text-left">Includes investments by</th>
                <th className="px-4 py-3 text-left">Sponsors</th>
                <th className="px-4 py-3 text-left">Investment total</th>
                <th className="px-4 py-3 text-left">Distribution total</th>
                <th className="px-4 py-3 text-left">Action required</th>
              </tr>
            </thead>
            <tbody>
              {joinedDeals.map((deal, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-blue-600 font-medium hover:underline cursor-pointer">
                    {deal.dealName}
                  </td>
                  <td className="px-4 py-3">{deal.dealStage}</td>
                  <td className="px-4 py-3">{deal.closeDate}</td>
                  <td className="px-4 py-3">{deal.includes}</td>
                  <td className="px-4 py-3">{deal.sponsors}</td>
                  <td className="px-4 py-3">{deal.investmentTotal}</td>
                  <td className="px-4 py-3">{deal.distributionTotal}</td>
                  <td className="px-4 py-3">{deal.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-progress Investments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">In-progress investments</h2>
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search investments..."
              className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Offering name</th>
                <th className="px-4 py-3 text-left">Sponsors</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Class</th>
                <th className="px-4 py-3 text-left">Profile</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inProgress.map((inv, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-blue-600 font-medium hover:underline cursor-pointer">
                    {inv.offeringName}
                  </td>
                  <td className="px-4 py-3">{inv.sponsors}</td>
                  <td className="px-4 py-3">{inv.amount}</td>
                  <td className="px-4 py-3">{inv.class}</td>
                  <td className="px-4 py-3">{inv.profile}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-blue-600">{inv.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}