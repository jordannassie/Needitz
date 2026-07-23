import type { AiOpportunityReport, AiReportStatus, AiSupplier, ResearchChecklistItem } from "./aiReport";

export type LeadStatus =
  | "new"
  | "reviewing"
  | "contacted"
  | "potential"
  | "not_a_fit"
  | "closed";

export interface Lead {
  id: string;
  requestId: string;
  itemRequest: string;
  budget: string;
  deadline: string | null;
  deadlineIsFlexible: boolean;
  deliveryLocation: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  additionalDetails: string;
  status: LeadStatus;
  isViewed: boolean;
  createdAt: string;
  updatedAt: string;
  internalNotes: string;

  // AI Opportunity Report
  aiReport: AiOpportunityReport | null;
  aiReportGeneratedAt: string | null;
  aiReportModel: string | null;
  aiReportStatus: AiReportStatus;
  aiReportError: string | null;
  aiReportVersion: number;

  // Manually added suppliers (separate from AI suppliers)
  manualSuppliers: AiSupplier[];

  // Research checklist (next steps the admin can check off)
  researchChecklist: ResearchChecklistItem[];

  // Report feedback
  reportFeedback: "helpful" | "not_helpful" | null;
  reportFeedbackNote: string | null;
}

// Safe defaults for new leads (no AI fields required at creation)
export function defaultLeadExtensions(): Pick<
  Lead,
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
> {
  return {
    aiReport: null,
    aiReportGeneratedAt: null,
    aiReportModel: null,
    aiReportStatus: "not_started",
    aiReportError: null,
    aiReportVersion: 0,
    manualSuppliers: [],
    researchChecklist: [],
    reportFeedback: null,
    reportFeedbackNote: null,
  };
}
