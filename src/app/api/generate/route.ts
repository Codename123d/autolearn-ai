import { NextResponse } from "next/server";
import OpenAi from "openai"

const openai = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
    try {
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
        - Job role: {{jobTitle}}
        - Industry: {{industry}}
        - Experience level: {{experienceLevel}}
        - Technical skill level: {{skillLevel}}

        Job tasks:
        {{taskList}}

        Goals:
        {{goals}}

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

        return NextResponse.json({
            content: completion.choices[0].message.content,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to generate content" },
            { status: 500 }
        );
    }
}