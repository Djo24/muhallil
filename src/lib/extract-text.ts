export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "text/plain") {
    return buffer.toString("utf-8");
  }

  if (file.type === "application/pdf") {
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        const text = result.text || "";
        if (text.trim().length < 50) {
          return `[PDF file: ${file.name} - Pages: ${result.total || "?"}, Limited text extracted: ${text.trim().substring(0, 200)}]`;
        }
        return text;
      } finally {
        await parser.destroy();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown error";
      return `[PDF: ${file.name}] Extraction error: ${msg}. File size: ${(file.size / 1024).toFixed(1)}KB.`;
    }
  }

  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    try {
      const { extractRawText } = await import("mammoth");
      const result = await extractRawText({ buffer });
      const text = result.value || "";
      if (text.trim().length < 50) {
        return `[DOCX file: ${file.name} - Limited text extracted]`;
      }
      return text;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown error";
      return `[DOCX: ${file.name}] Extraction error: ${msg}. File size: ${(file.size / 1024).toFixed(1)}KB.`;
    }
  }

  if (file.type.startsWith("image/")) {
    return `[Image: ${file.name}] OCR not available. For image analysis, upload a PDF or DOCX version. File size: ${(file.size / 1024).toFixed(1)}KB.`;
  }

  throw new Error(`Unsupported file type: ${file.type}`);
}

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
];

function isBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower === "metadata.google.internal" || lower.endsWith(".internal")) return true;
  return PRIVATE_IP_PATTERNS.some((p) => p.test(lower));
}

function validateUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL format");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed");
  }
  if (isBlockedHost(parsed.hostname)) {
    throw new Error("Access to this URL is not allowed");
  }
  return parsed;
}

export async function extractTextFromUrl(url: string): Promise<string> {
  try {
    const parsed = validateUrl(url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(parsed.href, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status}`);

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("text") || contentType.includes("json") || contentType.includes("html") || contentType.includes("xml")) {
      const text = await response.text();
      if (text.trim().length < 50) {
        return `[URL: ${parsed.hostname}] Content too short or empty.`;
      }
      return text;
    }

    if (contentType.includes("pdf")) {
      return `[URL: ${parsed.hostname}] PDF detected. Download and upload the file directly for analysis.`;
    }

    return `[URL: ${parsed.hostname}] Unsupported content type: ${contentType}.`;
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Request timed out after 15 seconds");
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    throw new Error(msg);
  }
}
