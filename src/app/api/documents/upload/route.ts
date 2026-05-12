import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFileToSupabase } from "@/lib/supabase";
import { analyzeDocument } from "@/lib/analyzer";
import { extractTextFromFile, extractTextFromUrl } from "@/lib/extract-text";
import { checkRateLimit } from "@/lib/rate-limit";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/types";

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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;

    if (!file && !url) {
      return NextResponse.json({ error: "No file or URL provided" }, { status: 400 });
    }

    let text: string;
    let fileName: string;
    let fileType: string;
    let fileUrl: string | null = null;

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
        const analysis = await analyzeDocument(text);
        const [updated] = await Promise.all([
          prisma.document.update({
            where: { id: doc.id },
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
            where: { id: session.user.id },
            data: { documentsUsed: { increment: 1 } },
          }),
        ]);
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
        const analysis = await analyzeDocument(text);
        const [updated] = await Promise.all([
          prisma.document.update({
            where: { id: doc.id },
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
            where: { id: session.user.id },
            data: { documentsUsed: { increment: 1 } },
          }),
        ]);
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
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
