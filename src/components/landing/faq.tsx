"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What file types are supported?",
    a: "We support PDF, DOCX, TXT, and image files (PNG, JPG). Maximum file size is 25MB per document.",
  },
  {
    q: "How accurate is the AI analysis?",
    a: "Our analysis is powered by OpenAI's GPT-4o, one of the most advanced AI models. While highly accurate, we recommend reviewing important documents manually for critical decisions.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All documents are encrypted in transit and at rest. We use Supabase Storage with secure access controls. Your documents are never shared or used to train AI models.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Yes, you can cancel anytime through your billing settings. You'll retain access to paid features until the end of your billing period.",
  },
  {
    q: "How does document comparison work?",
    a: "Upload two documents and our AI will analyze them side by side, highlighting similarities, differences, and key variations in terms, dates, and figures.",
  },
  {
    q: "What happens when I reach my document limit?",
    a: "You'll see an upgrade prompt and can either upgrade to a higher tier or wait until your billing cycle resets. Your existing documents remain accessible.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 px-4 bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
