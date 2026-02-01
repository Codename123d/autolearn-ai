import { NextResponse } from "next/server";
import OpenAi from "openai"
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
        - Experience level: {{experienceLevel}}
        - Technical skill level: ${skillLevel}

        Job tasks:
        ${tasks}

        Goals:
        ${goals}

        Constraints:
        {{constraints}}

        Requirements:
        - Include at least one lesson on GDPR and the Data Protection Act 2018
        - DO NOT SUGGEST auto-executing actions in a external systems
        - Focus on safe, ethical AI usage at work.

        Output Format:
        - Introduction
        - Lesson Breakdown (step-by-step)
        - Practical examples
        - Final recap
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: [{
                role: "user",
                content: prompt
            }],
        });

        const generatedContent = completion.choices[0].message.content || "";

        function parseLessons(content: string) {
            const lessonSection = content.split("Lesson Breakdown:")[1];

            if (!lessonSection) return [];

            const rawLessons = lessonSection
                .split(/Lesson\s+\d+:/i)
                .slice(1);

            return rawLessons.map((lesson, index) => {
                const trimmed = lesson.trim();

                const firstLineEnd = trimmed.indexOf("\n");
                const title = 
                    firstLineEnd !== -1
                        ? trimmed.slice(0, firstLineEnd).trim()
                        : `Lesson ${index + 1}`;

                return {
                    title,
                    content: trimmed,
                    lesson_order: index + 1,
                    is_gdpr: /gdpr|data protection act/i.test(trimmed),
                };
            });
        }

        // Store in database
        // Create intake form
        const { data: intakeForm, error: insertError } = await supabase
            .from("job_intake_forms")
            .insert({
                user_id: user.id,
                job_role: jobRole,
                industry,
                tasks,
                goals,
                skill_level: skillLevel.toLowerCase(),
            })
            .select()
            .single();
        
        if (insertError) {
            console.error(insertError);
            return NextResponse.json(
                { error: "Failed to save learning plan" },
                { status: 500 }
            );
        }

        // Create learning plan
        const { data: learningPlan, error: planError } = await supabase
            .from("learning_plans")
            .insert({
                user_id: user.id,
                intake_form_id: intakeForm.id,
                title: `AI Learning Plan for ${jobRole}`,
                introduction: generatedContent?.split("Lesson Breakdown")[0],
                final_recap: "See lesson content for full recap.",
                ai_model: "gpt-5-mini",
                status: "generated",
            })
            .select()
            .single();

            if (planError) {
            console.error(planError);
            return NextResponse.json(
                { error: "Failed to save learning plan" },
                { status: 500 }
            );
        }

        
        const lessons = parseLessons(generatedContent);

        if (lessons.length === 0) {
            return NextResponse.json(
                { error: "No lessons generated" },
                { status: 500 }
            );
        }

        const lessonRows = lessons.map(lesson => ({
            lesson_plan_id: learningPlan.id,
            title: lesson.title,
            content: lesson.content,
            lesson_order: lesson.lesson_order,
            is_gdpr: lesson.is_gdpr,
        }));

        const { error: lessonInsertError } = await supabase
            .from("lessons")
            .insert(lessonRows);

        if (lessonInsertError) {
            console.error(lessonInsertError);
            return NextResponse.json(
                { error: "Failed to store lessons" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            content: generatedContent,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to generate content" },
            { status: 500 }
        );
    }
}