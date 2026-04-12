// src/lib/supabase/persistentClient.ts
import { createBrowserClient } from "@supabase/ssr";

export const persistentClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            persistSession: true, // stays logged in
            autoRefreshToken: true, // automatically refreshes tokens
        },
    }
);