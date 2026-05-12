"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { FileText, HardDrive, TrendingUp } from "lucide-react";
import { getPlanName } from "@/lib/utils";

interface StatsRowProps {
  documentsUsed: number;
  plan: string;
  totalDocuments: number;
}

export function StatsRow({ documentsUsed, plan, totalDocuments }: StatsRowProps) {
  const planName = getPlanName(plan);
  const limit = plan === "free" ? 3 : plan === "pro" ? 30 : Infinity;
  const usagePercent = limit === Infinity ? 0 : Math.round((documentsUsed / limit) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Documents Used</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold text-zinc-900 dark:text-white">{documentsUsed}</p>
              <span className="text-sm text-zinc-500">/ {limit === Infinity ? "∞" : limit}</span>
            </div>
          </div>
        </div>
        {limit !== Infinity && <Progress value={usagePercent} className="mt-3" />}
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <HardDrive className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Documents</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{totalDocuments}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Current Plan</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-zinc-900 dark:text-white capitalize">{planName}</p>
              <Badge variant={plan === "business" ? "success" : plan === "pro" ? "default" : "secondary"}>
                {planName}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
