"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { StatsRow } from "@/components/dashboard/stats-row";
import { DocumentCard } from "@/components/dashboard/document-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentWithAnalysis, UserProfile } from "@/types";
import { FileText, Upload, Search, Inbox } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<DocumentWithAnalysis[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, userRes] = await Promise.all([
        fetch("/api/documents"),
        fetch("/api/user"),
      ]);
      if (docsRes.ok) {
        setDocuments(await docsRes.json());
      }
      if (userRes.ok) {
        setUserProfile(await userRes.json());
      }
    } catch {
      // handled by error boundary
    } finally {
      setLoading(false);
    }
  };

  const plan = userProfile?.plan || (session?.user as { plan?: string })?.plan || "free";
  const documentsUsed = userProfile?.documentsUsed ?? (session?.user as { documentsUsed?: number })?.documentsUsed ?? 0;

  const filtered = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    documentsUsed,
    plan,
    totalDocuments: documents.length,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Documents</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage and view your analyzed documents
          </p>
        </div>
        <Link href="/dashboard/upload">
          <Button className="gap-2 w-full sm:w-auto">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </Link>
      </div>

      <StatsRow {...stats} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              {search ? <Search className="h-8 w-8 text-zinc-400" /> : <Inbox className="h-8 w-8 text-zinc-400" />}
            </div>
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
            {search ? "No documents found" : "No documents yet"}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            {search
              ? "Try a different search term"
              : "Upload your first document to get started"}
          </p>
          {!search && (
            <Link href="/dashboard/upload">
              <Button>Upload Document</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
