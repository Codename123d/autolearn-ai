// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import mammoth from "mammoth";
const pdf = require("pdf-parse");

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
            const data = await pdf(buffer);
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

        return NextResponse.json({
            success: true,
            extractedText,
        });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
    }
}