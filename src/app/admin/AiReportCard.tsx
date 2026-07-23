"use client";

import { useState, useEffect, useCallback } from "react";
import type { Lead } from "@/types/lead";
import type { AiOpportunityReport, AiSupplier, ResearchChecklistItem } from "@/types/aiReport";

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────

const ANALYZING_MESSAGES = [
  "Reviewing request details…",
  "Researching current market…",
  "Looking for potential suppliers…",
  "Evaluating budget and margin…",
  "Building next-step plan…",
  "Checking regulatory considerations…",
  "Assessing risk factors…",
  "Finalizing report…",
];

// ─────────────────────────────────────────────────────────────────
// Badge helpers
// ─────────────────────────────────────────────────────────────────

function recommendationLabel(r: AiOpportunityReport["recommendation"]): string {
  const map: Record<AiOpportunityReport["recommendation"], string> = {
    strong_opportunity: "Strong Opportunity",
    worth_investigating: "Worth Investigating",
    needs_more_information: "Needs More Information",
    low_potential: "Low Potential",
    decline: "Decline",
    restricted: "Restricted Request",
  };
  return map[r];
}

function recommendationClass(r: AiOpportunityReport["recommendation"]): string {
  const map: Record<AiOpportunityReport["recommendation"], string> = {
    strong_opportunity: "bg-green-100 text-green-800 border-green-200",
    worth_investigating: "bg-yellow-100 text-yellow-800 border-yellow-200",
    needs_more_information: "bg-gray-100 text-gray-700 border-gray-200",
    low_potential: "bg-orange-100 text-orange-800 border-orange-200",
    decline: "bg-red-100 text-red-800 border-red-200",
    restricted: "bg-red-100 text-red-800 border-red-200",
  };
  return map[r];
}

function decisionLabel(d: AiOpportunityReport["decision"]): string {
  const map: Record<AiOpportunityReport["decision"], string> = {
    go: "GO",
    conditional_go: "CONDITIONAL GO",
    hold: "HOLD",
    no_go: "NO-GO",
    decline: "DECLINE",
  };
  return map[d];
}

function decisionClass(d: AiOpportunityReport["decision"]): string {
  const map: Record<AiOpportunityReport["decision"], string> = {
    go: "bg-green-600 text-white",
    conditional_go: "bg-yellow-400 text-yellow-900",
    hold: "bg-amber-400 text-amber-900",
    no_go: "bg-orange-500 text-white",
    decline: "bg-red-600 text-white",
  };
  return map[d];
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-green-700";
  if (score >= 50) return "text-yellow-600";
  if (score >= 30) return "text-orange-600";
  return "text-red-600";
}

function scoreRingColor(score: number): string {
  if (score >= 70) return "border-green-400";
  if (score >= 50) return "border-yellow-400";
  if (score >= 30) return "border-orange-400";
  return "border-red-400";
}

function severityClass(s: string): string {
  const map: Record<string, string> = {
    low: "bg-blue-100 text-blue-700",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };
  return map[s] ?? "bg-gray-100 text-gray-700";
}

function sourcingClass(d: string): string {
  const map: Record<string, string> = {
    easy: "text-green-700",
    moderate: "text-yellow-700",
    difficult: "text-red-700",
    unknown: "text-gray-500",
  };
  return map[d] ?? "text-gray-500";
}

// ─────────────────────────────────────────────────────────────────
// Collapsible Section
// ─────────────────────────────────────────────────────────────────

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between py-3 px-1 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <span className="text-gray-400 text-xs ml-2">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="pb-4 px-1">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Rating Bar
// ─────────────────────────────────────────────────────────────────

