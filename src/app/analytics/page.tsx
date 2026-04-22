// src/app/analytics/page.tsx
import { requireUser } from "@/lib/auth/requireUser";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { StatCardProps } from "@/types";

export default async function AnalyticsPage() {
    const { user, supabase } = await requireUser();

    // Fetch plans
    const { data: plans } = await supabase
        .from("learning_plans")
        .select("id");

    // Fetch lessons
    const { data: lessons } = await supabase
        .from("lessons")
        .select("id, learning_plan_id");

    // Fetch progress
    const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id);

    const totalPlans = plans?.length || 0;
    const totalLessons = lessons?.length || 0;

    const completedLessons = 
        lessons?.filter(l => 
            progress?.some(p => p.lesson_id === l.id && p.completed)
        ).length || 0;

        const completionRate = 
            totalLessons > 0 
            ? Math.round((completedLessons / totalLessons) * 100) 
            : 0;
    
    return (
        <main className="flex-1 min-h-screen flex bg-gradient-to-br from-gradient-indigo-500 via-blue-500 to-cyan-400 p-6">
            <div className="flex w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-white shadow-2xl">
                <Sidebar />

                <div className="flex-1 flex flex-col bg-slate-50">
                    <Topbar title="Analytics" />

                    <main className="flex-1 p-8 grid-cols-1 md:grid-cols-3 gap-6 content-start">
                        <StatCard label="Plans Created" value={totalPlans} />
                        <StatCard label="Total Lessons" value={totalLessons} />
                        <StatCard label="Completion Lessons" value={completedLessons} />

                        <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-2xl shadow">
                            <h2 className="text-lg font-semibold mb-4">Completion Rate</h2>

                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: `${completionRate}%` }}/>
                            </div>

                            <p className="mt-2 text-sm text-gray-600">
                                {completionRate}% completed
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </main>
    );
}

function StatCard({ label, value}: StatCardProps){
    return (
        <div className="bg-white p-6 rounded-2xl shadow text-center">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    );
}