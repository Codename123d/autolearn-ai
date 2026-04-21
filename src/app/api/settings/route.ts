// src/app/api/settings/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

// GET -> Load settings
export async function GET() {
    const supabase = await createSupabaseServer();

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authData.user.id;

    const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (error && error.code !== "PGRST116") {
        return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
    }

    // If no settings exist -> create defaults
    if (!data) {
        const { data: newSettings } = await supabase
            .from("settings")
            .insert({
                id: userId,
                dark_mode: false,
                email_notifications: true,
                data_consent: true,
            })
            .select("*")
            .single();

        return NextResponse.json({ settings: newSettings });
    }

    return NextResponse.json({ settings: data });
}

// PUT -> Update settings
export async function PUT(req: Request) {
    const supabase = await createSupabaseServer();

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authData.user.id;    

    const body = await req.json();

    if (!body.input || typeof body.input !== "string") {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { darkMode, emailNotifications, dataConsent } = body;

    if (
        typeof darkMode !== "boolean" ||
        typeof emailNotifications !== "boolean" ||
        typeof dataConsent !== "boolean"
    ) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { error } = await supabase
        .from("settings")
        .upsert({
            id: userId,
            dark_mode: darkMode,
            email_notifications: emailNotifications,
            data_consent: dataConsent,
            consent_updated_at: new Date(),
        });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}