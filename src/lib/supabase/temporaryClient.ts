// src/lib/supabase/temporaryClient.ts
import { createBrowserClient } from "@supabase/ssr";

export const temporaryClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            persistSession: false, // does NOT stay logged in
            autoRefreshToken: false, // does NOT automatically refresh tokens
        },
    }
);