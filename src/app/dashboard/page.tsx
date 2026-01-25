// src/app/dashboard/page.tsx
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-blue--500 to-cyan-400 p-6">
            <div className="flex h-full w-full rounded-3xl overflow-hidden bg-white shadow-2xl">

                {/* Sidebar */}
                <Sidebar />

                {/* Main area */}
                <div className="flex-1 flex flex-col">

                    {/* Topbar */}
                    <Topbar title="Dashboard" />

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