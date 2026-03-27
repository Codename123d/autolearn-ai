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