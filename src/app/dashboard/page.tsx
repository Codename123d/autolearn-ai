// src/app/dashboard/page.tsx
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { requireUser } from "@/lib/auth/requireUser";
import UploadElement from "@/components/UploadElement";
import GlobalAIBox from "@/components/GlobalAIBox";

export default async function DashboardPage() {
    const { user, supabase } = await requireUser("/dashboard");

    // Fetch user plans
    const { data: plans } = await supabase
        .from("learning_plans")
        .select(`id, title, created_at, status, lessons (id)`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

    let allLessons: { id: string; learning_plan_id: string; lesson_order: number; title: string }[] = [];
    
    // Get ALL lessons for these plans
    if (plans && plans.length > 0) {
        const { data } = await supabase
            .from("lessons")
            .select("id, learning_plan_id, lesson_order, title")
            .in("learning_plan_id", plans.map(p => p.id))
            .order("lesson_order", { ascending: true });

        allLessons = data || [];
    }
    
    // Get progress
    const { data: allProgress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id);
    
    // Calculate stats
    const totalLessons = allLessons?.length || 0;

    const completedLessons = allLessons?.filter(lesson =>
        allProgress?.some(p => p.lesson_id === lesson.id && p.completed)
    ).length || 0;

    const nextLesson = allLessons.find(lesson => {
           if (!allProgress) return true;
            
            return !allProgress.some(
                p => p.lesson_id === lesson.id && p.completed
            );
    });

    const safePlans = plans ?? [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 p-6">
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
                            <a href="/create-plan" className="block w-full py-4 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-2xl text-lg font-medium text-center">
                                + Create New Plan
                            </a>

                            <h3 className="text-sm text-gray-500">
                                Continue where you left off or review recent plans.
                            </h3>

                            <Card title="Recent Plans">
                                {plans?.length ? (
                                    safePlans.map((plan) => {
                                        const planLessons = allLessons.filter(l => l.learning_plan_id == plan.id);

                                        const completed = planLessons.filter(l => 
                                            allProgress?.some(p => p.lesson_id === l.id && p.completed)
                                        ).length;

                                        const total = planLessons.length;

                                        return (
                                            <PlanItem key={plan.id} id={plan.id} title={plan.title} meta={`${completed}/${total} completed`} />
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        No plans yet
                                    </p>
                                )}
                            </Card>
                            
                            {nextLesson && (
                                <Card title="Resume Learning">
                                    <p className="text-sm text-gray-500 mb-2">
                                        Pick up where you left off
                                    </p>

                                    <a href={`/learning-plans/${nextLesson.learning_plan_id}`} className="block bg-indigo-500 text-white text-center py-3 rounded-lg hover:bg-indigo-600 transition">
                                        Resume: {nextLesson.title} ({completedLessons} /{totalLessons}) →
                                    </a>
                                </Card>
                            )}

                        </section>

                        {/* Middle column */}
                        <section className="space-y-6">
                            <Card title="Automation Guide">
                                <StepItem step="Step 1" text="Identify repetitive weekly tasks." />
                                <StepItem step="Step 2" text="Generate AI automation plan" />
                                <StepItem step="Step 3" text="Draft AI-assisted outputs" />
                            </Card>

                            <Card title="Skill Baseline Quiz" badge="Must Have">
                                <p className="text-sm text-gray-600 mb-4">
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
                                <GlobalAIBox />
                            </Card>

                            <Card title="Upload Job Document">
                                <UploadElement />
                            </Card>

                            <Card title="Quick Stats">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <Stat label="Plans" value={plans?.length || 0} />
                                    <Stat label="Lessons Done" value={completedLessons} />
                                    <Stat label="Total Lessons" value={totalLessons} />
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

function PlanItem({ id, title, meta }: any) {
    return (
        <a href={`/learning-plans/${id}`} className="flex justify-between items-center py-3 border-b last:border-none hover:bg-gray-50 px-2 rounded">
            <span className="text-sm">{title}</span>
            <span className="text-sm text-gray-500">{meta}</span>
        </a>
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