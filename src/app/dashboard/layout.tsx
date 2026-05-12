"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <div className="hidden lg:flex w-64 border-r border-zinc-200 dark:border-zinc-800 p-4">
          <div className="w-full space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const plan = (session?.user as { plan?: string })?.plan || "free";

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar plan={plan} />
      <div className="flex-1 lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </div>
    </div>
  );
}
