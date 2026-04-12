// src/components/RegisterCard.tsx
"use client";
import { User, Mail } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Strength = {
    label: string;
    percentage: number;
    color: string;
};

function getPasswordStrength(password: string): Strength {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
        return { label: "Weak", percentage: 33, color: "bg-red-500" };
    }

    if (score === 2 || score === 3) {
        return { label: "Medium", percentage: 66, color: "bg-yellow-500" };
    }

    return { label: "Strong", percentage: 100, color: "bg-green-500" };
}

export default function RegisterCard() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const strength = getPasswordStrength(password);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    async function handleRegister() {
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            router.push("/login?redirectTo=/dashboard");
        }

        setLoading(false);
    }

    return (
        <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-[0_40px_90px_rgba(0,0,0,0.15)] p-12 grid grid-cols-1 md:grid-cols-2 gap-2">

            {/* Left: Form */}
            <div>
                <h1 className="text-4xl font-bold text-slate-800">Create Account</h1>
                <p className="text-slate-500 mt-2">
                    Join our AI learning platform
                </p>

                <form className="mt-8 space-y-5">

                    {/* Full Name */}
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Full Name" className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="email" placeholder="Email address" value={email} className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none" onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    {/* Password */}
                    <div>
                        <input type="password" placeholder="Password" value={password} className="w-full px-4 py-4 rounded-xl bg-slate-50 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none" onChange={(e) => setPassword(e.target.value)} />
                        {/* Strength Bar */}
                        <div className="mt-2 flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.percentage}%` }} />
                            </div>
                            <span className="text-sm text-slate-500 min-w-[60px]">
                                {strength.label}
                            </span>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    {/* Terms */}
                    <label className="flex items-center gap-3 text-sm text-slate-600">
                        <input type="checkbox" className="accent-indigo-600 w-4 h-4" />
                        I agree to the{""}
                        <span className="text-indigo-600 font-medium cursor-pointer">
                            Terms of Service
                        </span>
                    </label>

                    {/* Create Account */}
                    <button type="button" onClick={handleRegister} disabled={loading} className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold shadow-lg hover:opacity-90 transition">
                        Create Account
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 text-slate-400 text-sm">
                        <div className="flex-1 h-px bg-slate-200" />
                        OR
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Google */}
                    <button className="w-full py-3 rounded-xl border flex items-center justify-center gap-3 hover:bg-slate-50 transition">
                        <img src="/logos/google-icon-svgrepo-com.svg" alt="Google" className="w-5 h-5" />
                        Sign up with Google
                    </button>

                    {/* Facebook */}
                    <button className="w-full py-3 rounded-xl border flex items-center justify-center gap-3 hover:bg-slate-50 transition">
                        <img src="/logos/facebook-icon-logo-svgrepo-com.svg" alt="Facebook" className="w-5 h-5" />
                        Sign up with Facebook
                    </button>
                </form>
            </div>

            {/* Right: Illustration */}
            <div className="hidden md:flex items-center justify-center">
                <img src="/logos/avatar image.png" alt="Login Illustration" className="w-full max-w-sm" />
            </div>

        </div>
    );
}