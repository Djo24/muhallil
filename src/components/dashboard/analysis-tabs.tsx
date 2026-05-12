"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentWithAnalysis } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  FileText,
  Download,
  Share2,
  Trash2,
  Send,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  Scale,
  GitCompare,
  MessageSquare,
  Info,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface AnalysisTabsProps {
  document: DocumentWithAnalysis;
  allDocuments: DocumentWithAnalysis[];
  userPlan?: string;
}

export function AnalysisTabs({ document, allDocuments, userPlan = "free" }: AnalysisTabsProps) {
  const router = useRouter();
  const [title, setTitle] = useState(document.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<{ q: string; a: string; sections: string[] }[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [compareId, setCompareId] = useState("");
  const [comparison, setComparison] = useState<{ similarities: string[]; differences: string[] } | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const suggestedQuestions = [
    "What are the key action items?",
    "Summarize the financial terms",
    "What risks should I be aware of?",
    "List all parties involved",
  ];

  const handleUpdateTitle = async () => {
    if (title.trim() === document.title) {
      setIsEditingTitle(false);
      return;
    }
    try {
      const res = await fetch("/api/documents/" + document.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update title");
      toast.success("Title updated");
      setIsEditingTitle(false);
    } catch (e) {
      toast.error("Failed to update title");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch("/api/documents/" + document.id, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Document deleted");
      router.push("/dashboard");
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const handleAsk = async (q: string) => {
    const query = q || question;
    if (!query.trim()) return;

    setQuestion("");
    setIsAsking(true);
    setChat((prev) => [...prev, { q: query, a: "Thinking...", sections: [] }]);

    try {
      const res = await fetch("/api/documents/" + document.id + "/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });
      if (!res.ok) throw new Error("Failed to get answer");
      const data = await res.json();
      setChat((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { q: query, a: data.answer, sections: data.relevantSections || [] };
        return updated;
      });
    } catch (e) {
      setChat((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { q: query, a: "Sorry, I couldn't process that question. Please try again.", sections: [] };
        return updated;
      });
    } finally {
      setIsAsking(false);
    }
  };

  const handleCompare = async () => {
    if (!compareId) return;
    setIsComparing(true);
    try {
      const res = await fetch("/api/documents/" + document.id + "/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "COMPARE_WITH:" + compareId, compare: true }),
      });
      if (!res.ok) throw new Error("Comparison failed");
      const data = await res.json();
      setComparison(data);
    } catch (e) {
      toast.error("Failed to compare documents");
    } finally {
      setIsComparing(false);
    }
  };

  const handleDownload = () => {
    const content = JSON.stringify(
      {
        title: document.title,
        documentType: document.documentType,
        oneSentenceSummary: document.oneSentenceSummary,
        executiveSummary: document.executiveSummary,
        detailedSummary: document.detailedSummary,
        decisionsRequired: document.decisionsRequired,
        dates: document.dates,
        financials: document.financials,
        people: document.people,
        risks: document.risks,
      },
      null,
      2
    );
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const downloadLink = window.document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${document.title.replace(/\s+/g, "_")}_analysis.json`;
    downloadLink.click();
    URL.revokeObjectURL(url);
    toast.success("Analysis downloaded");
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "warning";
      default: return "secondary";
    }
  };

  const urgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "destructive";
      case "soon": return "warning";
      default: return "secondary";
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="min-w-0 flex-1">
            {isEditingTitle ? (
              <div className="flex gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 text-lg font-semibold"
                  autoFocus
                  onBlur={handleUpdateTitle}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle()}
                />
                <Button size="sm" onClick={handleUpdateTitle} className="shrink-0">Save</Button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="text-lg font-semibold text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate text-left"
              >
                {document.title}
              </button>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary">{document.fileType.split("/").pop()?.toUpperCase()}</Badge>
              <span className="text-xs text-zinc-400">{formatDate(document.createdAt)}</span>
              {document.documentType && (
                <Badge variant="default">{document.documentType}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied!");
          }}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showDeleteConfirm && (
        <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Delete this document?</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">This action cannot be undone. All analysis data will be permanently removed.</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="destructive" onClick={handleDelete}>Delete</Button>
                <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="summary">
        <TabsList className="w-full sm:w-auto overflow-x-auto flex-nowrap">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="key-info">Key Info</TabsTrigger>
          <TabsTrigger value="ask">Ask Document</TabsTrigger>
          <TabsTrigger value="compare" disabled={userPlan !== "pro" && userPlan !== "business"}>
            Compare
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  One-Sentence Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-700 dark:text-zinc-300">{document.oneSentenceSummary || "No summary available."}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-4 w-4 text-indigo-500" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {document.executiveSummary || "No executive summary available."}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {document.detailedSummary && document.detailedSummary.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-amber-500" />
                    Detailed Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {document.detailedSummary.map((item, i) => (
                      <div key={i}>
                        <h4 className="font-medium text-sm text-zinc-900 dark:text-white mb-1">{item.section}</h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.point}</p>
                        {i < (document.detailedSummary?.length || 0) - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="key-info" className="space-y-6">
          {document.decisionsRequired && document.decisionsRequired.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Scale className="h-4 w-4 text-indigo-500" />
                  Decisions Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {document.decisionsRequired.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                      {d}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {document.dates && document.dates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-700">
                        <th className="text-left py-2 pr-4 font-medium text-zinc-500">Date</th>
                        <th className="text-left py-2 pr-4 font-medium text-zinc-500">Context</th>
                        <th className="text-left py-2 font-medium text-zinc-500">Urgency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {document.dates.map((d, i) => (
                        <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                          <td className="py-2 pr-4 text-zinc-900 dark:text-white font-medium">{d.date}</td>
                          <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{d.context}</td>
                          <td className="py-2"><Badge variant={urgencyColor(d.urgency)}>{d.urgency}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {document.financials && document.financials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-700">
                        <th className="text-left py-2 pr-4 font-medium text-zinc-500">Amount</th>
                        <th className="text-left py-2 pr-4 font-medium text-zinc-500">Currency</th>
                        <th className="text-left py-2 font-medium text-zinc-500">Context</th>
                      </tr>
                    </thead>
                    <tbody>
                      {document.financials.map((f, i) => (
                        <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                          <td className="py-2 pr-4 text-zinc-900 dark:text-white font-medium">{f.amount}</td>
                          <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{f.currency}</td>
                          <td className="py-2 text-zinc-600 dark:text-zinc-400">{f.context}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {document.people && document.people.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-indigo-500" />
                  People & Parties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {document.people.map((p, i) => (
                    <div key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3">
                      <p className="font-medium text-sm text-zinc-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{p.role}</p>
                      {p.organization && (
                        <p className="text-xs text-zinc-400 mt-0.5">{p.organization}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {document.risks && document.risks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Risk Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {document.risks.map((r, i) => (
                    <div key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={r.type === "legal" ? "destructive" : r.type === "financial" ? "warning" : "secondary"}>
                            {r.type}
                          </Badge>
                          <span className="text-xs text-zinc-500">{r.section}</span>
                        </div>
                        <Badge variant={severityColor(r.severity)}>{r.severity}</Badge>
                      </div>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">{r.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(!document.decisionsRequired?.length && !document.dates?.length && !document.financials?.length && !document.people?.length && !document.risks?.length) && (
            <Card>
              <CardContent className="py-8 text-center">
                <Info className="h-8 w-8 text-zinc-400 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">No key information extracted yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ask" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleAsk(q)}
                    className="rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-indigo-300 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {chat.map((msg, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-3 justify-end">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-lg rounded-tr-none px-3 py-2 max-w-[80%]">
                        <p className="text-sm text-zinc-900 dark:text-white">{msg.q}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 mt-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <MessageSquare className="h-3 w-3 text-zinc-500" />
                      </div>
                      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg rounded-tl-none px-3 py-2 max-w-[80%]">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">{msg.a}</p>
                        {msg.sections.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {msg.sections.map((s, si) => (
                              <Badge key={si} variant="outline" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isAsking && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <MessageSquare className="h-3 w-3 text-zinc-500" />
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg rounded-tl-none px-3 py-2">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); handleAsk(""); }}
                className="flex gap-2"
              >
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about this document..."
                  disabled={isAsking}
                />
                <Button type="submit" size="icon" disabled={isAsking || !question.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GitCompare className="h-4 w-4 text-indigo-500" />
                Compare with Another Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <select
                  value={compareId}
                  onChange={(e) => setCompareId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                >
                  <option value="">Select a document to compare...</option>
                  {allDocuments
                    .filter((d) => d.id !== document.id && d.status === "completed")
                    .map((d) => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                </select>

                <Button onClick={handleCompare} disabled={!compareId || isComparing}>
                  {isComparing ? "Comparing..." : "Compare Documents"}
                </Button>

                {comparison && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-3">Similarities</h4>
                      <ul className="space-y-2">
                        {comparison.similarities.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-3">Differences</h4>
                      <ul className="space-y-2">
                        {comparison.differences.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
