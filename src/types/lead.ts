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
}
