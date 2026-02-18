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
            industry?: string;
            tasks: string;
            goals: string;
            skillLevel?: string;
        };

        const body: GenerateRequestBody = await req.json();

        const { jobRole, industry, tasks, goals, skillLevel } = body;

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
                industry,
                tasks,
                goals,
                skill_level: skillLevel?.toLowerCase() ?? "beginner",
            })
            .select()
            .single();

        if (intakeError || !intake) {
            return NextResponse.json(
                { error: "Failed to save intake form data" },
                { status: 500 }
            );
        }

        const intakeFormId = intake.id;

        await supabase
            .from("profiles")
            .update({ primary_job_role: jobRole })
            .eq("id", user.id)
            .is("primary_job_role", null);

        const taskArray = tasks
            .split("\n")
            .map(t  => t.trim())
            .filter(Boolean);

        const systemMessage = `
        You are an AI Learning Designer.

        Your task is to generate a structured AI learning plan containing one task-specific lesson per job task provided.

        Core Design Principles:
        - Analyse each job task individually.
        - Create one structured lesson per task.
        - Ensure each lesson functions as a practical AI workflow guide.
        - Focus on actionable prompts and real workplace applications.
        - Avoid generic theory and abstract advice.
        - Emphasise human oversight and responsible AI use.
        - Do NOT suggest automatic execution in external systems.
        - Do NOT imply system-level automation.
        - Keep all instructions clear and workplace-appropriate.

        Each lesson must contain:
        - A clear title referencing the specific task.
        - Structured instructional content as one single explanation string.
        - Practical prompt templates written in quotation marks.
        - At least one refinement prompt example in quotation marks.
        - Step-by-step guidance (numbered within the content).
        - Human review instructions.
        - Explicit reinforcement that AI supports, not replaces, human decision-making.
        
        Mandatory Compliance Lesson:
        - Include a final lesson titled exactly "GDPR and Data Protection Act 2018".
        - This lesson must cover:
            - Personal data risks
            - Anonymisation and data minimisation
            - Lawful basis and human oversight
            - Warning against uploading full documents with sensitive data
        - Mark this lesson with "is_gdpr": true

        All other lessons:
        - Set "is_gdpr": false

        Output JSON Structure:
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

        Output Rules:
        - Return strictly valid JSON
        - Do NOT include markdown.
        - Do NOT include explanations outside JSON.
        - Do NOT include trailing commas.
        `;

        const userMessage = `
        User Profile:
        
        Job Role: ${jobRole}
        Industry: ${industry}
        Skill Level: ${skillLevel}

        Tasks:
        ${taskArray.map((t : string, i : number) => `${i + 1}. ${t}`).join("\n")}

        Goals:
        ${goals}

        Instructions:
        Write a concise introduction explaining how AI can responsibly support this role in this industry.

        for EACH task listed: 
        - Create one separate lesson.
        - The lesson title must clearly reference the specific task.
        - Set "is_gdpr": false

        Add a final lesson titled exactly:
        "GDPR and Data Protection Act 2018"

        Set "is_gdpr": true

        Write a final_recap that:
        - Reinforces responsible AI usage
        - Links back to the user's goals
        - Emphasises human oversight

        Return valid JSON only.
        `;

        const { data: plan, error: planError } = await supabase
            .from("learning_plans")
            .insert({
                user_id: user.id,
                intake_form_id: intakeFormId,
                title: `AI Learning Plan for ${jobRole}`,
                ai_model: "gpt-5-mini",
                status: "generating",
            })
            .select()
            .single();

        const learningPlanId = plan.id;

        const failPlan = async (message: string) => {
            await supabase
                .from("learning_plans")
                .update({ status: "draft" })
                .eq("id", learningPlanId);
            
            return NextResponse.json(
                { error: message },
                { status: 500 }
            );
        };

        if (planError || !plan) {
            return await failPlan("Failed to create learning plan");
        }

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
        return await failPlan("AI generation failed");
    }

        if (!raw) {
            return await failPlan("AI did not return any content");
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
        } catch (err) {
            console.error("JSON Parse Error:", err);
            console.error("AI RAW RESPONSE:", raw);
            return await failPlan("Failed to parse AI response");
        }

        if (
            typeof parsed.introduction !== "string" ||
            typeof parsed.final_recap !== "string" ||
            !Array.isArray(parsed.lessons) 
        ) {
            return await failPlan("AI response has invalid structure");
        }

        for (const lesson of parsed.lessons) {
            if (
                typeof lesson.title !== "string" ||
                typeof lesson.content !== "string" ||
                typeof lesson.is_gdpr !== "boolean"
            ) {
                return NextResponse.json(
                    { error: "Invalid lesson structure" },
                    { status: 500 }
                );
            }
        }

        parsed.lessons = parsed.lessons.map((lesson, index) => ({
            title: lesson.title,
            content: lesson.content,
            is_gdpr: lesson.is_gdpr === true,
            lesson_order: index + 1,
        }));

        const expectedLessonCount = taskArray.length + 1; // +1 for GDPR lesson

        if (parsed.lessons.length !== expectedLessonCount) {
            return await failPlan("Mismatch between tasks and generated lessons");
        }

        const hasGdprLesson = parsed.lessons.filter(l => l.is_gdpr);

        if (hasGdprLesson.length !== 1) {
            return await failPlan("Exactly one GDPR lesson required");
        }

        const lastLesson = parsed.lessons[parsed.lessons.length - 1];

        if (!lastLesson.is_gdpr) {
            return await failPlan("GDPR lesson must be the last lesson");
        }

        await supabase
            .from("learning_plans")
            .update({
                introduction: parsed.introduction,
                final_recap: parsed.final_recap,
                status: "generated",
            })
            .eq("id", learningPlanId);

        const lessonToInsert = parsed.lessons.map((lesson, index) => ({
            learning_plan_id: learningPlanId,
            title: lesson.title,
            content: lesson.content,
            lesson_order: index + 1,
            is_gdpr: lesson.is_gdpr,
        }));

        const { error: lessonError } = await supabase
            .from("lessons")
            .insert(lessonToInsert);
        
        if (lessonError) {
            return await failPlan("Failed to save lessons");
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