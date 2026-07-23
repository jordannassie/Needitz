"use client";

import { useEffect, useState, useCallback } from "react";
import type { Lead, LeadStatus } from "@/types/lead";
import {
  LogOut,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Trash2,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  contacted: "Contacted",
  potential: "Potential",
  not_a_fit: "Not a Fit",
  closed: "Closed",
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-[#FFC400] text-[#050505]",
  reviewing: "bg-blue-100 text-blue-700",
  contacted: "bg-purple-100 text-purple-700",
  potential: "bg-green-100 text-green-700",
  not_a_fit: "bg-gray-100 text-gray-500",
  closed: "bg-gray-100 text-gray-400",
};

type FilterOption = LeadStatus | "all";

const FILTERS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "contacted", label: "Contacted" },
  { value: "potential", label: "Potential" },
  { value: "not_a_fit", label: "Not a Fit" },
  { value: "closed", label: "Closed" },
];

export function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/admin/leads");
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { leads?: Lead[] };
      setLeads(data.leads ?? []);
    } catch {
      setLoadError("Unable to load leads. Please refresh and try again.");
    }
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  async function patchLead(id: string, patch: Partial<Lead>) {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const { lead } = (await res.json()) as { lead: Lead };
        setLeads((prev) => prev.map((l) => (l.id === id ? lead : l)));
      }
    } catch { /* noop */ }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this lead permanently?")) return;
    try {
      await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch { /* noop */ }
  }

  const visible = filter === "all" ? leads : leads.filter((l) => l.status === filter);
  const newCount = leads.filter((l) => !l.isViewed).length;
  const reviewingCount = leads.filter((l) => l.status === "reviewing").length;
  const closedCount = leads.filter((l) => l.status === "closed").length;

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white border-b border-[#D8D8D8] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-[#050505]">NeedItz</span>
            <span className="text-xs font-bold text-[#9A9DA5] border border-[#D8D8D8] rounded-full px-2 py-0.5">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchLeads} className="p-2 text-[#5E6168] hover:text-[#050505] transition-colors" aria-label="Refresh">
              <RefreshCw size={16} />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-semibold text-[#5E6168] hover:text-[#050505] transition-colors">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-6 flex flex-col gap-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Leads", value: leads.length },
            { label: "New", value: newCount, highlight: newCount > 0 },
            { label: "Reviewing", value: reviewingCount },
            { label: "Closed", value: closedCount },
          ].map((s) => (
            <div key={s.label} className={`bg-white rounded-xl border px-4 py-3 ${s.highlight ? "border-[#FFC400]" : "border-[#D8D8D8]"}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5]">{s.label}</p>
              <p className={`text-2xl font-black mt-0.5 ${s.highlight ? "text-[#050505]" : "text-[#050505]"}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1 bg-white border border-[#D8D8D8] rounded-xl p-1 w-fit">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f.value ? "bg-[#050505] text-white" : "text-[#5E6168] hover:text-[#050505]"}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-center py-16 text-[#9A9DA5]">Loading…</p>
        ) : loadError ? (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{loadError}</p>
          </div>
        ) : visible.length === 0 ? (
          <p className="text-center py-16 text-[#9A9DA5]">
            {filter === "all" ? "No leads yet. Submit your first request to see it here." : `No leads with status "${filter}".`}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                expanded={expandedId === lead.id}
                onToggle={() => {
                  const opening = expandedId !== lead.id;
                  setExpandedId(opening ? lead.id : null);
                  if (opening && !lead.isViewed) patchLead(lead.id, { isViewed: true });
                }}
                onPatch={(patch) => patchLead(lead.id, patch)}
                onDelete={() => handleDelete(lead.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface LeadCardProps {
  lead: Lead;
  expanded: boolean;
  onToggle: () => void;
  onPatch: (patch: Partial<Lead>) => void;
  onDelete: () => void;
}

function LeadCard({ lead, expanded, onToggle, onPatch, onDelete }: LeadCardProps) {
  const [notes, setNotes] = useState(lead.internalNotes);
  const [savingNotes, setSavingNotes] = useState(false);

  async function saveNotes() {
    setSavingNotes(true);
    onPatch({ internalNotes: notes });
    // Optimistically assume success; real update happens in parent
    await new Promise((r) => setTimeout(r, 300));
    setSavingNotes(false);
  }

  const isNew = !lead.isViewed;

  return (
    <div className={`bg-white rounded-2xl border transition-all ${isNew ? "border-[#FFC400]" : "border-[#D8D8D8]"}`}>
      {/* Row summary */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer select-none"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onToggle(); }}
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {isNew && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFC400] text-[#050505] rounded-full px-2 py-0.5">NEW</span>
            )}
            <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${STATUS_COLORS[lead.status]}`}>
              {STATUS_LABELS[lead.status]}
            </span>
            <span className="text-xs font-mono text-[#9A9DA5]">{lead.requestId}</span>
          </div>
          <p className="font-bold text-[#050505] text-sm leading-snug truncate">{lead.itemRequest}</p>
          <p className="text-xs text-[#5E6168] mt-0.5">
            {lead.fullName}{lead.companyName ? ` · ${lead.companyName}` : ""} · {lead.budget} · {lead.deliveryLocation}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-[10px] text-[#9A9DA5]">
            {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <span className="text-[10px] text-[#9A9DA5]">
            {new Date(lead.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
          {expanded ? <ChevronUp size={14} className="text-[#9A9DA5]" /> : <ChevronDown size={14} className="text-[#9A9DA5]" />}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[#D8D8D8] px-4 py-5 flex flex-col gap-5">
          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Full Name" value={lead.fullName} />
            {lead.companyName && <Detail label="Company" value={lead.companyName} />}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5] mb-0.5">Email</p>
              <a href={`mailto:${lead.email}`} className="text-sm text-[#050505] flex items-center gap-1 hover:text-[#FFC400] transition-colors">
                <Mail size={12} className="shrink-0" />{lead.email}
              </a>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5] mb-0.5">Phone</p>
              <a href={`tel:${lead.phone}`} className="text-sm text-[#050505] flex items-center gap-1 hover:text-[#FFC400] transition-colors">
                <Phone size={12} className="shrink-0" />{lead.phone}
              </a>
            </div>
          </div>

          {/* Request */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5] mb-1">Request</p>
            <p className="text-sm text-[#050505] leading-relaxed bg-[#F7F7F7] rounded-xl p-3">{lead.itemRequest}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Detail label="Budget" value={lead.budget} />
            <Detail label="Deadline" value={lead.deadlineIsFlexible ? "Flexible" : (lead.deadline ?? "—")} />
            <Detail label="Delivery" value={lead.deliveryLocation} />
          </div>

          {lead.additionalDetails && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5] mb-1">Additional Details</p>
              <p className="text-sm text-[#5E6168] leading-relaxed">{lead.additionalDetails}</p>
            </div>
          )}

          {/* Status */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5]">Status</label>
              <select
                value={lead.status}
                onChange={(e) => onPatch({ status: e.target.value as LeadStatus })}
                className="border border-[#D8D8D8] rounded-lg px-3 py-2 text-sm text-[#050505] bg-white focus:outline-none focus:border-[#FFC400]"
              >
                {(Object.entries(STATUS_LABELS) as [LeadStatus, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50"
            >
              <Trash2 size={14} />
              Delete Lead
            </button>
          </div>

          {/* Internal notes */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5]">Internal Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add internal notes…"
              className="w-full border border-[#D8D8D8] rounded-xl px-3 py-2 text-sm text-[#050505] focus:border-[#FFC400] focus:outline-none resize-none"
            />
            <button
              onClick={saveNotes}
              disabled={savingNotes}
              className="self-start text-xs font-bold bg-[#050505] text-white px-4 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
            >
              {savingNotes ? "Saving…" : "Save Notes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5] mb-0.5">{label}</p>
      <p className="text-sm text-[#050505] break-words">{value}</p>
    </div>
  );
}
