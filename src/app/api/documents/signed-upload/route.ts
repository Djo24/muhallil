import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { ALLOWED_FILE_TYPES } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "fileName and fileType required" }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const ext = fileName.split(".").pop() || "bin";
    const path = `${session.user.id}/${Date.now()}.${ext}`;

    const supabase = getSupabase();
    const { data, error } = await supabase.storage.from("documents").createSignedUploadUrl(path);

    if (error) {
      return NextResponse.json({ error: `Failed to create upload URL: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl: supabase.storage.from("documents").getPublicUrl(data.path).data.publicUrl,
    });
  } catch (e) {
    console.error("Signed upload error:", e);
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 }
    );
  }
}
