import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFileToSupabase } from "@/lib/supabase";
import { analyzeDocument } from "@/lib/analyzer";
import { extractTextFromFile, extractTextFromUrl } from "@/lib/extract-text";
import { checkRateLimit } from "@/lib/rate-limit";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/types";

async function fetchAsFile(url: string, fileName: string, fileType: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download file from storage: ${res.status}`);
  const blob = await res.blob();
  return new File([blob], fileName, { type: fileType });
}

async function analyzeAndSave(text: string, docId: string, userId: string) {
  const analysis = await analyzeDocument(text);
  const [updated] = await Promise.all([
    prisma.document.update({
      where: { id: docId },
      data: {
        status: "completed",
        documentType: analysis.documentType,
        oneSentenceSummary: analysis.oneSentenceSummary,
        executiveSummary: analysis.executiveSummary,
        detailedSummary: analysis.detailedSummary,
        decisionsRequired: analysis.decisionsRequired,
        dates: analysis.dates,
        financials: analysis.financials,
        people: analysis.people,
        risks: analysis.risks,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { documentsUsed: { increment: 1 } },
    }),
  ]);
  return updated;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Document limit reached (${rateLimit.used}/${rateLimit.limit}). Upgrade your plan to continue.` },
        { status: 429 }
      );
    }

    let text: string;
    let fileName: string;
    let fileType: string;
    let fileUrl: string | null = null;

    const contentType = req.headers.get("content-type") || "";

    // --- JSON flow (signed upload or URL) ---
    if (contentType.includes("application/json")) {
      const body = await req.json();

      // URL analysis
      if (body.url) {
        try {
          fileName = new URL(body.url).hostname;
        } catch {
          return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
        }
        fileType = "url";
        text = await extractTextFromUrl(body.url);

        if (text.trim().length < 50) {
          return NextResponse.json({ error: "Could not extract meaningful content from URL" }, { status: 400 });
        }

        const doc = await prisma.document.create({
          data: {
            userId: session.user.id,
            title: fileName,
            fileName: body.url,
            fileType: "url",
            rawText: text,
            status: "processing",
          },
        });

        try {
          const updated = await analyzeAndSave(text, doc.id, session.user.id);
          return NextResponse.json(updated);
        } catch (analysisErr) {
          console.error("Analysis failed:", analysisErr);
          await prisma.document.update({
            where: { id: doc.id },
            data: { status: "failed" },
          });
          return NextResponse.json(
            { error: "AI analysis failed. Please try again." },
            { status: 500 }
          );
        }
      }

      // Signed upload flow (file already in Supabase Storage)
      const { signedPath, publicUrl, name, type } = body;
      if (!signedPath || !publicUrl || !name || !type) {
        return NextResponse.json({ error: "Missing signedPath, publicUrl, name, or type" }, { status: 400 });
      }
      if (!ALLOWED_FILE_TYPES.includes(type)) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
      }

      fileName = name;
      fileType = type;
      fileUrl = publicUrl;

      const file = await fetchAsFile(publicUrl, name, type);
      text = await extractTextFromFile(file);

      const doc = await prisma.document.create({
        data: {
          userId: session.user.id,
          title: fileName.replace(/\.[^/.]+$/, ""),
          fileName,
          fileType,
          fileUrl,
          rawText: text,
          status: "processing",
        },
      });

      try {
        const updated = await analyzeAndSave(text, doc.id, session.user.id);
        return NextResponse.json(updated);
      } catch (analysisErr) {
        console.error("Analysis failed:", analysisErr);
        await prisma.document.update({
          where: { id: doc.id },
          data: { status: "failed" },
        });
        return NextResponse.json(
          { error: "AI analysis failed. Please try again." },
          { status: 500 }
        );
      }
    }

    // --- Direct file upload flow ---
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;

    if (!file && !url) {
      return NextResponse.json({ error: "No file or URL provided" }, { status: 400 });
    }

    if (file) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json({ error: "Invalid file type. Accepted: PDF, DOCX, TXT, PNG, JPG" }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File exceeds 25MB limit" }, { status: 400 });
      }

      fileName = file.name;
      fileType = file.type;
      text = await extractTextFromFile(file);

      const doc = await prisma.document.create({
        data: {
          userId: session.user.id,
          title: fileName.replace(/\.[^/.]+$/, ""),
          fileName,
          fileType,
          rawText: text,
          status: "uploading",
        },
      });

      try {
        fileUrl = await uploadFileToSupabase(file, session.user.id, doc.id);
        await prisma.document.update({
          where: { id: doc.id },
          data: { fileUrl, status: "processing" },
        });
      } catch (uploadErr) {
        console.error("Supabase upload failed:", uploadErr);
        await prisma.document.update({
          where: { id: doc.id },
          data: { status: "processing" },
        });
      }

      try {
        const updated = await analyzeAndSave(text, doc.id, session.user.id);
        return NextResponse.json(updated);
      } catch (analysisErr) {
        console.error("Analysis failed:", analysisErr);
        await prisma.document.update({
          where: { id: doc.id },
          data: { status: "failed" },
        });
        return NextResponse.json(
          { error: "AI analysis failed. Please try again." },
          { status: 500 }
        );
      }
    } else if (url) {
      try {
        fileName = new URL(url).hostname;
      } catch {
        return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
      }
      fileType = "url";
      text = await extractTextFromUrl(url);

      if (text.trim().length < 50) {
        return NextResponse.json({ error: "Could not extract meaningful content from URL" }, { status: 400 });
      }

      const doc = await prisma.document.create({
        data: {
          userId: session.user.id,
          title: fileName,
          fileName: url,
          fileType: "url",
          rawText: text,
          status: "processing",
        },
      });

      try {
        const updated = await analyzeAndSave(text, doc.id, session.user.id);
        return NextResponse.json(updated);
      } catch (analysisErr) {
        console.error("Analysis failed:", analysisErr);
        await prisma.document.update({
          where: { id: doc.id },
          data: { status: "failed" },
        });
        return NextResponse.json(
          { error: "AI analysis failed. Please try again." },
          { status: 500 }
        );
      }
    }
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
