// src/lib/auth/requireUser.ts
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function requireUser(redirectPath?: string) {
    const supabase = await createSupabaseServer();

    const {
        data: { user },
        error
    } = await supabase.auth.getUser();

    if (!user || error) {
        const redirectTo = redirectPath 
            ? `?redirectTo=${encodeURIComponent(redirectPath)}`
            : "";

        redirect(`/login${redirectTo}`)
    };

    return { user, supabase };
}