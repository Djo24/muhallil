import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askDocument, summarizeForComparison } from "@/lib/analyzer";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document || document.userId !== session.user.id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const { question, compare } = await req.json();

    if (compare) {
      const compareId = question.replace("COMPARE_WITH:", "");
      const compareDoc = await prisma.document.findUnique({ where: { id: compareId } });
      if (!compareDoc || compareDoc.userId !== session.user.id || !document.rawText || !compareDoc.rawText) {
        return NextResponse.json({ error: "Cannot compare documents" }, { status: 400 });
      }
      const result = await summarizeForComparison(document.rawText, compareDoc.rawText);
      return NextResponse.json(result);
    }

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    if (!document.rawText) {
      return NextResponse.json({ error: "Document text not available" }, { status: 400 });
    }

    const result = await askDocument(question, document.rawText);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to process question" },
      { status: 500 }
    );
  }
}
