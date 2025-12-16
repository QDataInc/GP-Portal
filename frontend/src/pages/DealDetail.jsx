import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDealById, showInterest } from "../api/deals";

export default function DealDetail() {
  const { dealId } = useParams();
  const [deal, setDeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [interest, setInterest] = useState(null);
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadDeal() {
      try {
        setIsLoading(true);
        setError("");
        const data = await getDealById(dealId);
        if (!mounted) return;
        setDeal(data);
      } catch (e) {
        if (!mounted) return;
        setError("Unable to load deal.");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    }

    loadDeal();
    return () => {
      mounted = false;
    };
  }, [dealId]);

  async function handleShowInterest() {
    try {
      setIsSubmittingInterest(true);
      const res = await showInterest(dealId);
      setInterest(res);
    } catch (e) {
      setError("Unable to submit interest.");
    } finally {
      setIsSubmittingInterest(false);
    }
  }

  if (isLoading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!deal) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{deal.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {deal.deal_type} {deal.deal_subtype ? `• ${deal.deal_subtype}` : ""} {deal.deal_stage ? `• ${deal.deal_stage}` : ""}
        </p>
      </div>

      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-2">
        <div className="text-sm text-gray-500">Sponsor</div>
        <div className="text-gray-800">{deal.sponsors || "-"}</div>

        <div className="text-sm text-gray-500 mt-3">Offering Size</div>
        <div className="text-gray-800">{deal.offering_size ?? "-"}</div>

        <div className="text-sm text-gray-500 mt-3">Unit Price</div>
        <div className="text-gray-800">{deal.unit_price ?? "-"}</div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleShowInterest}
          disabled={isSubmittingInterest || !!interest}
          className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
        >
          {interest ? "Interest Submitted" : isSubmittingInterest ? "Submitting..." : "Show Interest"}
        </button>
      </div>

      {interest && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-sm">
          Your interest has been recorded. Next step: funding instructions + required documents will appear here in Phase 3.
        </div>
      )}
    </div>
  );
}
