export type RequestStatus =
  | "new"
  | "reviewing"
  | "needs_information"
  | "potential_match"
  | "accepted"
  | "not_a_fit"
  | "closed";

export type RequestPriority = "normal" | "high" | "urgent";

export interface RequestRow {
  id: string;
  request_number: string;
  item_request: string;
  budget: string;
  budget_numeric: number | null;
  deadline: string | null;
  deadline_is_flexible: boolean;
  delivery_location: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string | null;
  additional_details: string | null;
  confirmed_legitimate: boolean;
  agreed_to_terms: boolean;
  status: RequestStatus;
  priority: RequestPriority;
  ai_summary: string | null;
  ai_score: number | null;
  ai_category: string | null;
  ai_clarity_score: number | null;
  ai_seriousness_score: number | null;
  ai_profitability_score: number | null;
  ai_risk_flags: string[] | null;
  ai_recommended_questions: string[] | null;
  ai_recommendation: "pursue" | "manually_review" | "not_a_fit" | null;
  fallback_score: number | null;
  admin_notes: string | null;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  blocked: boolean;
  created_at: string;
  updated_at: string;
  viewed_at: string | null;
}

export interface ContactRow {
  id: string;
  full_name: string;
  email: string;
  message: string;
  request_id_ref: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      requests: {
        Row: RequestRow;
        Insert: Omit<RequestRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<RequestRow, "id" | "created_at">>;
      };
      contact_messages: {
        Row: ContactRow;
        Insert: Omit<ContactRow, "id" | "created_at">;
        Update: Partial<Omit<ContactRow, "id" | "created_at">>;
      };
    };
  };
}
