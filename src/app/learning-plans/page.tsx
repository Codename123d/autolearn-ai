// src/app/learning-plans/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default async function LearningPlanDashboard() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                }
            },
        }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return <p className="p-10">You must be logged in to view your plans.</p>;

    const { data: plans } = await supabase
        .from("learning_plans")
        .select(`
            id,
            title,
            created_at,
            status,
            lessons (id)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
    
    const taskPlans = plans?.filter(p => p.lessons?.length === 1);

    if (!plans || plans.length === 0) return <p className="p-10">No learning plans found.</p>;

    // Get ALL lessons for these plans
    const { data: allLessons } = await supabase
        .from("lessons")
        .select("id, learning_plan_id")
        .in("learning_plan_id", plans.map(p => p.id));
    
    const { data: allProgress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id);
    
    const totalLessons = allLessons?.length || 0;

    const completedLessons = allLessons?.filter(lesson =>
        allProgress?.some(p => p.lesson_id === lesson.id && p.completed)
    ).length || 0;

    const globalProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Find FIRST incomplete lesson
    const firstIncomplete = allLessons?.find(lesson =>
        !allProgress?.some(p => p.lesson_id === lesson.id && p.completed)
    );

    // Get its plan id
    const resumePlanId = firstIncomplete?.learning_plan_id;

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-500 to-teal-400 p-6">
            <div className="mx-auto max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 bg-slate-50 flex flex-col">

                    {/* Topbar */}
                    <Topbar title="Learning Plans" />
                    
                    {/* Page Content */}
                    <div className="p-10">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-3xl font-bold mb-6">
                                Your Generated Learning Plans    
                            </h1>

                            <section className="mb-8 rounded-lg border p-6 bg-white shadow">
                                <h2 className="text-lg font-semibold">Overall Progress</h2>

                                {resumePlanId && (
                                    <section className="mb-6 rounded-lg border p-6 bg-indigo-50 shadow flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold text-indigo-800">
                                                Resume Learning
                                            </h2>
                                            <p className="text-sm text-indigo-600">
                                                Continue where you left off.
                                            </p>
                                        </div>

                                        <Link href={`/learning-plans/${resumePlanId}`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                            Resume
                                        </Link>
                                    </section>
                                )}

                                <div className="mt-3 h-3 w-full rounded bg-gray-200">
                                    <div className="h-3 rounded bg-indigo-600" style={{ width: `${globalProgress}%`}} />
                                </div>

                                <p className="mt-2 text-sm text-gray-600">
                                    {completedLessons} of {totalLessons} lessons completed ({globalProgress}%)
                                </p>
                            </section>

                            {!plans || plans.length === 0 ? (
                                <p className="text-gray-600">No learning plans found.</p>    
                            ) : (
                                <ul className="space-y-4">
                                    {taskPlans?.map((plan) => (
                                        <li key={plan.id} className="border rounded-lg p-5 flex justify-between items-center bg-white shadow hover:shadow-md transition">
                                            <Link href={`/learning-plans/${plan.id}`} className="font-semibold text-indigo-600 hover:underline">
                                                {plan.title}
                                            </Link>
                                            
                                            <div className="flex items-center gap-4">                   
                                                <span className="text-sm text-gray-500">
                                                    {new Date(plan.created_at).toLocaleDateString()}
                                                </span>

                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    plan.status === "failed" ? "bg-red-100 text-red-700" :
                                                    plan.status === "generating" ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-green-100 text-green-700"
                                                }`}>
                                                    {plan.status}
                                                </span>
                                            </div>
                                        </li>   
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}