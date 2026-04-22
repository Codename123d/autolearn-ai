// src/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";

const PUBLIC_ROUTES = ["/", "/help", "/about"];
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

export async function middleware(req: NextRequest) {
    const res = NextResponse.next({
            request: {
                headers: req.headers,
            },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    res.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    res.cookies.set({ name, value: "", ...options });
                },
            },
        }
    );

    // SECURE auth validation
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = req.nextUrl.pathname;

    const isPublic = 
        pathname === "/" ||    
        PUBLIC_ROUTES
            .filter(route => route !== "/")
            .some(route => pathname === route || pathname.startsWith(route + "/"));

    const isAuthRoute = AUTH_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );

    /* ---------------------------------------------------
        Logged-in user hits /login or /register
    --------------------------------------------------- */
    if (user && isAuthRoute) {
        const redirectTo =
            req.nextUrl.searchParams.get("redirectTo") || "/dashboard";

        return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    /* ---------------------------------------------------
        NOT logged in & accessing a PROTECTED route
    --------------------------------------------------- */
    if (!user && !isPublic && !isAuthRoute) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set(
            "redirectTo",
            pathname
        );

        return NextResponse.redirect(loginUrl);
    }

    return res;
}

export const config = {
    matcher: ["/((?!_next|favicon.ico|api).*)"],
};