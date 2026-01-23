// src/components/RegisterCard.tsx
import { User, Mail, Building } from "lucide-react";

export default function RegisterCard() {
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
                        <input type="email" placeholder="Email address" className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
                    </div>

                    {/* Password */}
                    <div>
                        <input type="password" placeholder="Password" className="w-full px-4 py-4 rounded-xl bg-slate-50 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                        <div className="flex items-center justify-between mt-2 text-sm">
                            <div className="h-1 w-2/3 bg-indigo-500 rounded-full" />
                            <span className="text-slate-400">Weak</span>
                        </div>
                    </div>

                    {/* Organization */}
                    <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Organization (optional)" className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>

                    {/* Terms */}
                    
                </form>
            </div>
        </div>
    );
}