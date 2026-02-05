import OpenAi from "openai"
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const openai = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();

        // Supabase server client
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options) {
                        cookieStore.set({ name, value: "", maxAge: 0, ...options });
                    },
                },
            },
        );

        // GET authenticated user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (!user || authError) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { jobRole, industry, tasks, goals, skillLevel } = await req.json();

        if (!jobRole || !tasks || !goals) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const prompt = `
        You are an AI learning designer.

        Your task is to generate a structured learning plan to help a user automate their job tasks using AI tools.

        User profile:
        - Job role: ${jobRole}
        - Industry: ${industry}
        - Technical skill level: ${skillLevel}

        Job tasks:
        ${tasks}

        Goals:
        ${goals}

        IMPORTANT RULES
        - You must include at least one lesson about GDPR and the Data Protection Act 2018
        - Mark GDPR-related lessons with "is_gdpr": true
        - DO NOT suggest auto-executing actions in external systems
        - Focus on safe, ethical, workplace AI usage
        - Use clear, professional language
        - DO NOT include markdown
        - DO NOT include explanations
        - DO NOT include any text outside of the JSON 

        RESPONSE FORMAT (STRICT JSON ONLY)
        {
            "introduction": string, 
            "lessons": [
                {
                    "title": string,
                    "content": string,
                    "is_gdpr": boolean
                },
            ],
            "final_recap": string
        }

        If you do not follow the JSON format exactly, the response is invalid.
        `;

        const completion = await openai.responses.create({
            model: "gpt-5-mini",
            input: prompt,
        });

        const raw = completion.output_text;

        if (!raw) {
            return NextResponse.json(
                { error: "Empty response" },
                { status: 500 }
            );
        }

        let parsed: {
        introduction: string, 
        final_recap: string,
        lessons: {
            title: string,
            content: string,
            lesson_order?: number,
            is_gdpr: boolean,
        }[];
    };
        try {
            parsed = JSON.parse(raw);
        } catch {
            return NextResponse.json(
                { error: "Failed to parse AI response" },
                { status: 500 }
            );
        }

        if (!parsed.lessons?.length) {
            return NextResponse.json(
                { error: "No lessons generated" },
                { status: 500 }
            );
        }

        parsed.lessons = parsed.lessons.map((lesson, index) => ({
            ...lesson,
            is_gdpr: lesson.is_gdpr === true,
            lesson_order: index + 1,
        }));

        const hasGdprLesson = parsed.lessons.some(l => l.is_gdpr === true);

        if (!hasGdprLesson) {
            return NextResponse.json(
                { error: "AI did not generate a GDPR lesson" },
                { status: 500 }
            );
        }

        const { data: learningPlanId, error: rpcError } = await supabase.rpc(
            "create_learning_plan_with_lessons",
            {
                p_user_id: user.id,
                p_job_role: jobRole,
                p_industry: industry,
                p_tasks: tasks,
                p_goals: goals,
                p_skill_level: skillLevel?.toLowerCase() ?? "beginner",
                p_title: `AI Learning Plan for ${jobRole}`,
                p_introduction: parsed.introduction,
                p_final_recap: parsed.final_recap,
                p_ai_model: "gpt-5-mini",
                p_lessons: parsed.lessons,
            }
        );

        if (rpcError) {
            console.error(rpcError);
            return NextResponse.json(
                { error: "Failed to save learning plan" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, learningPlanId });
    } catch (error) {
        console.error("Error generating learning plan:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}