// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import mammoth from "mammoth";
import * as pdf from "pdf-parse";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

function parseDocument(text: string) {
    const lines = text.split("\n").map(l => l.trim());

    let jobRole = "";
    let tasks: string[] = [];
    let goals: string[] = [];

    let currentSection: "tasks" | "goals" | null = null;

    for (const line of lines) {
        // Extract job role
        if (line.startsWith("Job Role:")) {
            jobRole = line.replace("Job Role:", "").trim();
            continue;
        }

        // Detect section start
        if (line.startsWith("Tasks:")) {
            currentSection = "tasks";
            continue;
        }

        if (line.startsWith("Goals:")) {
            currentSection = "goals";
            continue;
        }

        // stop section if blank line
        if (line === "") {
            currentSection = null;
            continue;
        }

        // Collect data
        if (currentSection === "tasks") {
            tasks.push(line);
        }
        if (currentSection === "goals") {
            goals.push(line);
        }
    }

    return { jobRole, tasks, goals };
}

function redactPII(text: string): string {
    return text

        // Emails
        .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]")

        // Phone numbers (UK + general)
        .replace(/(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}/g, "[REDACTED_PHONE]")

        // Basic address detection (very rough)
        .replace(/\d{1,3}\s+\w+\s+(Street|St|Road|Rd|Avenue|Ave|Lane|Ln)/gi, "[REDACTED_ADDRESS]")

        // Names ONLY when Labelled
        .replace(/^(.*name.*:).*/gim, "$1 [REDACTED_NAME]");
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const fileType = file.type;
        console.log("File type:", fileType);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let extractedText = "";

        // TXT
        if (fileType === "text/plain") {
            extractedText = buffer.toString("utf-8");
        }

        // PDF
        else if (fileType === "application/pdf") {
            const data = await (pdf as any)(buffer);
            extractedText = data.text;
        }

        // DOCX
        else if (fileType.includes("wordprocessingml")) {
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value;
        }

        else {
            return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
        }

        console.log("Extracted text:", extractedText);

        const parsed = parseDocument(extractedText);

        const redactedText = redactPII(extractedText);

        console.log("Redacted text:", redactedText);

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get: (name: string) => {
                        return cookieStore.get(name)?.value;
                    }
                },
            }
        );

        // get user
        const { data: { user } } = await supabase.auth.getUser();

        const { data: doc, error } = await supabase
            .from("uploaded_documents")
            .insert({
                user_id: user?.id,
                file_name: file.name,
                extracted_text: extractedText,
                redacted_text: redactedText,
                parsed_data: parsed, 
            })
            .select()
            .single();

        console.log("Inserted doc:", doc);

        if (error || !doc) {
            console.error(error);
            return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            documentId: doc.id,
            parsed
        });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
    }
}