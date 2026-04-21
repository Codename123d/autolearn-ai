// src/app/api/search/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q) return NextResponse.json({ results: [] });

    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ results: [] });
    }

    // Search learning plans
    const { data: plans } = await supabase
        .from("learning_plans")
        .select("id, title")
        .ilike("title", `%${q}%`)
        .eq("user_id", user.id)
        .limit(5);

    const planIds = (plans || []).map(p => p.id);

    // Search lessons
    const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title, learning_plan_id")
        .ilike("title", `%${q}%`)
        .eq("learning_plan_id", planIds)
        .limit(5);
    
    // Merge results
    const results = [
        ...(plans || []).map(p => ({
            id: p.id,
            title: p.title,
            type: "plan"    
        })),
        ...(lessons || []).map(l => ({
            id: l.id, // lesson id
            title: l.title,
            type: "lesson",
            lessonId: l.id,
            planId: l.learning_plan_id // keep reference
        }))
    ];

    return NextResponse.json({ results: results });
}