/**
 * Persistent lead storage via Netlify Blobs.
 *
 * Netlify Blobs works automatically when deployed on Netlify — no environment
 * variables or external services required. The runtime context is injected by
 * the Netlify infrastructure.
 *
 * For local development, run `netlify dev` to get the Blobs context, or use
 * the Netlify CLI (`npm install -g netlify-cli`).
 *
 * TO MIGRATE: Replace getStore calls with your preferred database client.
 */
import { getStore } from "@netlify/blobs";
import type { Lead, LeadStatus } from "@/types/lead";

const STORE_NAME = "needitz-leads";

function store() {
  return getStore(STORE_NAME);
}

/** Persist a new or updated lead. */
export async function saveLead(lead: Lead): Promise<void> {
  await store().set(lead.id, JSON.stringify(lead));
}

/** Retrieve a single lead by its UUID. Returns null if not found. */
export async function getLead(id: string): Promise<Lead | null> {
  const raw = await store().get(id, { type: "json" });
  return (raw as Lead) ?? null;
}

/** Return all leads sorted newest-first. */
export async function getAllLeads(): Promise<Lead[]> {
  const { blobs } = await store().list();

  if (blobs.length === 0) return [];

  const leads = await Promise.all(
    blobs.map(async (b) => {
      const raw = await store().get(b.key, { type: "json" });
      return raw as Lead | null;
    })
  );

  return (leads.filter(Boolean) as Lead[]).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Partially update a lead. Always refreshes updatedAt. */
export async function updateLead(
  id: string,
  patch: Partial<Pick<Lead, "status" | "isViewed" | "internalNotes">>
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
