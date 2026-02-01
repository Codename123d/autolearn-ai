// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
    const { email, password } = await request.json();
    const supabase = await createSupabaseServer();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user });
}