// src/components/Sidebar.tsx
"use client";
import { LayoutGrid, PlusSquare, BookOpen, ClipboardList, BarChart2, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col">
            {/* Logo */}
            <div className="h-20 flex items-center gap-3 px-6 text-2xl font-semibold">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
                    Ai
                </div>
                <span>AutoLearn</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 text-sm">
                <SidebarLink href="/dashboard" icon={<LayoutGrid size={18} />} label="Dashboard" pathname={pathname} />
                <SidebarLink href="/create-plan" icon={<PlusSquare size={18} />} label="Create Plan" pathname={pathname} />
                <SidebarLink href="/library" icon={<BookOpen size={18} />} label="Library" pathname={pathname} />
                <SidebarLink href="/quiz" icon={<ClipboardList size={18} />} label="quiz" pathname={pathname} />
                <SidebarLink href="/analytics" icon={<BarChart2 size={18} />} label="Analytics" pathname={pathname} />
            </nav>
            <div className="px-4 py-4 border-t border-white/10">
                <SidebarLink href="/settings" icon={<Settings size={18} />} label="Settings" pathname="{pathname}" />
            </div>
        </aside >
    );
}

function SidebarLink({ href, icon, label, pathname }: { href: string; icon : React.ReactNode; label: string; pathname: string }) {
    const active = pathname === href;
    return (
        <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${ active ? "bg-white/10" : "hover:bg-white/5"}`}>
            {icon}
            <span>{label}</span>
        </Link>
    );
}