import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_KEY is not configured");
  }
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

export async function uploadFileToSupabase(
  file: File,
  userId: string,
  documentId: string
): Promise<string> {
  const supabase = getSupabase();
  const ext = file.name.split(".").pop() || "bin";
  const path = `${userId}/${documentId}.${ext}`;

  const { error } = await supabase.storage.from("documents").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from("documents").getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFileFromSupabase(path: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.storage.from("documents").remove([path]);
  if (error) {
    console.error("Failed to delete file from Supabase:", error);
  }
}
