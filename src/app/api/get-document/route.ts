// src/app/api/get-document/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("id");

    if (!documentId) {
        return NextResponse.json({ error: "Missing document ID" }, { status: 400 });
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: doc } = await supabase
        .from("uploaded_documents")
        .select("id, redacted_text, extracted_text, status")
        .eq("id", documentId)
        .eq("user_id", user.id)
        .single();

    if (!doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    
    // choose best available text
    const content = doc.redacted_text || doc.extracted_text || "";
    
    return NextResponse.json({ content, status: doc.status });
}