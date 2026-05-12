"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, ChevronRight } from "lucide-react";
import { formatDateRelative, getFileIcon } from "@/lib/utils";
import { DocumentWithAnalysis } from "@/types";

interface DocumentCardProps {
  document: DocumentWithAnalysis;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
    completed: "success",
    processing: "warning",
    uploading: "secondary",
    failed: "destructive",
  };

  return (
    <Link href={`/dashboard/documents/${document.id}`}>
      <Card className="p-4 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 group">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <FileText className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {document.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {document.fileName} &middot; {document.fileType.split("/").pop()?.toUpperCase()}
                </p>
              </div>
              <Badge variant={statusColors[document.status] || "secondary"} className="shrink-0">
                {document.status}
              </Badge>
            </div>
            {document.oneSentenceSummary && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
                {document.oneSentenceSummary}
              </p>
            )}
            <div className="flex items-center gap-3 mt-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDateRelative(document.createdAt)}
              </span>
              {document.documentType && (
                <span>{document.documentType}</span>
              )}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 mt-2 shrink-0 transition-colors" />
        </div>
      </Card>
    </Link>
  );
}
