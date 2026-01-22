import { Search, HelpCircle, User, LayoutGrid, PlusSquare, BookOpen, ClipboardList, BarChart2, Settings } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col">
                <div className="h-16 flex items-center justify-center text-2xl font-bold">AI</div>
                <nav className="flex-1 px-4 space-y-2">
                    <SidebarItem label="Dashboard" />
                    <SidebarItem label="Create Plan" />
                    <SidebarItem label="Library" />
                    <SidebarItem label="Quizzes" />
                </nav>
                <div className="p-4 border-t border-white/10">Settings</div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="h-16 bg-gradient-to-r from-indigo-500 to-cyan-400 flex items-center justify-between px-6 text-white">
                    <h1 className="text-xl font-semibold">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <Search className="w-5 h-5" />
                        <HelpCircle className="w-5 h-5" />
                        <User className="w-8 h-8 rounded-full bg-white/30 p-1" />
                    </div>
                </header>

                {/* Dashboard grid */}
                <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column */}
                    <section className="lg:col-span-1 space-y-4">
                        <button className="w-full py-3 bg-indigo-500 text-white rounded-xl text-lg font-medium">
                            + Create New Plan
                        </button>

                        <Card title="Recent Plans">
                            <PlanItem title="Better progress reports" meta="20 min" />
                            <PlanItem title="Urgent planning" meta="40 min" />
                            <PlanItem title="Task time scoring" meta="Weekly" />
                        </Card>
                    </section>

                    {/* Middle column */}
                    <section className="lg:col-span-1 space-y-4">
                        <Card title="Automation Guide">
                            <StepItem step="Step 1" text="Identify repetitive weekly tasks." />
                            <StepItem step="Step 2" text="Generate AI automation plan" />
                            <StepItem step="Step 3" text="Draft AI-assisted outputs" />
                        </Card>

                        <Card title="Skill Baseline Quiz" badge="Must Have">
                            <button className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg">
                                Start Quiz
                            </button>
                        </Card>
                    </section>

                    {/* Right column */}
                    <section className="lg:col-span-1 space-y-4">
                        <Card title="AI Assistant">
                            <p className="text-sm text-gray-600">
                                How can I automate a sceduling meetings?
                            </p>
                        </Card>

                        <Card title="Upload Job Document">
                            <button className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg">
                                Extract Tasks
                            </button>
                        </Card>

                        <Card title="Quick Stats">
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>Total plans: 4</li>
                                <li>Completion: 75%</li>
                                <li>Time saved: 34h</li>
                            </ul>
                        </Card>
                    </section>
                </main>
            </div>
        </div>
    );
}

function SidebarItem({ label }: { label: string }) {
    return (
        <div className="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer">
            {label}
        </div>
    );
}

function Card({ title, children, badge }: any) {
    return (
        <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">{title}</h2>
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
        <div className="flex justify-between py-2 border-b last:border-none">
            <span>{title}</span>
            <span className="text-sm text-gray-500">{meta}</span>
        </div>
    );
}

function StepItem({ step, text }: any) {
    return (
        <div className="mb-2">
            <p className="text-sm font-medium">{step}</p>
            <p className="text-sm text-gray-600">{text}</p>
        </div>
    );
}