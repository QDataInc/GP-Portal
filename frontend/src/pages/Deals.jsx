import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getDeals } from "../api/deals";
import { useNavigate } from "react-router-dom";

export default function Deals() {
  const navigate = useNavigate(); // ✅ USED

  const [deals, setDeals] = useState([]);
  const [dealsSearch, setDealsSearch] = useState("");
  const [investmentsSearch, setInvestmentsSearch] = useState("");
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);
  const [dealsError, setDealsError] = useState("");

  // Phase 1: Deals are admin-created and visible to all users.
  // Joined deals + in-progress investments will be wired to interest/investment tables in Phase 2+.
  const inProgress = [];

  useEffect(() => {
    let isMounted = true;

    async function loadDeals() {
      try {
        setIsLoadingDeals(true);
        setDealsError("");
        const apiDeals = await getDeals();
        if (!isMounted) return;
        setDeals(Array.isArray(apiDeals) ? apiDeals : []);
      } catch (err) {
        if (!isMounted) return;
        setDealsError("Unable to load deals. Please try again.");
        setDeals([]);
      } finally {
        if (!isMounted) return;
        setIsLoadingDeals(false);
      }
    }

    loadDeals();

    return () => {
      isMounted = false;
    };
  }, []);

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  }

  const joinedDeals = useMemo(() => {
    const search = dealsSearch.trim().toLowerCase();
    return deals
      .filter((d) => {
        if (!search) return true;
        const name = (d.name || "").toLowerCase();
        const sponsor = (d.sponsors || "").toLowerCase();
        const stage = (d.deal_stage || "").toLowerCase();
        return (
          name.includes(search) ||
          sponsor.includes(search) ||
          stage.includes(search)
        );
      })
      .map((d) => ({
        id: d.id,
        dealName: d.name,
        dealStage: d.deal_stage || "-",
        closeDate: formatDate(d.close_date),
        includes: "-",
        sponsors: d.sponsors || "-",
        investmentTotal: "-",
        distributionTotal: "-",
        action: "-",
      }));
  }, [deals, dealsSearch]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Deals</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your current and in-progress investments.
        </p>
      </div>

      {/* Joined Deals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Joined deals
          </h2>
          <div className="relative w-64">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search deals..."
              value={dealsSearch}
              onChange={(e) => setDealsSearch(e.target.value)}
              className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {isLoadingDeals && (
          <div className="text-sm text-gray-500">Loading deals...</div>
        )}

        {!isLoadingDeals && dealsError && (
          <div className="text-sm text-red-600">{dealsError}</div>
        )}

        <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Deal name</th>
                <th className="px-4 py-3 text-left">Deal stage</th>
                <th className="px-4 py-3 text-left">Close date</th>
                <th className="px-4 py-3 text-left">
                  Includes investments by
                </th>
                <th className="px-4 py-3 text-left">Sponsors</th>
                <th className="px-4 py-3 text-left">Investment total</th>
                <th className="px-4 py-3 text-left">
                  Distribution total
                </th>
                <th className="px-4 py-3 text-left">Action required</th>
              </tr>
            </thead>
            <tbody>
              {joinedDeals.map((deal) => (
                <tr key={deal.id} className="border-b hover:bg-gray-50">
                  <td
                    className="px-4 py-3 text-blue-600 font-medium hover:underline cursor-pointer"
                    onClick={() => navigate(`/deals/${deal.id}`)} // ✅ NAVIGATION
                  >
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

              {!isLoadingDeals && !dealsError && joinedDeals.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-4 text-sm text-gray-500"
                    colSpan={8}
                  >
                    No deals available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-progress Investments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            In-progress investments
          </h2>
          <div className="relative w-64">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search investments..."
              value={investmentsSearch}
              onChange={(e) => setInvestmentsSearch(e.target.value)}
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
              {inProgress.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-4 text-sm text-gray-500"
                    colSpan={7}
                  >
                    No in-progress investments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
