"use client";

import { motion } from "framer-motion";
import { Upload, FileSearch, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Document",
    description: "Drag & drop any PDF, DOCX, TXT, or image file. Or paste a URL to analyze web content.",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
  },
  {
    icon: FileSearch,
    title: "AI Extracts Key Insights",
    description: "Our GPT-4o engine reads every page, extracting summaries, dates, financial data, people, and risks.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    icon: Sparkles,
    title: "Get Actionable Results",
    description: "View structured analysis, ask questions about your document, and compare multiple documents side by side.",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Three simple steps to analyze any document
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex flex-col items-center text-center p-6"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+48px)] w-[calc(100%-96px)] h-px border-t-2 border-dashed border-zinc-300 dark:border-zinc-600" />
                  )}
                </div>
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${step.bg} mb-6`}>
                  <Icon className={`h-8 w-8 ${step.color}`} />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
