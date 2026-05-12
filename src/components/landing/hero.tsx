"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-emerald-50/30 dark:from-indigo-950/20 dark:via-zinc-950 dark:to-emerald-950/20" />
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 text-sm text-indigo-700 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Document Analysis
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl"
        >
          Understand Your Documents
          <br />
          <span className="bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
            Instantly with AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400"
        >
          Upload any document — PDF, DOCX, or image — and get instant AI-powered summaries,
          key insights, risk analysis, and more. Make informed decisions faster.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/signup">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Start Analyzing Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              See How It Works
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-8 text-sm text-zinc-500 dark:text-zinc-400"
        >
          <span>PDF, DOCX, TXT</span>
          <span className="h-4 w-px bg-zinc-300 dark:bg-zinc-600" />
          <span>Up to 25MB</span>
          <span className="h-4 w-px bg-zinc-300 dark:bg-zinc-600" />
          <span>GPT-4o Powered</span>
        </motion.div>
      </div>
    </section>
  );
}
