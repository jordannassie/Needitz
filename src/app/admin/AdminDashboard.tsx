"use client";

import { useEffect, useState, useCallback } from "react";
import type { RequestRow, RequestStatus, RequestPriority } from "@/types/database";
import {
  LogOut,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  FlaskConical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MOCK_REQUESTS } from "@/lib/mockRequests";

const STATUS_OPTIONS: { value: RequestStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "needs_information", label: "Needs Info" },
  { value: "potential_match", label: "Potential Match" },
  { value: "accepted", label: "Accepted" },
  { value: "not_a_fit", label: "Not a Fit" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_OPTIONS: { value: RequestPriority | "all"; label: string }[] = [
  { value: "all", label: "All Priorities" },
  { value: "urgent", label: "🔴 Urgent" },
  { value: "high", label: "🟡 High" },
  { value: "normal", label: "⚪ Normal" },
];

interface AdminDashboardProps {
  isPreview: boolean;
}

export function AdminDashboard({ isPreview }: AdminDashboardProps) {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<RequestPriority | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  // ─── DATA LOADING ──────────────────────────────────────────────────────────
  // PREVIEW MODE: Uses static mock data from src/lib/mockRequests.ts
  // PRODUCTION:   Fetches from /api/admin/requests with cookie session auth
  // TO CONNECT:   Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
  // ──────────────────────────────────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    setLoading(true);

    if (isPreview) {
      // Simulate a brief load for realism
      await new Promise((r) => setTimeout(r, 300));
      setRequests(MOCK_REQUESTS);
      setLoading(false);
      return;
    }

    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (priorityFilter !== "all") params.set("priority", priorityFilter);
    try {
      const res = await fetch(`/api/admin/requests?${params}`);
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = (await res.json()) as { requests?: RequestRow[] };
      setRequests(data.requests ?? []);
    } catch {
      // noop
    }
    setLoading(false);
  }, [isPreview, statusFilter, priorityFilter, router]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Client-side filter for preview mode (mock data is always the full set)
  const filteredRequests = isPreview
    ? requests.filter((r) => {
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (priorityFilter !== "all" && r.priority !== priorityFilter) return false;
        return true;
      })
    : requests;

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  async function updateRequest(id: string, patch: Partial<RequestRow>) {
    if (isPreview) {
      // In preview mode, update local state only
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
      return;
    }
    await fetch(`/api/admin/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  const newCount = filteredRequests.filter((r) => !r.viewed_at).length;
  const hasPassword = typeof window !== "undefined"
    ? false // can't read env on client; logout button only shown in production
    : false;

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Admin header */}
      <header className="bg-white border-b border-[#D8D8D8] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-[#050505]">NeedItz</span>
            <span className="text-xs font-bold text-[#9A9DA5] border border-[#D8D8D8] rounded-full px-2 py-0.5">
              Admin
            </span>
            {isPreview && (
              <span className="flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                <FlaskConical size={11} />
                Preview Data
              </span>
            )}
            {newCount > 0 && (
              <span className="text-xs font-bold bg-[#FFC400] text-[#050505] rounded-full px-2 py-0.5">
                {newCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchRequests}
              className="p-2 text-[#5E6168] hover:text-[#050505] transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            {!isPreview && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#5E6168] hover:text-[#050505] transition-colors"
              >
                <LogOut size={15} />
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Preview banner */}
      {isPreview && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-2">
            <FlaskConical size={15} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700">
              <strong>Preview mode.</strong> Showing sample requests. Connect Supabase and set{" "}
              <code className="text-xs bg-amber-100 px-1 rounded">ADMIN_PASSWORD</code> to enable live data and authentication.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-5 py-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex flex-wrap gap-1 bg-white border border-[#D8D8D8] rounded-xl p-1">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value as RequestStatus | "all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === opt.value
                    ? "bg-[#050505] text-white"
                    : "text-[#5E6168] hover:text-[#050505]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as RequestPriority | "all")
            }
            className="bg-white border border-[#D8D8D8] rounded-xl px-3 py-2 text-xs font-bold text-[#050505] focus:outline-none focus:border-[#FFC400]"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#9A9DA5]">Loading…</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 text-[#9A9DA5]">No requests found.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredRequests.map((req) => (
              <RequestCard
                key={req.id}
                req={req}
                expanded={expandedId === req.id}
                onToggle={() =>
                  setExpandedId(expandedId === req.id ? null : req.id)
                }
                onUpdate={(patch) => updateRequest(req.id, patch)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Suppress unused var warning */}
      <span className="hidden">{String(hasPassword)}</span>
    </div>
  );
}

interface RequestCardProps {
  req: RequestRow;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<RequestRow>) => void;
}

function RequestCard({ req, expanded, onToggle, onUpdate }: RequestCardProps) {
  const [notes, setNotes] = useState(req.admin_notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);

  const isNew = !req.viewed_at;
  const priorityColor =
    req.priority === "urgent"
      ? "bg-red-100 text-red-700"
      : req.priority === "high"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-[#F7F7F7] text-[#5E6168]";

  async function saveNotes() {
    setSavingNotes(true);
    await onUpdate({ admin_notes: notes });
    setSavingNotes(false);
  }

  function handleMarkViewed() {
    if (!req.viewed_at) {
      onUpdate({ viewed_at: new Date().toISOString() });
    }
  }

  return (
    <div
      className={`bg-white rounded-2xl border transition-all ${
        isNew ? "border-[#FFC400]" : "border-[#D8D8D8]"
      }`}
    >
      {/* Card header */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer select-none"
        onClick={() => {
          onToggle();
          handleMarkViewed();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onToggle();
            handleMarkViewed();
          }
        }}
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {isNew && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFC400] text-[#050505] rounded-full px-2 py-0.5">
                NEW
              </span>
            )}
            <span
              className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${priorityColor}`}
            >
              {req.priority}
            </span>
            <span className="text-xs font-mono text-[#9A9DA5]">
              {req.request_number}
            </span>
          </div>
          <p className="font-bold text-[#050505] text-sm leading-snug truncate">
            {req.item_request}
          </p>
          <p className="text-xs text-[#5E6168] mt-0.5">
            {req.full_name}
            {req.company_name ? ` · ${req.company_name}` : ""} · {req.budget} ·{" "}
            {req.delivery_location}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusBadge status={req.status} />
          <span className="text-[10px] text-[#9A9DA5]">
            {new Date(req.created_at).toLocaleDateString()}
          </span>
          {expanded ? (
            <ChevronUp size={14} className="text-[#9A9DA5]" />
          ) : (
            <ChevronDown size={14} className="text-[#9A9DA5]" />
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[#D8D8D8] px-4 py-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <Detail label="Email" value={req.email} />
            <Detail label="Phone" value={req.phone} />
            <Detail label="Company" value={req.company_name ?? "—"} />
            <Detail
              label="Budget"
              value={
                req.budget +
                (req.budget_numeric
                  ? ` (~$${req.budget_numeric.toLocaleString()})`
                  : "")
              }
            />
            <Detail
              label="Deadline"
              value={
                req.deadline_is_flexible ? "Flexible" : req.deadline ?? "—"
              }
            />
            <Detail label="Location" value={req.delivery_location} />
            <Detail
              label="Score"
              value={
                req.ai_score != null
                  ? `${req.ai_score}/10 (AI)`
                  : req.fallback_score != null
                  ? `${req.fallback_score}/10 (fallback)`
                  : "—"
              }
            />
            <Detail label="Source" value={req.source ?? "—"} />
            <Detail
              label="Received"
              value={new Date(req.created_at).toLocaleString()}
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5] mb-1">
              Request
            </p>
            <p className="text-sm text-[#050505] leading-relaxed bg-[#F7F7F7] rounded-xl p-3">
              {req.item_request}
            </p>
          </div>

          {req.additional_details && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5] mb-1">
                Additional Details
              </p>
              <p className="text-sm text-[#5E6168] leading-relaxed">
                {req.additional_details}
              </p>
            </div>
          )}

          {(req.ai_summary || req.fallback_score != null) && (
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-2">
                {req.ai_summary ? "AI Review" : "Fallback Score"}
              </p>
              {req.ai_summary && (
                <p className="text-sm text-[#050505] leading-relaxed mb-2">
                  {req.ai_summary}
                </p>
              )}
              {req.ai_recommendation && (
                <p className="text-xs text-[#5E6168]">
                  Recommendation:{" "}
                  <strong>{req.ai_recommendation.replace(/_/g, " ")}</strong>
                </p>
              )}
              {req.ai_risk_flags && req.ai_risk_flags.length > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  <AlertCircle size={12} className="inline mr-1" />
                  Flags: {req.ai_risk_flags.join(", ")}
                </p>
              )}
              {req.ai_recommended_questions &&
                req.ai_recommended_questions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-bold text-[#5E6168] mb-1">
                      Suggested questions:
                    </p>
                    <ul className="text-xs text-[#5E6168] list-disc pl-4 space-y-0.5">
                      {req.ai_recommended_questions.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {/* Status + Priority controls */}
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5]">
                Status
              </label>
              <select
                value={req.status}
                onChange={(e) =>
                  onUpdate({ status: e.target.value as RequestStatus })
                }
                className="border border-[#D8D8D8] rounded-lg px-3 py-2 text-sm text-[#050505] bg-white focus:outline-none focus:border-[#FFC400]"
              >
                {(
                  [
                    "new",
                    "reviewing",
                    "needs_information",
                    "potential_match",
                    "accepted",
                    "not_a_fit",
                    "closed",
                  ] as RequestStatus[]
                ).map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5]">
                Priority
              </label>
              <select
                value={req.priority}
                onChange={(e) =>
                  onUpdate({ priority: e.target.value as RequestPriority })
                }
                className="border border-[#D8D8D8] rounded-lg px-3 py-2 text-sm text-[#050505] bg-white focus:outline-none focus:border-[#FFC400]"
              >
                {(["normal", "high", "urgent"] as RequestPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Internal notes */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5]">
              Internal Notes
            </label>
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

function StatusBadge({ status }: { status: RequestStatus }) {
  const styles: Record<
    RequestStatus,
    { color: string; icon: React.ReactNode }
  > = {
    new: { color: "bg-[#FFC400] text-[#050505]", icon: <Clock size={10} /> },
    reviewing: {
      color: "bg-blue-100 text-blue-700",
      icon: <RefreshCw size={10} />,
    },
    needs_information: {
      color: "bg-orange-100 text-orange-700",
      icon: <AlertCircle size={10} />,
    },
    potential_match: {
      color: "bg-purple-100 text-purple-700",
      icon: <CheckCircle2 size={10} />,
    },
    accepted: {
      color: "bg-green-100 text-green-700",
      icon: <CheckCircle2 size={10} />,
    },
    not_a_fit: {
      color: "bg-gray-100 text-gray-500",
      icon: <XCircle size={10} />,
    },
    closed: {
      color: "bg-gray-100 text-gray-400",
      icon: <XCircle size={10} />,
    },
  };
  const s = styles[status];
  return (
    <span
      className={`flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 ${s.color}`}
    >
      {s.icon}
      {status.replace(/_/g, " ")}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5] mb-0.5">
        {label}
      </p>
      <p className="text-sm text-[#050505] break-words">{value}</p>
    </div>
  );
}
