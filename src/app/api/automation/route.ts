// src/app/api/automation/route.ts
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    const { tasks } = await req.json();

    const systemMessage = `
    You are an AI Automation Assistant.

    Your role:
    - Convert user job tasks into automation opportunities
    - Suggest AI tools or workflows
    - Keep it simple and practical

    Rules:
    - Do NOT be vague
    - Focus on workplace productivity
    - Keep response structured
    `;

    const userMessage = `
    Tasks:
    ${tasks}

    Instructions:
    - Identify repetitive tasks
    - Suggest automation ideas
    - Give simple step-by-step improvements
    `;

    const response = await openai.responses.create({
        model: "gpt-5-mini",
        input: [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage },
        ],
    });

    return Response.json({
        output: response.output_text,
    });
}