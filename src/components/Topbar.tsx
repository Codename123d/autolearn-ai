// src/components/Topbar.tsx
"use client";

import { Search, HelpCircle, User, X, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type TopbarProps = {
    title: string;
};

export default function Topbar({ title }: TopbarProps) {

    const supabase = useMemo(() => createClient(), []); // create client once

    type SearchResult = {
        id: string; // plan id (for plans)
        title: string;
        type: "plan" | "lesson";
        lessonId?: string; // only for lessons
        planId?: string; // only for lessons
    };

    const router = useRouter();
    const [query, setQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

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

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        setLoading(true);

        const delay = setTimeout(async () => {
            try{
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data.results);
            } catch (err) {
                console.error("Search error:", err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        },  300);
        
        return () => clearTimeout(delay);
    }, [query]);

    async function handleLogout() {
        setMenuOpen(false);

        await supabase.auth.signOut();

        router.push("/login");
        router.refresh(); // ensures server state resets
    }

    return (
        <header className="h-20 bg-gradient-to-r from-indigo-500 to-cyan-400 flex items-center justify-between px-8 text-white">
            {/* Page Title */}
            <h1 className="text-2xl font-semibold">{title}</h1>

            {/* Actions */}
            <div className="flex items-center gap-4 relative">
                {/* Search */}
                <div className="relative">
                    <div className="flex items-center bg-white/20 rounded-lg px-3 py-2 gap-2">
                        <Search className="w-4 h-4" />

                        <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => {
                            if (e.key === "Enter" && query.trim()) {
                                router.push(`/search?q=${encodeURIComponent(query)}`);
                                setQuery("");
                                setResults([]);
                            }

                            if (e.key === "Escape") {
                                setQuery("");
                                setResults([]);
                            }
                        }}
                        placeholder="Search..."
                        className="bg-transparent outline-none placeholder-white/70 text-sm w-40" />

                        {query && (
                            <button title="Clear Search" onClick={() => {
                                setQuery("");
                                setResults([]);
                            }}>
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* loading */}
                    {loading && (
                        <div className="absolute top-full mt-2 w-60 bg-white text-gray-500 rounded-lg shadow p-3 text-sm">
                            Searching...
                        </div>   
                    )}
                    
                    {/* Results */}
                    {!loading && results.length > 0 && (
                        <div className="absolute top-full mt-2 w-60 bg-white text-black rounded-lg shadow z-50">
                            {results.map((item) => (
                                <Link key={item.id} href={
                                    item.type === "plan"
                                        ? `/learning-plans/${item.id}`
                                        : `/learning-plans/${item.planId}?lesson=${item.lessonId}`
                                } className="block px-3 py-2 hover:bg-gray-100" onClick={() => {
                                    setQuery("");
                                    setResults([]);
                                }}>
                                    <span className="font-medium">{item.title}</span>

                                    <div className="text-xs text-gray-500">
                                        {item.type === "plan" ? "Learning Plan" : "Lesson"}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* No results */}
                    {!loading && query && results.length === 0 && (
                        <div className="absolute top-full mt-2 w-60 bg-white text-gray-500 rounded-lg shadow p-3 text-sm">
                            No results found.
                        </div>   
                    )}
                </div>
                
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
                                handleLogout();
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