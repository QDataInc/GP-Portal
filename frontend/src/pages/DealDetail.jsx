import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getDealById, showInterest } from "../api/deals";
import { uploadDocument } from "../api/documents"; // ✅ make sure this exists in your project

const REQUIRED_DOCS = [
  { key: "LLC", label: "LLC formation documents" },
  { key: "EIN", label: "EIN Document" },
  { key: "VOID_CHECK", label: "Bank Account details / Void check" },
];

export default function DealDetail() {
  const { dealId } = useParams();

  const [deal, setDeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [interest, setInterest] = useState(null);
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);

  // Phase 3: upload state (Void check)
  const [voidCheckFile, setVoidCheckFile] = useState(null);
  const [isUploadingVoidCheck, setIsUploadingVoidCheck] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadErr, setUploadErr] = useState("");

  // Phase 3: doc checklist state (we'll store locally for now)
  // Later we will replace this with backend-based status.
  const [docStatus, setDocStatus] = useState({
    LLC: false,
    EIN: false,
    VOID_CHECK: false,
  });

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

  const fundingText = useMemo(() => {
    const txt = (deal?.funding_instructions || "").trim();
    if (txt) return txt;

    // fallback placeholder so UI doesn't look empty
    return `Funding instructions have not been added yet.
Please contact the admin team for bank details.`;
  }, [deal]);

  async function handleShowInterest() {
    try {
      setIsSubmittingInterest(true);
      setError("");
      const res = await showInterest(dealId);
      setInterest(res);
    } catch (e) {
      setError("Unable to submit interest.");
    } finally {
      setIsSubmittingInterest(false);
    }
  }

  function onPickVoidCheckFile(e) {
    const file = e.target.files?.[0] || null;
    setVoidCheckFile(file);
    setUploadMsg("");
    setUploadErr("");
  }

  async function handleUploadVoidCheck() {
    if (!voidCheckFile) {
      setUploadErr("Please choose a PDF or image file first.");
      return;
    }

    try {
      setIsUploadingVoidCheck(true);
      setUploadErr("");
      setUploadMsg("");

      // IMPORTANT:
      // This assumes your backend /api/documents/upload accepts:
      // - file
      // - document_label OR document_type
      // - deal_id (optional, but recommended)
      //
      // If your backend uses different field names, tell me what they are
      // (or paste your documents router), and I’ll adjust this.

      await uploadDocument({
        file: voidCheckFile,
        document_label: "VOID_CHECK",
        deal_id: Number(dealId),
      });

      setUploadMsg("Void check uploaded successfully.");
      setDocStatus((prev) => ({ ...prev, VOID_CHECK: true }));
      setVoidCheckFile(null);

      // reset file input visually
      const input = document.getElementById("voidCheckFileInput");
      if (input) input.value = "";
    } catch (e) {
      console.error("Void check upload error:", e);
      setUploadErr("Unable to upload void check. Please try again.");
    } finally {
      setIsUploadingVoidCheck(false);
    }
  }

  function renderDocRow(doc) {
    const isDone = docStatus[doc.key] === true;

    return (
      <div
        key={doc.key}
        className="flex items-center justify-between border rounded-lg px-4 py-3"
      >
        <div className="flex flex-col">
          <div className="font-medium text-gray-800">{doc.label}</div>
          <div className="text-xs text-gray-500">
            {isDone ? "Uploaded" : "Missing - please upload"}
          </div>
        </div>

        <div>
          {isDone ? (
            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
              Completed
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
              Required
            </span>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!deal) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{deal.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {deal.deal_type}
          {deal.deal_subtype ? ` • ${deal.deal_subtype}` : ""}
          {deal.deal_stage ? ` • ${deal.deal_stage}` : ""}
        </p>
      </div>

      {/* Deal details */}
      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-2">
        <div className="text-sm text-gray-500">Sponsor</div>
        <div className="text-gray-800">{deal.sponsors || "-"}</div>

        <div className="text-sm text-gray-500 mt-3">Offering Size</div>
        <div className="text-gray-800">{deal.offering_size ?? "-"}</div>

        <div className="text-sm text-gray-500 mt-3">Unit Price</div>
        <div className="text-gray-800">{deal.unit_price ?? "-"}</div>
      </div>

      {/* Interest action */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleShowInterest}
          disabled={isSubmittingInterest || !!interest}
          className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
        >
          {interest
            ? "Interest Submitted"
            : isSubmittingInterest
            ? "Submitting..."
            : "Show Interest"}
        </button>
      </div>

      {/* After interest: Funding + Required Docs */}
      {interest && (
        <div className="space-y-6">
          {/* Funding Instructions */}
          <div className="bg-white border rounded-xl p-5 shadow-sm space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">
              Funding Instructions
            </h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {fundingText}
            </p>
          </div>

          {/* Required Documents Checklist */}
          <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Required Documents
            </h2>

            <div className="space-y-3">
              {REQUIRED_DOCS.map(renderDocRow)}
            </div>

            {/* Upload Void Check (Phase 3 - option 1) */}
            <div className="border-t pt-4 space-y-3">
              <div className="text-sm font-semibold text-gray-800">
                Upload Void Check (PDF or Image)
              </div>

              <input
                id="voidCheckFileInput"
                type="file"
                accept="application/pdf,image/*"
                onChange={onPickVoidCheckFile}
                className="block text-sm"
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={handleUploadVoidCheck}
                  disabled={isUploadingVoidCheck || !voidCheckFile}
                  className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isUploadingVoidCheck ? "Uploading..." : "Upload Void Check"}
                </button>

                {voidCheckFile && (
                  <div className="text-xs text-gray-600">
                    Selected: {voidCheckFile.name}
                  </div>
                )}
              </div>

              {uploadMsg && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                  {uploadMsg}
                </div>
              )}
              {uploadErr && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  {uploadErr}
                </div>
              )}
            </div>
          </div>

          {/* Friendly reminder box */}
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-xl p-4 text-sm">
            If any required documents are missing, please upload them to avoid delays.
            We will keep reminding you until all 3 are uploaded.
          </div>
        </div>
      )}
    </div>
  );
}
