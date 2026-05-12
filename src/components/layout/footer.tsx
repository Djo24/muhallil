import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">مُحلّل</span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              AI-powered document analysis platform. Upload, analyze, and understand your documents instantly.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">Features</Link></li>
              <li><Link href="#pricing" className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">Pricing</Link></li>
              <li><Link href="/signup" className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">Get Started</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><span className="text-sm text-zinc-400 cursor-not-allowed">Privacy</span></li>
              <li><span className="text-sm text-zinc-400 cursor-not-allowed">Terms</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-zinc-200 dark:border-zinc-800 pt-8 text-center">
          <p className="text-xs text-zinc-400">&copy; {new Date().getFullYear()} Muhallil. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
