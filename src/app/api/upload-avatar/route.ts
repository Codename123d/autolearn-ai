// src/app/api/upload-avatar/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
    const supabase = await createSupabaseServer();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const file = await req.blob();

    const filePath = `${userId}/avatar.png`;

    const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ path: data.path });
}