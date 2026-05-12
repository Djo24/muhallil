"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    id: "free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "3 documents per month",
      "AI-powered summaries",
      "Key info extraction",
      "Chat with documents",
      "Basic export options",
    ],
    cta: "Get Started",
    href: "/signup",
    featured: false,
  },
  {
    name: "Pro",
    id: "pro",
    price: "$7.99",
    period: "per month",
    description: "For professionals and small teams",
    features: [
      "30 documents per month",
      "Everything in Free",
      "Document comparison",
      "Priority support",
      "Advanced export",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    featured: true,
  },
  {
    name: "Business",
    id: "business",
    price: "$19.99",
    period: "per month",
    description: "For organizations with high volume",
    features: [
      "Unlimited documents",
      "Everything in Pro",
      "Team collaboration",
      "Dedicated support",
      "API access",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    href: "/signup",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Choose the plan that fits your needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border ${
                tier.featured
                  ? "border-indigo-500 dark:border-indigo-400 shadow-xl shadow-indigo-500/10"
                  : "border-zinc-200 dark:border-zinc-700"
              } bg-white dark:bg-zinc-900 p-8`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="bg-indigo-600 text-white">Most Popular</Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{tier.name}</h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-zinc-900 dark:text-white">{tier.price}</span>
                  {tier.period && (
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{tier.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href={tier.href}>
                <Button
                  variant={tier.featured ? "default" : "outline"}
                  className="w-full"
                >
                  {tier.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
