"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Upload, File, Link as LinkIcon, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/types";
import { toast } from "sonner";

type UploadStage = "idle" | "uploading" | "extracting" | "analyzing" | "done" | "error";

export function UploadZone() {
  const router = useRouter();
  const [mode, setMode] = useState<"file" | "url">("file");
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setSelectedFile(file);
    setError("");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      if (err?.code === "file-too-large") {
        setError("File exceeds 25MB limit");
      } else if (err?.code === "file-invalid-type") {
        setError("Invalid file type. Accepted: PDF, DOCX, TXT, PNG, JPG");
      } else {
        setError(err?.message || "Upload failed");
      }
    },
  });

  const handleUpload = async () => {
    if (mode === "file" && !selectedFile) return;
    if (mode === "url" && !url.trim()) return;

    setStage("uploading");
    setProgress(10);
    setError("");

    try {
      if (mode === "file" && selectedFile) {
        // 1. Get signed upload URL
        setProgress(15);
        const signedRes = await fetch("/api/documents/signed-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: selectedFile.name, fileType: selectedFile.type }),
        });
        if (!signedRes.ok) {
          const err = await signedRes.json();
          throw new Error(err.error || "Failed to get upload URL");
        }
        const { signedUrl, path: signedPath, publicUrl } = await signedRes.json();

        // 2. Upload directly to Supabase Storage
        setProgress(30);
        const uploadRes = await fetch(signedUrl, {
          method: "PUT",
          body: selectedFile,
          headers: { "Content-Type": selectedFile.type },
        });
        if (!uploadRes.ok) throw new Error("File upload to storage failed");

        // 3. Send to analysis
        setProgress(50);
        setStage("extracting");
        const analysisRes = await fetch("/api/documents/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            signedPath,
            publicUrl,
            name: selectedFile.name,
            type: selectedFile.type,
          }),
        });

        if (!analysisRes.ok) {
          const err = await analysisRes.json();
          throw new Error(err.error || "Analysis failed");
        }

        setProgress(80);
        setStage("analyzing");
        const doc = await analysisRes.json();

        setProgress(100);
        setStage("done");
        toast.success("Document analyzed successfully!");
        setTimeout(() => router.push(`/dashboard/documents/${doc.id}`), 1000);
      } else if (mode === "url") {
        setProgress(40);
        setStage("extracting");
        const res = await fetch("/api/documents/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }
        setProgress(70);
        setStage("analyzing");
        const doc = await res.json();
        setProgress(100);
        setStage("done");
        toast.success("Document analyzed successfully!");
        setTimeout(() => router.push(`/dashboard/documents/${doc.id}`), 1000);
      }
    } catch (e) {
      setStage("error");
      setError(e instanceof Error ? e.message : "Upload failed");
      toast.error(e instanceof Error ? e.message : "Upload failed");
    }
  };

  const reset = () => {
    setStage("idle");
    setProgress(0);
    setError("");
    setSelectedFile(null);
    setUrl("");
  };

  if (stage !== "idle") {
    return (
      <Card className="p-8 max-w-xl mx-auto text-center">
        {stage === "error" ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Upload Failed</h3>
            <p className="text-sm text-red-500">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={reset}>Try Again</Button>
              <Button onClick={reset}>Upload Different File</Button>
            </div>
          </div>
        ) : stage === "done" ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Analysis Complete!</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Redirecting to results...</p>
            <Progress value={100} className="max-w-xs mx-auto" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <File className="h-8 w-8 text-indigo-500 animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white capitalize">
              {stage === "uploading" ? "Uploading..." : stage === "extracting" ? "Extracting Text..." : "Analyzing with AI..."}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {stage === "uploading" && "Uploading your document to secure storage..."}
              {stage === "extracting" && "Reading and extracting text content..."}
              {stage === "analyzing" && "GPT-4o is analyzing your document..."}
            </p>
            <Progress value={progress} className="max-w-xs mx-auto" />
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode("file")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
            mode === "file" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500"
          )}
        >
          <Upload className="h-4 w-4" /> Upload File
        </button>
        <button
          onClick={() => setMode("url")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
            mode === "url" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500"
          )}
        >
          <LinkIcon className="h-4 w-4" /> URL
        </button>
      </div>

      {mode === "file" ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
            isDragActive
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
              : "border-zinc-300 dark:border-zinc-600 hover:border-indigo-400 dark:hover:border-indigo-500"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Upload className={cn("h-8 w-8 transition-colors", isDragActive ? "text-indigo-500" : "text-zinc-400")} />
            </div>
            <div>
              <p className="text-lg font-medium text-zinc-900 dark:text-white">
                {isDragActive ? "Drop your file here" : "Drag & drop your file"}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                or click to browse
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary">PDF</Badge>
              <Badge variant="secondary">DOCX</Badge>
              <Badge variant="secondary">TXT</Badge>
              <Badge variant="secondary">PNG</Badge>
              <Badge variant="secondary">JPG</Badge>
            </div>
            <p className="text-xs text-zinc-400">Max 25MB per file</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-900 dark:text-white">Document URL</label>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/document.pdf"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
      )}

      {selectedFile && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{selectedFile.name}</p>
                <p className="text-xs text-zinc-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button onClick={() => setSelectedFile(null)} className="text-zinc-400 hover:text-red-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={mode === "file" ? !selectedFile : !url.trim()}
        className="w-full"
        size="lg"
      >
        Analyze Document
      </Button>
    </div>
  );
}
