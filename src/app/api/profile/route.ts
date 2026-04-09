// src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
    const supabase = await createSupabaseServer();

    const { data, error } = await supabase.auth.getUser();

    if (!data.user) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = data.user.id;

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
    
    return NextResponse.json({ profile });
}