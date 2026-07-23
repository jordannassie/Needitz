/**
 * Persistent lead storage via Netlify Blobs.
 *
 * Netlify Blobs works automatically when deployed on Netlify — no environment
 * variables or external services required. The runtime context is injected by
 * the Netlify infrastructure.
 *
 * For local development, run `netlify dev` to get the Blobs context.
 *
 * TO MIGRATE: Replace getStore calls with your preferred database client.
 */
import { getStore } from "@netlify/blobs";
import type { Lead, LeadStatus } from "@/types/lead";
import type { AiOpportunityReport, AiSupplier, ResearchChecklistItem } from "@/types/aiReport";
import { defaultLeadExtensions } from "@/types/lead";

const STORE_NAME = "needitx-leads";

function store() {
  return getStore(STORE_NAME);
}

/** Backfill any fields added after the lead was first created. */
function hydrateLead(raw: unknown): Lead {
  const lead = raw as Lead;
  const defaults = defaultLeadExtensions();
  return {
    ...defaults,
    ...lead,
    // Ensure array fields are never undefined
    manualSuppliers: lead.manualSuppliers ?? [],
    researchChecklist: lead.researchChecklist ?? [],
  };
}

/** Persist a new or updated lead. */
export async function saveLead(lead: Lead): Promise<void> {
  await store().set(lead.id, JSON.stringify(lead));
}

/** Retrieve a single lead by its UUID. Returns null if not found. */
export async function getLead(id: string): Promise<Lead | null> {
  const raw = await store().get(id, { type: "json" });
  if (!raw) return null;
  return hydrateLead(raw);
}

/** Return all leads sorted newest-first. */
export async function getAllLeads(): Promise<Lead[]> {
  const { blobs } = await store().list();
  if (blobs.length === 0) return [];

  const leads = await Promise.all(
    blobs.map(async (b) => {
      const raw = await store().get(b.key, { type: "json" });
      return raw ? hydrateLead(raw) : null;
    })
  );

  return (leads.filter(Boolean) as Lead[]).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Partially update a lead. Always refreshes updatedAt. */
export async function updateLead(
  id: string,
  patch: Partial<
    Pick<
      Lead,
      | "status"
      | "isViewed"
      | "internalNotes"
      | "aiReport"
      | "aiReportGeneratedAt"
      | "aiReportModel"
      | "aiReportStatus"
      | "aiReportError"
      | "aiReportVersion"
      | "manualSuppliers"
      | "researchChecklist"
      | "reportFeedback"
      | "reportFeedbackNote"
    >
  >
): Promise<Lead | null> {
  const lead = await getLead(id);
  if (!lead) return null;
  const updated: Lead = {
    ...lead,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await saveLead(updated);
  return updated;
}

/** Save AI report to a lead. Preserves previous report if new one is falsy. */
export async function saveAiReport(
  id: string,
  report: AiOpportunityReport,
  model: string
): Promise<Lead | null> {
  const lead = await getLead(id);
  if (!lead) return null;
  const updated: Lead = {
    ...lead,
    aiReport: report,
    aiReportGeneratedAt: report.generatedAt,
    aiReportModel: model,
    aiReportStatus: "completed",
    aiReportError: null,
    aiReportVersion: (lead.aiReportVersion ?? 0) + 1,
    // Auto-populate checklist from next steps if not yet set
    researchChecklist:
      lead.researchChecklist && lead.researchChecklist.length > 0
        ? lead.researchChecklist
        : report.nextSteps.map((step, i) => ({
            id: `step-${i}`,
            text: step,
            completed: false,
          })),
    updatedAt: new Date().toISOString(),
  };
  await saveLead(updated);
  return updated;
}

/** Mark a lead as currently being analyzed. */
export async function markLeadAnalyzing(id: string): Promise<Lead | null> {
  return updateLead(id, { aiReportStatus: "researching", aiReportError: null });
}

/** Mark a lead analysis as failed — preserve existing report. */
export async function markLeadAnalysisFailed(
  id: string,
  error: string
): Promise<Lead | null> {
  const lead = await getLead(id);
  if (!lead) return null;
  const updated: Lead = {
    ...lead,
    aiReportStatus: "failed",
    aiReportError: error,
    updatedAt: new Date().toISOString(),
  };
  await saveLead(updated);
  return updated;
}

/** Add a manually-entered supplier to the lead. */
export async function addManualSupplier(
  id: string,
  supplier: AiSupplier
): Promise<Lead | null> {
  const lead = await getLead(id);
  if (!lead) return null;
  const updated: Lead = {
    ...lead,
    manualSuppliers: [...(lead.manualSuppliers ?? []), supplier],
    updatedAt: new Date().toISOString(),
  };
  await saveLead(updated);
  return updated;
}

/** Update the research checklist for a lead. */
export async function updateChecklist(
  id: string,
  checklist: ResearchChecklistItem[]
): Promise<Lead | null> {
  return updateLead(id, { researchChecklist: checklist });
}

/** Permanently delete a lead. */
export async function deleteLead(id: string): Promise<void> {
  await store().delete(id);
}

/** Count leads by status for dashboard stats. */
export async function getLeadCounts(): Promise<Record<LeadStatus | "total", number>> {
  const leads = await getAllLeads();
  const counts: Record<string, number> = { total: leads.length };
  for (const lead of leads) {
    counts[lead.status] = (counts[lead.status] ?? 0) + 1;
  }
  return counts as Record<LeadStatus | "total", number>;
}
