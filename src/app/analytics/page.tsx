// src/app/analytics/page.tsx
import { requireUser } from "@/lib/auth/requireUser";
import { LinePoint } from "@/types/index";
import AnalyticsCharts from "./AnalyticsCharts";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default async function AnalyticsPage() {
    const { user, supabase } = await requireUser();

    // Fetch plans
    const { data: plans } = await supabase
        .from("learning_plans")
        .select("id")
        .eq("user_id", user.id);

    // Fetch lessons
    const { data: lessons } = await supabase
        .from("lessons")
        .select("id, learning_plan_id")
        .eq("user_id", user.id);

    // Fetch progress
    const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed, created_at")
        .eq("user_id", user.id);

    const totalPlans = plans?.length || 0;
    const totalLessons = lessons?.length || 0;

    const completedLessons = 
        lessons?.filter(l => 
            progress?.some(p => p.lesson_id === l.id && p.completed)
        ).length || 0;

    const chartData = 
        plans?.map(plan => {
            const planLessons = lessons?.filter(
                l => l.learning_plan_id === plan.id
            ) || [];

            const completed = planLessons.filter(l =>
                progress?.some(
                    p => p.lesson_id === l.id && p.completed
                )
            ).length;

            return {
                name: plan.id.slice(0, 5),
                value: planLessons.length,
                completed
            };
        }) || [];

    const lineData: LinePoint[] = (progress ?? []).reduce<LinePoint[]>((acc, p) => { 
        const date = new Date(p.created_at).toLocaleDateString();
            
        const existing = acc.find(x => x.date === date);

        if (existing) {
            existing.completed += p.completed ? 1 : 0;
        } else {
            acc.push({
                date,
                completed: p.completed ? 1 : 0
            });
        }

        return acc;
    }, []) || [];

    const pieData = [
        { name: "Completed", value: completedLessons },
        { name: "Remaining", value: Math.max(totalLessons - completedLessons, 0) },
    ];

    return (
        <main className="flex-1 min-h-screen flex bg-gradient-to-br from-gradient-indigo-500 via-blue-500 to-cyan-400 p-6">
            <div className="flex w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-white shadow-2xl">
                <Sidebar />

                <div className="flex-1 flex flex-col bg-slate-50">
                    <Topbar title="Analytics" />
                    <AnalyticsCharts chartData={chartData} lineData={lineData} pieData={pieData} totalPlans={totalPlans} totalLessons={totalLessons} completedLessons={completedLessons} />
                </div>
            </div>
        </main>
    );
}