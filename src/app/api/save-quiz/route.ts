// src/app/api/save-quiz/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { QuizRequest } from "@/types";

export async function POST(request: Request) {
    try{
        const body: QuizRequest = await request.json();
        const { score, level } = body;
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: cookieStore }
        );

        const { 
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { error } = await supabase
            .from("skill_quiz_results")
            .insert({
                user_id: user.id,
                score,
                inferred_level: level.toLowerCase(),
            });

            if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}