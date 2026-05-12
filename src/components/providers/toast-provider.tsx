"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "border border-zinc-200 dark:border-zinc-700",
        duration: 4000,
      }}
    />
  );
}
