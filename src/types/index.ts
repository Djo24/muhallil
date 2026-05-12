export interface AnalysisResult {
  documentType: string;
  oneSentenceSummary: string;
  executiveSummary: string;
  detailedSummary: { section: string; point: string }[];
  decisionsRequired: string[];
  dates: { date: string; context: string; urgency: string }[];
  financials: { amount: string; currency: string; context: string }[];
  people: { name: string; role: string; organization: string }[];
  risks: { type: string; section: string; description: string; severity: "low" | "medium" | "high" }[];
}

export interface DocumentWithAnalysis {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileType: string;
  fileUrl: string | null;
  status: string;
  documentType: string | null;
  oneSentenceSummary: string | null;
  executiveSummary: string | null;
  detailedSummary: AnalysisResult["detailedSummary"] | null;
  decisionsRequired: string[] | null;
  dates: AnalysisResult["dates"] | null;
  financials: AnalysisResult["financials"] | null;
  people: AnalysisResult["people"] | null;
  risks: AnalysisResult["risks"] | null;
  rawText: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  plan: string;
  documentsUsed: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/png",
  "image/jpeg",
];
export const MAX_FILE_SIZE = 25 * 1024 * 1024;
