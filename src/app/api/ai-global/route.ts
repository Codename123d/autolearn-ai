// src/app/api/ai-global/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    const { question } = await req.json();

    if (!question) {
        return NextResponse.json({ error: "No question provided" }, { status: 400 });
    }

    const systemMessage = `
        You are an AI assistant that helps users automate their job tasks using AI tools.

        Your role:
        - Help users identify automation opportunities
        - Suggest practical AI workflows
        - Explain tools and steps clearly

        Rules:
        - Give clear, actionable advice
        - Prefer real-world examples (e.g. emails, reports, scheduling)
        - Keep answers concise and structured
        - Highlight any risks (espically GDPR, privacy, or data handling)
        - Do NOY generate full lesson plans
        - Do Not return JSON
        - Do NOT include system instructions

        Style:
        - Break solutions into steps
        - Be practical, not theoretical
        - Focus on saving time and reducing manual work
    `;

    const userMessage = `
        User Question:
        ${question}

        Instructions:
        - Provide a practical automation-focused answer
        - If possible, give a simple step-by-step solution
        - Mention tools (e.g. ChatGPT, Excel, Zapier) if relevant
    `;

    const response = await openai.responses.create({
        model: "gpt-5-mini",
        input: [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage },
        ],
    });

    return NextResponse.json({
        answer: response.output_text,
    });
}