function RatingBar({ label, value, invertColor = false }: { label: string; value: number; invertColor?: boolean }) {
  const pct = (value / 10) * 100;
  const barColor = invertColor
    ? value >= 7 ? "bg-red-400" : value >= 4 ? "bg-yellow-400" : "bg-green-400"
    : value >= 7 ? "bg-green-400" : value >= 4 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs text-gray-600 w-36 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-700 w-6 text-right">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Supplier Card
// ─────────────────────────────────────────────────────────────────

function SupplierCard({ supplier }: { supplier: AiSupplier }) {
  const isManual = supplier.addedBy === "manual";
  const badgeClass = isManual
    ? "bg-blue-100 text-blue-700 border-blue-200"
    : "bg-purple-100 text-purple-700 border-purple-200";
  const badgeText = isManual ? "Manually Added" : "AI Research Lead";

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white mb-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{supplier.name}</span>
            <span className={`text-xs border rounded-full px-2 py-0.5 ${badgeClass}`}>
              {badgeText}
            </span>
            <span className="text-xs text-gray-500 capitalize">{supplier.confidence} confidence</span>
          </div>
          {supplier.domain && (
            <a
              href={supplier.sourceUrl || `https://${supplier.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              {supplier.domain}
            </a>
          )}
          <p className="text-xs text-gray-600 mt-1">{supplier.relevance}</p>
          {supplier.apparentOffering && (
            <p className="text-xs text-gray-500 mt-0.5">{supplier.apparentOffering}</p>
          )}
          {supplier.location && (
            <p className="text-xs text-gray-400 mt-0.5">📍 {supplier.location}</p>
          )}
          {isManual && (
            <div className="mt-2 space-y-0.5">
              {supplier.contactName && <p className="text-xs text-gray-600">Contact: {supplier.contactName}</p>}
              {supplier.contactPhone && (
                <a href={`tel:${supplier.contactPhone}`} className="text-xs text-blue-600 hover:underline block">
                  {supplier.contactPhone}
                </a>
              )}
              {supplier.contactEmail && (
                <a href={`mailto:${supplier.contactEmail}`} className="text-xs text-blue-600 hover:underline block">
                  {supplier.contactEmail}
                </a>
              )}
              {supplier.manualNotes && <p className="text-xs text-gray-500 italic">{supplier.manualNotes}</p>}
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
            {supplier.companyType}
          </span>
        </div>
      </div>
      {!isManual && supplier.sourceUrl && (
        <a
          href={supplier.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline mt-1 block truncate"
        >
          Source: {supplier.sourceUrl}
        </a>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Manual Supplier Form
// ─────────────────────────────────────────────────────────────────

interface ManualSupplierFormProps {
  leadId: string;
  onAdded: (updated: Lead) => void;
}

function ManualSupplierForm({ leadId, onAdded }: ManualSupplierFormProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", domain: "", companyType: "unknown",
    location: "", relevance: "", apparentOffering: "",
    confidence: "medium" as "high" | "medium" | "low",
    contactName: "", contactPhone: "", contactEmail: "",
    manualNotes: "", manualStatus: "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addManualSupplier: {
            ...form,
            addedBy: "manual",
            verificationStatus: "requires_verification",
            sourceUrl: form.domain ? `https://${form.domain}` : "",
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onAdded(data.lead);
        setOpen(false);
        setForm({ name: "", domain: "", companyType: "unknown", location: "", relevance: "", apparentOffering: "", confidence: "medium", contactName: "", contactPhone: "", contactEmail: "", manualNotes: "", manualStatus: "" });
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-xs border border-dashed border-gray-300 rounded-lg px-3 py-2 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors w-full text-left"
      >
        + Add Supplier Manually
      </button>
    );
  }

  const field = (label: string, key: string, placeholder = "", required = false) => (
    <div>
      <label className="text-xs text-gray-500 block mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        value={(form as Record<string, string>)[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-yellow-400"
      />
    </div>
  );

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 mt-2">
      <p className="text-xs font-semibold text-gray-700 mb-2">Add Supplier Manually</p>
      <div className="grid grid-cols-2 gap-2">
        {field("Company Name", "name", "Acme Corp", true)}
        {field("Website", "domain", "acmecorp.com")}
        {field("Location", "location", "Chicago, IL")}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Type</label>
          <select
            value={form.companyType}
            onChange={(e) => set("companyType", e.target.value)}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-yellow-400 bg-white"
          >
            {["manufacturer", "distributor", "dealer", "broker", "rental", "marketplace", "unknown"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        {field("Contact Name", "contactName")}
        {field("Contact Phone", "contactPhone")}
        {field("Contact Email", "contactEmail")}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Confidence</label>
          <select
            value={form.confidence}
            onChange={(e) => set("confidence", e.target.value)}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-yellow-400 bg-white"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      <div className="mt-2">
        <label className="text-xs text-gray-500 block mb-1">Notes</label>
        <textarea
          value={form.manualNotes}
          onChange={(e) => set("manualNotes", e.target.value)}
          rows={2}
          className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-yellow-400 resize-none"
        />
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSubmit}
          disabled={saving || !form.name.trim()}
          className="flex-1 bg-gray-900 text-white text-xs rounded px-3 py-1.5 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Add Supplier"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Research Checklist
// ─────────────────────────────────────────────────────────────────

function ResearchChecklist({
  leadId,
  items,
  onUpdate,
}: {
  leadId: string;
  items: ResearchChecklistItem[];
  onUpdate: (updated: Lead) => void;
}) {
  const [saving, setSaving] = useState(false);

  const toggle = async (itemId: string) => {
    const updated = items.map((it) =>
      it.id === itemId ? { ...it, completed: !it.completed } : it
    );
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ researchChecklist: updated }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.lead);
      }
    } finally {
      setSaving(false);
    }
  };

  if (items.length === 0) {
    return <p className="text-xs text-gray-400">No checklist yet. Generate a report to auto-populate next steps.</p>;
  }

  const done = items.filter((i) => i.completed).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{done}/{items.length} completed</span>
        {saving && <span className="text-xs text-gray-400">Saving…</span>}
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <label key={item.id} className="flex items-start gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggle(item.id)}
              className="mt-0.5 accent-yellow-400 flex-shrink-0"
            />
            <span className={`text-xs ${item.completed ? "line-through text-gray-400" : "text-gray-700"} group-hover:text-gray-900 transition-colors`}>
              {item.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Draft Message
// ─────────────────────────────────────────────────────────────────

function DraftMessage({
  message,
  buyerEmail,
  buyerName,
}: {
  message: string;
  buyerEmail: string;
  buyerName: string;
}) {
  const [text, setText] = useState(message);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const emailHref = `mailto:${buyerEmail}?subject=${encodeURIComponent(`Re: Your Needitx Request`)}&body=${encodeURIComponent(text)}`;

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className="w-full border border-gray-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-yellow-400 resize-y font-sans leading-relaxed"
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={copy}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded px-3 py-2 transition-colors"
        >
          {copied ? "Copied!" : "Copy Message"}
        </button>
        <a
          href={emailHref}
          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-xs rounded px-3 py-2 transition-colors text-center"
        >
          Email {buyerName.split(" ")[0]}
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Report Feedback
// ─────────────────────────────────────────────────────────────────

function ReportFeedback({
  leadId,
  current,
  onUpdate,
}: {
  leadId: string;
  current: Lead["reportFeedback"];
  onUpdate: (updated: Lead) => void;
}) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (feedback: "helpful" | "not_helpful") => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportFeedback: feedback, reportFeedbackNote: note || null }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.lead);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-gray-100">
      <p className="text-xs text-gray-500 mb-2">Was this report helpful?</p>
      <div className="flex gap-2">
        <button
          onClick={() => submit("helpful")}
          disabled={saving}
          className={`text-xs px-3 py-1.5 rounded border transition-colors ${
            current === "helpful"
              ? "bg-green-100 text-green-700 border-green-300"
              : "border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700"
          }`}
        >
          👍 Helpful
        </button>
        <button
          onClick={() => submit("not_helpful")}
          disabled={saving}
          className={`text-xs px-3 py-1.5 rounded border transition-colors ${
            current === "not_helpful"
              ? "bg-red-100 text-red-700 border-red-300"
              : "border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-700"
          }`}
        >
          👎 Not Helpful
        </button>
      </div>
      {!current && (
        <div className="mt-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note…"
            rows={2}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-yellow-400 resize-none"
          />
        </div>
      )}
      {current && (
        <p className="text-xs text-gray-400 mt-1">
          Marked as {current === "helpful" ? "helpful ✓" : "not helpful"}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Full Report View
// ─────────────────────────────────────────────────────────────────

function ReportView({
  report,
  lead,
  onRefresh,
  onLeadUpdate,
}: {
  report: AiOpportunityReport;
  lead: Lead;
  onRefresh: () => void;
  onLeadUpdate: (updated: Lead) => void;
}) {
  const [confirmRefresh, setConfirmRefresh] = useState(false);
  const [copyQDone, setCopyQDone] = useState(false);

  const copyQuestions = async () => {
    const text = report.buyerQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopyQDone(true);
    setTimeout(() => setCopyQDone(false), 2000);
  };

  const allSuppliers: AiSupplier[] = [
    ...report.suppliers,
    ...(lead.manualSuppliers ?? []),
  ];

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Score ring */}
          <div className={`w-16 h-16 rounded-full border-4 ${scoreRingColor(report.opportunityScore)} flex items-center justify-center flex-shrink-0`}>
            <span className={`text-xl font-bold ${scoreColor(report.opportunityScore)}`}>
              {report.opportunityScore}
            </span>
          </div>
          <div>
            <span className={`inline-block text-xs font-semibold border rounded-full px-2.5 py-1 mb-1 ${recommendationClass(report.recommendation)}`}>
              {recommendationLabel(report.recommendation)}
            </span>
            <br />
            <span className={`inline-block text-xs font-bold rounded px-2.5 py-1 ${decisionClass(report.decision)}`}>
              {decisionLabel(report.decision)}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-gray-400">
            {new Date(report.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{" "}
            {new Date(report.generatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </p>
          {report.researchPerformed ? (
            <p className="text-xs text-green-600 mt-0.5">✓ Web research included</p>
          ) : (
            <p className="text-xs text-amber-600 mt-0.5">⚠ No live web research</p>
          )}
          {confirmRefresh ? (
            <div className="mt-2 flex flex-col items-end gap-1">
              <p className="text-xs text-gray-600">Refresh using current internet research?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setConfirmRefresh(false); onRefresh(); }}
                  className="text-xs bg-yellow-400 text-yellow-900 px-2.5 py-1 rounded font-semibold hover:bg-yellow-500"
                >
                  Refresh
                </button>
                <button onClick={() => setConfirmRefresh(false)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRefresh(true)}
              className="mt-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              Refresh Research
            </button>
          )}
        </div>
      </div>

      {/* Sections */}
      <Section title="Executive Summary" defaultOpen>
        <p className="text-sm text-gray-700 leading-relaxed">{report.executiveSummary}</p>
        <p className="text-xs text-gray-500 mt-2 italic">{report.recommendationReason}</p>
      </Section>

      <Section title="Request Quality Ratings">
        <div className="space-y-1 mt-1">
          <RatingBar label="Buyer Seriousness" value={report.ratings.buyerSeriousness} />
          <RatingBar label="Request Clarity" value={report.ratings.requestClarity} />
          <RatingBar label="Budget Credibility" value={report.ratings.budgetCredibility} />
          <RatingBar label="Deadline Feasibility" value={report.ratings.deadlineFeasibility} />
          <RatingBar label="Sourcing Feasibility" value={report.ratings.sourcingFeasibility} />
          <RatingBar label="Profit Potential" value={report.ratings.profitPotential} />
          <RatingBar label="Fraud Risk ↑=worse" value={report.ratings.fraudRisk} invertColor />
          <RatingBar label="Legal Complexity ↑=more" value={report.ratings.legalComplexity} invertColor />
          <RatingBar label="Logistics Complexity ↑=more" value={report.ratings.logisticsComplexity} invertColor />
        </div>
      </Section>

      <Section title="Budget & Revenue Estimates">
        <div className="text-xs space-y-2">
          <p><span className="font-semibold text-gray-700">Stated Budget:</span> {report.budgetAnalysis.statedBudget}</p>
          {report.budgetAnalysis.estimatedMarketRange && (
            <p><span className="font-semibold text-gray-700">Market Range:</span> {report.budgetAnalysis.estimatedMarketRange}</p>
          )}
          <p className="text-gray-600">{report.budgetAnalysis.budgetAssessment}</p>
          {report.budgetAnalysis.likelyAdditionalCosts.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">Likely Additional Costs:</p>
              <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                {report.budgetAnalysis.likelyAdditionalCosts.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}
          <p><span className="font-semibold text-gray-700">Margin Assessment:</span> {report.budgetAnalysis.marginAssessment}</p>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-semibold text-gray-700 mb-2">Needitx Revenue Scenarios (Preliminary)</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="text-gray-600">2% fee:</span><span className="font-medium">{report.revenueScenarios.twoPercentFee}</span>
              <span className="text-gray-600">5% fee:</span><span className="font-medium">{report.revenueScenarios.fivePercentFee}</span>
              <span className="text-gray-600">10% fee:</span><span className="font-medium">{report.revenueScenarios.tenPercentFee}</span>
              {report.revenueScenarios.fixedFeeSuggestion && (
                <><span className="text-gray-600">Fixed fee:</span><span className="font-medium">{report.revenueScenarios.fixedFeeSuggestion}</span></>
              )}
              {report.revenueScenarios.estimatedGrossProfitRange && (
                <><span className="text-gray-600">Gross profit est.:</span><span className="font-medium">{report.revenueScenarios.estimatedGrossProfitRange}</span></>
              )}
            </div>
            <p className="text-gray-400 text-xs mt-2 italic">{report.revenueScenarios.disclaimer}</p>
          </div>
        </div>
      </Section>

      <Section title={`Internet Research & Potential Suppliers (${allSuppliers.length})`}>
        <p className="text-xs text-gray-700 mb-3 leading-relaxed">{report.researchSummary}</p>
        <p className="text-xs mb-3">
          Sourcing difficulty:{" "}
          <span className={`font-semibold capitalize ${sourcingClass(report.sourcingDifficulty)}`}>
            {report.sourcingDifficulty}
          </span>
        </p>
        {allSuppliers.length > 0 && (
          <>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-3 leading-snug">
              ⚠ Potential suppliers are research leads only. Needitx must independently verify the company, inventory, authority to sell, pricing, references, legal status, and payment terms.
            </p>
            {allSuppliers.map((s, i) => <SupplierCard key={`${s.name}-${i}`} supplier={s} />)}
          </>
        )}
        <ManualSupplierForm leadId={lead.id} onAdded={onLeadUpdate} />
      </Section>

      <Section title="Best Sourcing Strategy">
        <p className="text-xs text-gray-700 leading-relaxed">{report.recommendedSourcingStrategy}</p>
      </Section>

      <Section title="Required Buyer Questions">
        <div className="mb-2">
          <button
            onClick={copyQuestions}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-1.5 transition-colors"
          >
            {copyQDone ? "Copied!" : "Copy Questions"}
          </button>
        </div>
        <ol className="list-decimal list-inside space-y-1.5">
          {report.buyerQuestions.map((q, i) => (
            <li key={i} className="text-xs text-gray-700 leading-relaxed">{q}</li>
          ))}
        </ol>
      </Section>

      <Section title="Draft Follow-Up Message">
        <DraftMessage
          message={report.draftFollowUpMessage}
          buyerEmail={lead.email}
          buyerName={lead.fullName}
        />
      </Section>

      <Section title="Verification Plans">
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-700 mb-1">Buyer Verification</p>
          <ul className="list-disc list-inside space-y-1">
            {report.buyerVerificationSteps.map((s, i) => (
              <li key={i} className="text-xs text-gray-600">{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1">Supplier Verification</p>
          <ul className="list-disc list-inside space-y-1">
            {report.supplierVerificationSteps.map((s, i) => (
              <li key={i} className="text-xs text-gray-600">{s}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title={`Risk Flags (${report.risks.length})`}>
        <div className="space-y-2">
          {report.risks.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0 capitalize ${severityClass(r.severity)}`}>
                {r.severity}
              </span>
              <div>
                <p className="text-xs font-semibold text-gray-800">{r.risk}</p>
                <p className="text-xs text-gray-600">{r.explanation}</p>
                <p className="text-xs text-gray-400 italic">Mitigation: {r.mitigation}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Legal & Regulatory Notes">
        <ul className="space-y-1">
          {report.legalAndRegulatoryNotes.map((n, i) => (
            <li key={i} className="text-xs text-gray-700 leading-relaxed">• {n}</li>
          ))}
        </ul>
        <p className="text-xs text-gray-400 italic mt-2 leading-snug">
          This is a preliminary operational review, not legal, tax, financial, or compliance advice. Consult qualified professionals when required.
        </p>
      </Section>

      <Section title="Research Checklist" defaultOpen>
        <ResearchChecklist
          leadId={lead.id}
          items={lead.researchChecklist ?? []}
          onUpdate={onLeadUpdate}
        />
      </Section>

      <Section title="Exact Next Steps" defaultOpen>
        <ol className="list-decimal list-inside space-y-1.5">
          {report.nextSteps.map((s, i) => (
            <li key={i} className="text-xs text-gray-700 leading-relaxed">{s}</li>
          ))}
        </ol>
        <div className={`mt-4 p-3 rounded-lg ${decisionClass(report.decision)}`}>
          <p className="text-sm font-bold mb-1">Final Decision: {decisionLabel(report.decision)}</p>
          <p className="text-xs leading-relaxed opacity-90">{report.decisionReason}</p>
          <p className="text-xs mt-2 font-semibold">Most Important Next Action:</p>
          <p className="text-xs opacity-90">{report.mostImportantNextAction}</p>
          <p className="text-xs mt-2">Time limit: {report.recommendedResearchTimeLimit}</p>
          {report.decisionChangingInformation.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold">What could change this decision:</p>
              <ul className="mt-1 space-y-0.5">
                {report.decisionChangingInformation.map((info, i) => (
                  <li key={i} className="text-xs opacity-90">• {info}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {report.citations.length > 0 && (
        <Section title={`Sources (${report.citations.length})`}>
          <div className="space-y-2">
            {report.citations.map((c, i) => (
              <div key={i} className="text-xs">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  {c.title}
                </a>
                {c.publisher && <span className="text-gray-500 ml-1">— {c.publisher}</span>}
                <p className="text-gray-400 text-xs">{c.supports}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <ReportFeedback
        leadId={lead.id}
        current={lead.reportFeedback}
        onUpdate={onLeadUpdate}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Export: AiReportCard
// ─────────────────────────────────────────────────────────────────

interface AiReportCardProps {
  lead: Lead;
  onLeadUpdate: (updated: Lead) => void;
}

export function AiReportCard({ lead, onLeadUpdate }: AiReportCardProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [noApiKey, setNoApiKey] = useState(false);

  // Detect if currently analyzing (server marked it as researching but no completed report yet)
  const isResearching = lead.aiReportStatus === "researching" && !lead.aiReport;

  // Rotate status messages while analyzing
  useEffect(() => {
    if (!analyzing && !isResearching) return;
    const interval = setInterval(() => {
      setStatusIdx((i) => (i + 1) % ANALYZING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [analyzing, isResearching]);

  const runAnalysis = useCallback(async () => {
    setAnalyzing(true);
    setError(null);
    setNoApiKey(false);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/analyze`, { method: "POST" });
      const data = await res.json();
      if (res.status === 503) {
        setNoApiKey(true);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Analysis failed. Please try again.");
        return;
      }
      onLeadUpdate(data.lead);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }, [lead.id, onLeadUpdate]);

  const report = lead.aiReport as AiOpportunityReport | null;
  const isBusy = analyzing || isResearching;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Card header with yellow accent */}
      <div className="border-l-4 border-yellow-400 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">AI Opportunity Report</span>
          {report && (
            <span className="text-xs text-gray-400">v{lead.aiReportVersion}</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Powered by {lead.aiReportModel ?? "GPT-4o"} — Admin only, not shared with buyers
        </p>
      </div>

      <div className="p-4">
        {/* No API key configured */}
        {noApiKey && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            OpenAI analysis is unavailable because OPENAI_API_KEY is not configured on Netlify.
          </div>
        )}

        {/* Analyzing state */}
        {isBusy && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600 font-medium">{ANALYZING_MESSAGES[statusIdx]}</p>
            <p className="text-xs text-gray-400">This may take 30–60 seconds</p>
          </div>
        )}

        {/* No report yet */}
        {!isBusy && !report && !noApiKey && (
          <div className="py-6 text-center">
            <p className="text-sm text-gray-500 mb-4">AI analysis has not been generated yet.</p>
            <button
              onClick={runAnalysis}
              className="bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Research This Request
            </button>
            {error && (
              <div className="mt-3">
                <p className="text-xs text-red-600">{error}</p>
                <button
                  onClick={runAnalysis}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Previous failure — show error + retry, but also show existing report if any */}
        {!isBusy && lead.aiReportStatus === "failed" && !report && !noApiKey && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 mb-4">
            Analysis failed.{" "}
            {lead.aiReportError && <span className="block mt-1 text-red-500">{lead.aiReportError}</span>}
            <button
              onClick={runAnalysis}
              className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded transition-colors"
            >
              Retry Analysis
            </button>
          </div>
        )}

        {/* Refresh failure notice */}
        {!isBusy && lead.aiReportStatus === "failed" && report && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-700 mb-3">
            Refresh failed. Showing the previous report.
            <button
              onClick={runAnalysis}
              className="ml-2 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Report */}
        {!isBusy && report && (
          <ReportView
            report={report}
            lead={lead}
            onRefresh={runAnalysis}
            onLeadUpdate={onLeadUpdate}
          />
        )}
      </div>
    </div>
  );
}
