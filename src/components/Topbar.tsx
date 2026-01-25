// src/components/Topbar.tsx
"use client";

import { Search, HelpCircle, User, X, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type TopbarProps = {
    title: string;
};

export default function Topbar({ title }: TopbarProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="h-20 bg-gradient-to-r from-indigo-500 to-cyan-400 flex items-center justify-between px-8 text-white">
            {/* Page Title */}
            <h1 className="text-2xl font-semibold">{title}</h1>

            {/* Actions */}
            <div className="flex items-center gap-4 relative">

                {/* Search */}
                {searchOpen ? (
                    <div className="flex items-center bg-white/20 rounded-lg px-3 py-2 gap-2">
                        <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="bg-transparent outline-none placeholder-white/70 text-sm w-40"/>    
                        <button title="Close search" onClick={() => setSearchOpen(false)}>
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button title="Open search" onClick={() => setSearchOpen(true)} className="hover:bg-white/20 p-2 rounded-lg transition">
                        <Search className="w-5 h-5" />
                    </button>
                )}
                
                {/* Divider */}
                <div className="h-6 w-px bg-white/30" />

                {/* Help */}
                <Link href="/help" className="hover:bg-white/20 p-2 rounded-lg transition" title="Help & Support">
                    <HelpCircle className="w-5 h-5" />
                </Link>

                {/* Avatar + Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen((prev) => !prev)} className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/40 transition" title="User menu">
                        <User className="w-5 h-5" />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-3 w-44 bg-white text-slate-700 rounded-xl shadow-lg overflow-hidden z-50">
                            <Link href="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 transition text-sm" onClick={() => setMenuOpen(false)}>
                                <User size={16} /> Profile
                            </Link>   

                            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 transition text-sm" onClick={() => setMenuOpen(false)}>
                                <Settings size={16} /> Settings
                            </Link>

                            <div className="border-t" />

                            <button onClick={() => {
                                setMenuOpen(false);
                                console.log("Logout clicked");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition text-sm">
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}