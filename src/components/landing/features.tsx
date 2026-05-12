"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Brain,
  AlertTriangle,
  MessageSquare,
  GitCompare,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Summaries",
    description: "Get one-sentence, executive, and detailed bullet-point summaries tailored to your needs.",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
  },
  {
    icon: Brain,
    title: "Key Information Extraction",
    description: "Automatically extract dates, financial figures, people, and required decisions.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    icon: AlertTriangle,
    title: "Risk Detection",
    description: "AI identifies legal, financial, and operational risks with severity ratings.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    icon: MessageSquare,
    title: "Chat with Documents",
    description: "Ask questions about your document and get answers with source references.",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
  },
  {
    icon: GitCompare,
    title: "Document Comparison",
    description: "Side-by-side comparison of two documents to highlight similarities and differences.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your documents are encrypted and never shared. Enterprise-grade security.",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
            Powerful Features
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Everything you need to understand documents at scale
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 transition-all hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
