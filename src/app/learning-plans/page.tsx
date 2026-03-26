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
        .select("id,title,created_at,status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (!plans || plans.length === 0) return <p className="p-10">No learning plans found.</p>;

    return (
        <main className="min-h-screen p-6 bg-slate-50">
            <h1 className="text-3xl font-bold mb-6">Your Generated Learning Plans</h1>
            <ul className="space-y-4">
                {plans.map((plan) => (
                    <li key={plan.id} className="border rounded-lg p-4 flex justify-between items-center bg-white shadow">
                        <Link href={`/learning-plan/${plan.id}`} className="font-semibold text-indigo-600 hover:underline">
                            {plan.title}
                        </Link>
                        <span className="text-sm text-gray-500">{new Date(plan.created_at).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                            plan.status === "failed" ? "bg-red-100 text-red-700" :
                            plan.status === "generating" ? "bg-yellow-100 text-yellow-700" :
                            "bg-green-100 text-green-700"
                        }`}>
                            {plan.status}
                        </span>
                    </li>
                ))}
            </ul>
        </main>
    );
}