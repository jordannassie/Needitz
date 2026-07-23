export type AiRecommendation =
  | "strong_opportunity"
  | "worth_investigating"
  | "needs_more_information"
  | "low_potential"
  | "decline"
  | "restricted";

export type AiDecision = "go" | "conditional_go" | "hold" | "no_go" | "decline";
export type RiskSeverity = "low" | "medium" | "high" | "critical";
export type SourcingDifficulty = "easy" | "moderate" | "difficult" | "unknown";
export type SupplierConfidence = "high" | "medium" | "low";
export type VerificationStatus =
  | "public_source_found"
  | "requires_verification"
  | "possible_match_only";
export type AiReportStatus = "not_started" | "researching" | "completed" | "failed";

export interface AiSupplier {
  name: string;
  domain: string;
  companyType: string;
  location: string | null;
  relevance: string;
  apparentOffering: string;
  confidence: SupplierConfidence;
  verificationStatus: VerificationStatus;
  sourceUrl: string;
  addedBy: "ai_research" | "manual";
  // manual-only fields
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  manualNotes?: string;
  manualStatus?: string;
}

export interface AiRisk {
  risk: string;
  severity: RiskSeverity;
  explanation: string;
  mitigation: string;
}

export interface AiCitation {
  title: string;
  url: string;
  publisher: string | null;
  supports: string;
}

export interface ResearchChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface AiOpportunityReport {
  generatedAt: string;
  model: string;
  researchPerformed: boolean;
  executiveSummary: string;
  opportunityScore: number;
  recommendation: AiRecommendation;
  recommendationReason: string;
  ratings: {
    buyerSeriousness: number;
    requestClarity: number;
    budgetCredibility: number;
    deadlineFeasibility: number;
    sourcingFeasibility: number;
    profitPotential: number;
    fraudRisk: number;
    legalComplexity: number;
    logisticsComplexity: number;
  };
  budgetAnalysis: {
    statedBudget: string;
    estimatedMarketRange: string | null;
    budgetAssessment: string;
    likelyAdditionalCosts: string[];
    marginAssessment: string;
    assumptions: string[];
  };
  revenueScenarios: {
    twoPercentFee: string;
    fivePercentFee: string;
    tenPercentFee: string;
    fixedFeeSuggestion: string | null;
    estimatedGrossProfitRange: string | null;
    disclaimer: string;
  };
  researchSummary: string;
  sourcingDifficulty: SourcingDifficulty;
  suppliers: AiSupplier[];
  recommendedSourcingStrategy: string;
  buyerQuestions: string[];
  buyerVerificationSteps: string[];
  supplierVerificationSteps: string[];
  risks: AiRisk[];
  legalAndRegulatoryNotes: string[];
  nextSteps: string[];
  decision: AiDecision;
  decisionReason: string;
  mostImportantNextAction: string;
  recommendedResearchTimeLimit: string;
  decisionChangingInformation: string[];
  citations: AiCitation[];
  // Draft follow-up message generated alongside the report
  draftFollowUpMessage: string;
}
