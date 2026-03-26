// src/app/api/generate/route.ts
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

        type GenerateRequestBody = {
            jobRole: string;
            seniority?: string;
            industry?: string;
            tasks: string;
            goals: string;
            skillLevel?: string;
        };

        const body: GenerateRequestBody = await req.json();

        const { jobRole, seniority, industry, tasks, goals, skillLevel } = body;

        if (!jobRole || !tasks || !goals) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const { data: intake, error: intakeError } = await supabase
            .from("job_intake_forms")
            .insert({
                user_id: user.id,
                job_role: jobRole,
                seniority_level: seniority ?? "Mid-level",
                industry,
                tasks,
                goals,
                skill_level: skillLevel?.toLowerCase() ?? "beginner",
            })
            .select()
            .single();

        if (intakeError) {
            console.error("INTAKE ERROR:", intakeError);
        }

        if (intakeError || !intake) {
            return NextResponse.json(
                { error: "Failed to save intake form data" },
                { status: 500 }
            );
        }

        const failPlans = async (message: string, createdPlanId: string[] = []) => {

            if (createdPlanIds.length > 0) {
                await supabase
                    .from("learning_plans")
                    .update({ status: "failed" })
                    .in("id", createdPlanIds);
            }

            console.error("Learning plan generation failed:", message);

            return NextResponse.json(
                { error: message },
                { status: 500 }
            );
        };

        const intakeFormId = intake.id;

        const { error: profileError } = await supabase
            .from("profiles")
            .update({ primary_job_role: jobRole })
            .eq("id", user.id)
            .is("primary_job_role", null);

        if (profileError) {
            console.error("Profile update failed:", profileError);
        }

        const taskArray = tasks
            .split("\n")
            .map(t => t.trim())
            .filter(Boolean);

        const systemMessage = `

        You are an AI Learning Designer.

        Your task is to generate separate AI workplace lesson plans for each job task.

        Design Principles:
        - Analyse each job task individually.
        - Each task must produce its own complete lesson plan object.
        - Do not merge tasks.
        - Each lesson plan must function as a standalone learning module.
        - Focus on real workplace usage of AI
        - Avoid generic theory.
        - DO NOT show prompt templates.
        - DO NOT explain how to write prompts.
        - Show the AI process through outputs instead.

        Lesson Plan Structure (PER TASK):

        Each task must return one object with:

        {
            "introduction": string,
            "lessons": [
                {
                    "title": string,
                    "content": string,
                    "is_gdpr": boolean
                }
            ],
            "final_recap": string
        }

        Lesson Content Requirements:
        Each lesson must include:

        1. Task setup:
        - Clearly describe what input/data the user prepares before using AI.

        2. System generates output:
        - Include a section labelled exactly:
          Generated Output
        - Show a realistic but imperfect AI-generated result.

        3. Review generated output:
        - Explain what is missing, weak, or incorrect in the output.

        4. System refines output:
        - Include a section labelled exactly:
            Refined Output
        - Show an improved, high-quality version of the output.

        5. Final human validation step:
        - Explain what the human must check before using the result.
        - Reinforce that humans remain responsible for decisions.

        Important Constraints:
        - DO NOT display prompts or prompt templates.
        - DO NOT simulate a conversation with AI.
        - DO NOT include system instructions in the output.
        - Focus on demonstrating the workflow through outputs and improvements.
        - Keep all lessons practical and workplace-focused.
        
        Mandatory Compliance Lesson:
        Include a final lesson titled exactly:
        "GDPR and Data Protection Act 2018"

        This lesson must include:
            - risks of sharing personal data
            - anonymisation
            - data minimisation
            - legal responsibility
            - warning against uploading sensitive documents

        Output JSON Structure:

        {
            "lessons_plan": [
                {
                    "introduction": string,
                    "lessons": [
                        {
                            "title": string,
                            "content": string,
                            "is_gdpr": boolean
                        }
                    ],
                    "final_recap": string
                },
                {
                    "introduction": string,
                    "lessons": [
                        {
                            "title": string,
                            "content": string,
                            "is_gdpr": boolean
                        }
                    ],
                    "final_recap": string
                }
            ]
        }

        Output Rules:
        - Return valid JSON only
        - Do NOT include markdown
        - Do NOT include explanations outside JSON
        - Do NOT include trailing commas
        - Ensure lessons_plan is a flat array of objects with no nesting or duplication
        `;

        const userMessage = `
        User Profile:
        
        Job Role: ${jobRole}
        Seniority Level: ${seniority}
        Industry: ${industry}
        Technical Skill Level: ${skillLevel}

        Tasks:
        ${taskArray.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}

        Goals:
        ${goals}

        Instructions:

        Write a concise introduction explaining how AI can responsibly support this role in this industry.

        For EACH task listed: 
        - Generate ONE complete lesson plan object per task
        - Each lesson plan object must include:
            - introduction
            - lessons (an array containing exactly ONE lesson)
            - final_recap
        - The lesson inside each lesson plan must ONLY cover that single task
        - DO NOT combine tasks
        - DO NOT reference other tasks
        - Each lesson plan must be fully independent with no shared references between tasks
        - The total number of lesson plan objects MUST equal (number of tasks + 1), including the GDPR lesson
        - Set "is_gdpr": false

        Then generate ONE additional lesson plan object for:
        "GDPR and Data Protection Act 2018"

        - Set "is_gdpr": true for the GDPR lesson plan object

        Return output in this structure:
        {
            "lessons_plan": [
                {
                    "introduction": string,
                    "lessons": [
                        {
                            "title": string,
                            "content": string,
                            "is_gdpr": boolean
                        }
                    ],
                    "final_recap": string
                }
            ]
    }

    Return valid JSON only.
        `;

        let raw: string | null = null;

        try {
            const completion = await openai.responses.create({
                model: "gpt-5-mini",
                input: [
                    {
                        role: "system",
                        content: systemMessage,
                    },
                    {
                        role: "user",
                        content: userMessage,
                    },
                ],
            });
            raw = completion.output_text;
        } catch (err) {
            return await failPlans("AI generation failed");
        }

        if (!raw) {
            return await failPlans("AI did not return any content");
        }

        let parsed: {
            lessons_plan: {
                introduction: string;
                lessons: {
                    title: string;
                    content: string;
                    is_gdpr: boolean;
                }[];
                final_recap: string;
            }[];
        };

        try {
            parsed = JSON.parse(raw);
        } catch (err) {
            console.error("JSON Parse Error:", err);
            console.error("AI RAW RESPONSE:", raw);
            return await failPlans("Failed to parse AI response");
        }

        const lessonPlans = parsed.lessons_plan;

        const createdPlanIds: string[] = [];

                for (const lp of parsed.lessons_plan) {
            if (
                typeof lp.introduction !== "string" ||
                typeof lp.final_recap !== "string" ||
                !Array.isArray(lp.lessons) ||
                lp.lessons.length !== 1 
            ) {
                return await failPlans("Invalid lesson structure");
            }

            const lesson = lp.lessons[0];

            if (
                typeof lesson.title !== "string" ||
                typeof lesson.content !== "string" ||
                typeof lesson.is_gdpr !== "boolean"
            ) {
                return await failPlans("Invalid lesson inside plan");
            }
        }

        for (let i = 0; i < lessonPlans.length; i++) {
            const lp = lessonPlans[i];

            // Create ONE plan per task
            const { data: plan, error: planError } = await supabase
                .from("learning_plans")
                .insert({
                    user_id: user.id,
                    intake_form_id: intakeFormId,
                    title: lp.lessons[0]?.title || `Task ${i + 1}`,
                    introduction: lp.introduction,
                    final_recap: lp.final_recap,
                    ai_model: "gpt-5-mini",
                    status: "generated",
                })
                .select()
                .single();

            if (planError || !plan) {
                console.error("Plan creation failed:", planError);
                continue;
            }

            createdPlanIds.push(plan.id);

            // Insert ONE lesson per plan
            const lesson = lp.lessons[0];

            const { error: lessonError } = await supabase
                .from("lessons")
                .insert({
                    learning_plan_id: plan.id,
                    title: lesson.title,
                    content: lesson.content,
                    lesson_order: 1,
                    is_gdpr: lesson.is_gdpr,
                });
            
            if (lessonError) {
                console.error("Lesson insert failed:", lessonError);
            }
        }

        return NextResponse.json({ 
            success: true, 
            planIds: createdPlanIds, 
        });

    } catch (error) {
        console.error("Error generating learning plan:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}