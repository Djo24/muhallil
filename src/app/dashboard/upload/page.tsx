"use client";

import { UploadZone } from "@/components/dashboard/upload-zone";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Upload Document</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Upload a file or paste a URL to analyze
          </p>
        </div>
      </div>
      <UploadZone />
    </div>
  );
}
