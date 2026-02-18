// src/app/api/active-plan/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createSupabaseServer();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ plan: null });
    }

    const { data: plan, error } = await supabase
        .from("learning_plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "generating")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Error fetching active plan:", error);
        return NextResponse.json({ plan: null });
    }

    return NextResponse.json({ plan });
}