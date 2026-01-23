// src/components/LoginCard.tsx
"use client";

import { Mail, Lock, Eye } from "lucide-react";

export default function LoginCard() {
    return (
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Form */}
            <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-8">Sign in</h1>

                {/* Email */}
                <div className="mb-5 relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" placeholder="Email address" className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                {/* Password */}
                <div className="mb-5 relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="password" placeholder="Password" className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <Eye className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" />
                </div>

                {/* Remember / Forgot */}
                <div className="flex items-center justify-between text-sm mb-8">
                    <label className="flex items-center gap-2 text-slate-600">
                        <input type="checkbox" className="rounded" /> Remember me
                    </label>
                    <a href="#" className="text-indigo-600 hover:underline">
                        Forgot password?
                    </a>
                </div>

                {/* Sign In Button */}
                <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg shadow-md hover:opacity-90 transition">
                    Sign In
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-slate-400 text-sm">OR</span>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Social Buttons */}
                <button className="w-full border border-slate-200 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 mb-3">
                    <img src="/logos/google-icon-svgrepo-com.svg" alt="Google" className="w-5 h-5" />
                    <span className="font-medium">Sign in with Google</span>
                </button>

                <button className="w-full border border-slate-200 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50">
                    <img src="/logos/facebook-icon-logo-svgrepo-com.svg" alt="Facebook" className="w-5 h-5" />
                    <span className="font-medium">Sign in with Facebook</span>
                </button>

                {/* SignUp */}
                <p className="text-center text-sm text-gray-600 mt-8">
                    Don't have an account?{" "}
                    <a href="#" className="text-indigo-600 hover:underline">
                        Sign up
                    </a>
                </p>
            </div>

            {/* Right: Illustration */}
            <div className="hidden md:flex items-center justify-center">
                <img src="/logos/avatar image.png" alt="Login Illustration" className="w-full max-w-sm" />
            </div>
        </div>
    );
}