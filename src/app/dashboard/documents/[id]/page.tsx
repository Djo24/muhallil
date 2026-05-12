"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AnalysisTabs } from "@/components/dashboard/analysis-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DocumentWithAnalysis } from "@/types";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function DocumentPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [document, setDocument] = useState<DocumentWithAnalysis | null>(null);
  const [allDocuments, setAllDocuments] = useState<DocumentWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userPlan = (session?.user as { plan?: string })?.plan || "free";

  useEffect(() => {
    let cancelled = false;
    const fetchDocument = async () => {
      try {
        const res = await fetch(`/api/documents/${params.id}`);
        if (cancelled) return;
        if (!res.ok) throw new Error("Document not found");
        const data = await res.json();
        setDocument(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load document");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const fetchAllDocuments = async () => {
      try {
        const res = await fetch("/api/documents");
        if (cancelled) return;
        if (res.ok) {
          setAllDocuments(await res.json());
        }
    } catch {
      // silently ignore — this is a secondary fetch
    }
  };

    fetchDocument();
    fetchAllDocuments();
    return () => { cancelled = true; };
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">Document not found</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">{error || "This document doesn't exist or has been deleted."}</p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Documents
          </Button>
        </Link>
      </div>
      <AnalysisTabs document={document} allDocuments={allDocuments} userPlan={userPlan} />
    </div>
  );
}
