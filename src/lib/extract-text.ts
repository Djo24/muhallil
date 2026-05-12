export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "text/plain") {
    return buffer.toString("utf-8");
  }

  if (file.type === "application/pdf") {
    try {
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(buffer);
      const text = pdfData.text || "";
      if (text.trim().length < 50) {
        return `[PDF file: ${file.name} - Pages: ${pdfData.numpages || "?"}, Limited text extracted: ${text.trim().substring(0, 200)}]`;
      }
      return text;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown error";
      return `[PDF: ${file.name}] Extraction error: ${msg}. File size: ${(file.size / 1024).toFixed(1)}KB.`;
    }
  }

  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    try {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
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

export async function extractTextFromUrl(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("text") || contentType.includes("json") || contentType.includes("html") || contentType.includes("xml")) {
      const text = await response.text();
      if (text.trim().length < 50) {
        return `[URL: ${url}] Content too short or empty.`;
      }
      return text;
    }

    if (contentType.includes("pdf")) {
      return `[URL: ${url}] PDF detected. Download and upload the file directly for analysis.`;
    }

    return `[URL: ${url}] Unsupported content type: ${contentType}.`;
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Request timed out after 15 seconds");
    }
    throw new Error(`Failed to extract text from URL: ${e instanceof Error ? e.message : "Unknown error"}`);
  }
}
