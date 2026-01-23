// src/app/dashboard/page.tsx
import { Search, HelpCircle, User, LayoutGrid, PlusSquare, BookOpen, ClipboardList, BarChart2, Settings, Sidebar } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-blue--500 to-cyan-400 p-6">
            <div className="flex h-full w-full rounded-3xl overflow-hidden bg-white shadow-2xl">
                {/* Sidebar */}
                <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col">
                    <div className="h-20 flex items-center gap-3 px-6 text-2xl font-semibold">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
                            Ai
                        </div>
                        <span>AutoLearn</span>
                    </div>

                    <nav className="flex-1 px-4 space-y-2 text-sm">
                        <SidebarItem icon={<LayoutGrid size={18} />} label="Dashboard" active />
                        <SidebarItem icon={<PlusSquare size={18} />} label="Create Plan" />
                        <SidebarItem icon={<BookOpen size={18} />} label="Library" />
                        <SidebarItem icon={<ClipboardList size={18} />} label="Quizzes" />
                        <SidebarItem icon={<BarChart2 size={18} />} label="Analytics" />
                    </nav>
                    <div className="px-4 py-4 border-t border-white/10">
                        <SidebarItem icon={<Settings size={18} />} label="Settings" />
                    </div>
                </aside>

                {/* Main area */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="h-20 bg-gradient-to-r from-indigo-500 to-cyan-400 flex items-center justify-between px-8 text-white">
                        <h1 className="text-2xl font-semibold">Dashboard</h1>
                        <div className="flex items-center gap-6">
                            <Search className="w-5 h-5" />
                            <HelpCircle className="w-5 h-5" />
                            <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                        </div>
                    </header>

                {/* Content */}
                <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-slate-50">
                    {/* Left column */}
                    <section className="space-y-6">
                        <button className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-2xl text-lg font-medium">
                            + Create New Plan
                        </button>

                        <Card title="Recent Plans">
                            <PlanItem title="Better progress reports" meta="20 min" />
                            <PlanItem title="Urgent planning" meta="40 min" />
                            <PlanItem title="Task time scoring" meta="Weekly" />
                        </Card>
                    </section>

                    {/* Middle column */}
                    <section className="space-y-6">
                        <Card title="Automation Guide">
                            <StepItem step="Step 1" text="Identify repetitive weekly tasks." />
                            <StepItem step="Step 2" text="Generate AI automation plan" />
                            <StepItem step="Step 3" text="Draft AI-assisted outputs" />
                        </Card>

                        <Card title="Skill Baseline Quiz" badge="Must Have">
                            <p className="text-sm text-gray-600" mb-4>
                                Assess your current skills to tailor your learning plan.
                            </p>
                            <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg">
                                Start Quiz
                            </button>
                        </Card>
                    </section>

                    {/* Right column */}
                    <section className="space-y-6">
                        <Card title="AI Assistant">
                            <p className="text-sm text-gray-600">
                                How can I automate a sceduling meetings?
                            </p>
                        </Card>

                        <Card title="Upload Job Document">
                            <p className="text-sm text-gray-500 mb-4">
                                Drag and drop or browse
                            </p>
                            <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg">
                                Extract Tasks
                            </button>
                        </Card>

                        <Card title="Quick Stats">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <Stat label="Plans" value="4" />
                                <Stat label="Complete" value="75%" />
                                <Stat label="Time" value="34h" />
                            </div>
                        </Card>
                    </section>
                </main>
            </div>
        </div>
    </div>
    );
}

function SidebarItem({ icon, label, active = false }: any) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition ${active ? "bg-white/10" : "hover:bg-white/5"}`}>
            {icon}
            <span>{label}</span>
        </div>
    );
}

function Card({ title, children, badge }: any) {
    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">{title}</h2>
                {badge && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        {badge}
                    </span>
                )}
            </div>
            {children}
        </div>
    );
}

function PlanItem({ title, meta }: any) {
    return (
        <div className="flex justify-between items-center py-3 border-b last:border-none">
            <span className="text-sm">{title}</span>
            <span className="text-sm text-gray-500">{meta}</span>
        </div>
    );
}

function StepItem({ step, text }: any) {
    return (
        <div className="mb-4">
            <p className="text-sm font-medium">{step}</p>
            <p className="text-sm text-gray-600">{text}</p>
        </div>
    );
}

function Stat({ label, value }: any) {
    return (
        <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    );
}