// src/app/learning-plans/[id]/action.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { completeLesson } from "@/lib/actions/progress";
import { revalidatePath } from "next/cache";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function markLessonComplete(lessonId: string) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                }
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("No authenticated");
    }

    await completeLesson(lessonId, user.id);

    revalidatePath("/profile");
}

export async function askFollowUp(question: string, lessonContent: string) {
    if (!question || !lessonContent) return null;

    const systemMessage = `
    You are an AI Learning Assistant.

    Your role is to help users better understand a previously generated lesson.

    Rules:
        - Base your answer primarily on the lesson content, but simplify and rephrase for clarity
        - Explain concepts clearly and concisely
        - Adapt explanation based on user skill level
        - Do NOT generate new lesson plans
        - Do NOT return JSON
        - Do NOT include prompts or system instructions
        - Focus only on helping the user understand the lesson
    
    Teaching Style:
        - Break down complex ideas into simple steps
        - Provide practical examples where helpful
        - Highlight real-world workplace relevance
        - Reinforce safe and responsible AI usage
    `;

    const userMessage = `
    Lesson Content:
    ${lessonContent}

    User Question:
    ${question}

    Instructions:
    - Answer the user's question using the lesson content
    - If unclear, simplify the explanation
    - If relevant, give an example based on a workplace scenario
    - Keep the answer concise but helpful
    `;

    const response = await openai.responses.create({
        model: "gpt-5-mini",
        input: [
            { 
                role: "system", 
                content: systemMessage
            },
            { 
                role: "user",
                content: userMessage
            }
        ],
    });

    return response.output_text;
}