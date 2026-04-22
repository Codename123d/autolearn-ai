// src/app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleReset() {
        setLoading(true);
        setMessage("");

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("Check for your email for reset link.");
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-cyan-400">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>

                <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg mb-4"/>

                <button onClick={handleReset} disabled={loading} className="w-full bg-indigo-500 text-white py-3 rounded-lg">
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>

                {message && (
                    <p className="mt-4 text-sm text-gray-600">{message}</p>
                )}
            </div>
        </div>
    );
}