"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FileText,
  Upload,
  Settings,
  Sparkles,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getPlanName } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useState } from "react";

const sidebarLinks = [
  { href: "/dashboard", label: "My Documents", icon: FileText },
  { href: "/dashboard/upload", label: "Upload", icon: Upload },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ plan }: { plan: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const planName = getPlanName(plan);

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-sm"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-zinc-900 dark:text-white">مُحلّل</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
          <Link
            href="/dashboard/billing"
            className={cn(
              "block rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-3 transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">{planName} Plan</p>
                <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">
                  {plan === "free" ? "Upgrade to Pro" : "Manage billing"}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-indigo-500" />
            </div>
          </Link>

          <div className="flex items-center gap-3 rounded-lg px-1">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {session?.user?.email}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
