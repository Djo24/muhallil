import OpenAI from "openai";

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

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

const SYSTEM_PROMPT = `You are an expert legal and business document analyst. Analyze the provided document text and extract structured information. Return ONLY valid JSON with this exact structure:
{
  "documentType": "string - type of document (e.g. Contract, Invoice, Report, Letter, etc.)",
  "oneSentenceSummary": "string - one sentence summary of the entire document",
  "executiveSummary": "string - 2-3 paragraph executive summary",
  "detailedSummary": [{"section": "string - section heading", "point": "string - key point"}],
  "decisionsRequired": ["string - each decision required from the reader"],
  "dates": [{"date": "string - the date mentioned", "context": "string - what this date refers to", "urgency": "urgent|soon|flexible"}],
  "financials": [{"amount": "string - monetary amount", "currency": "string - currency code", "context": "string - what this financial item is for"}],
  "people": [{"name": "string - person name", "role": "string - their role", "organization": "string - their organization"}],
  "risks": [{"type": "legal|financial|operational|compliance|other", "section": "string - which section", "description": "string - risk description", "severity": "low|medium|high"}]
}

Extract every relevant item. If no items exist for a category, return an empty array. Be thorough and accurate.`;

function sanitizeJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON found in response");
  }
  return text.slice(start, end + 1);
}

export async function analyzeDocument(text: string): Promise<AnalysisResult> {
  if (!text || text.trim().length === 0) {
    throw new Error("No text content to analyze");
  }

  const openai = getOpenAI();
  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Analyze this document:\n\n${text.slice(0, 100000)}` },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const content = aiResponse.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  try {
    const cleaned = sanitizeJson(content);
    const result = JSON.parse(cleaned) as AnalysisResult;
    return validateAnalysis(result);
  } catch (e) {
    throw new Error(`Failed to parse AI response: ${e instanceof Error ? e.message : "Unknown error"}`);
  }
}

function validateAnalysis(result: AnalysisResult): AnalysisResult {
  return {
    documentType: result.documentType || "Unknown",
    oneSentenceSummary: result.oneSentenceSummary || "",
    executiveSummary: result.executiveSummary || "",
    detailedSummary: Array.isArray(result.detailedSummary) ? result.detailedSummary : [],
    decisionsRequired: Array.isArray(result.decisionsRequired) ? result.decisionsRequired : [],
    dates: Array.isArray(result.dates) ? result.dates : [],
    financials: Array.isArray(result.financials) ? result.financials : [],
    people: Array.isArray(result.people) ? result.people : [],
    risks: Array.isArray(result.risks) ? result.risks : [],
  };
}

export async function askDocument(question: string, context: string): Promise<{
  answer: string;
  relevantSections: string[];
}> {
  if (!question.trim()) {
    throw new Error("Question is required");
  }

  const openai = getOpenAI();
  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a document analysis assistant. Answer questions based ONLY on the provided document context. If the answer cannot be found in the document, say so. Reference specific sections when possible. Return JSON: { "answer": "string", "relevantSections": ["string"] }`,
      },
      {
        role: "user",
        content: `Document:\n${context.slice(0, 100000)}\n\nQuestion: ${question}`,
      },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const content = aiResponse.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  try {
    const parsed = JSON.parse(sanitizeJson(content));
    return {
      answer: parsed.answer || "Unable to generate an answer.",
      relevantSections: Array.isArray(parsed.relevantSections) ? parsed.relevantSections : [],
    };
  } catch {
    return { answer: content, relevantSections: [] };
  }
}

export async function summarizeForComparison(text1: string, text2: string): Promise<{
  similarities: string[];
  differences: string[];
}> {
  const openai = getOpenAI();
  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Compare these two documents and find key similarities and differences. Return JSON: { "similarities": ["string"], "differences": ["string"] }`,
      },
      {
        role: "user",
        content: `Document 1:\n${text1.slice(0, 50000)}\n\nDocument 2:\n${text2.slice(0, 50000)}`,
      },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const content = aiResponse.choices[0]?.message?.content;
  if (!content) return { similarities: [], differences: [] };

  try {
    return JSON.parse(sanitizeJson(content));
  } catch {
    return { similarities: [], differences: [] };
  }
}
