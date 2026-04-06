// src/app/api/save-clean-text/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { docId, finalText } = await req.json();

        if (!docId || !finalText || finalText.trim().length < 10) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const cookieStore = await cookies();

        const supabase = await createServerClient(
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

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { error } = await supabase
            .from("uploaded_documents")
            .update({ final_text: finalText })
            .eq("id", docId)
            .eq("user_id", user.id);

        if (error) {
            console.error(error);
            return NextResponse.json(
                { error: "Failed to save document" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}