// src/app/learning-plans/[id]/page.tsx
import { markLessonComplete } from "./action";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default async function LearningPlanPage({ params }: { params: Promise<{ id: string }>; }) {
    const cookieStore = await cookies();
    const { id } = await params;

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                }
            },
        },
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <p className="p-10">You must be logged in to view this learning plan.</p>;
    }

    const { data: plan } = await supabase
        .from("learning_plans")
        .select("*, lessons(*)")
        .eq("id", id)
        .single();

    if (!plan) {
        return <p className="p-10">Learning plan not found.</p>;
    }

    const lesson = plan.lessons?.[0];

    const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed, completed_at")
        .eq("user_id", user.id)
        .eq("lesson_id", lesson?.id);

    const isCompleted = progress?.[0]?.completed === true;
    const progressPercent = isCompleted ? 100 : 0;

    const isGdpr = lesson?.is_gdpr;
    const incompleteGdpr = isGdpr && !isCompleted;

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-500 to-teal-400 p-6">
            <div className="mx-auto max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
                
                {/* Sidebar */}
                <Sidebar />

                {/* Main content */}
                <div className="flex-1 bg-slate-50 flex flex-col">

                    {/* Topbar */}
                    <Topbar title={plan.title} />

                    {/* Page Content */}
                    <div className="p-10">

                        <div className="max-w-4xl mx-auto space-y-10">

                            {/* Title */}
                            <header>
                                <h1 className="text-3xl font-bold">{plan.title}</h1>
                            </header>

                            {/* Overview Section */}
                            <section className="mb-8 rounded-lg border p-6">
                                <h2 className="text-xl font-semibold">Learning Plan Overview</h2>
                                <p className="mt-2 text-gray-600">{plan.description}</p>

                                <p className="mt-4 text-sm text-gray-500">
                                    Estimated duration: {plan.estimated_duration ?? "2-3 hours"} 
                                </p>
                            </section>

                            {/* Learning Outcomes */}
                            <section>
                                <h2 className="text-lg font-semibold">Learning Outcomes</h2>
                                <ul className="mt-3 list-disc pl-6 space-y-1">
                                    <li>Understand safe AI usage in a professional context</li>
                                    <li>Identify tasks suitable for AI automation</li>
                                    <li>Apply GDPR-compliant AI workflows</li>
                                </ul>
                            </section>

                            {/* Progress */}
                            <section className="rounded-lg border p-6">
                                <h2 className="text-lg font-semibold">Progress</h2>

                                <div className="mt-3 h-3 w-full rounded bg-gray-200">
                                    <div className="h-3 rounded bg-indigo-600" style={{ width: `${progressPercent}%`}} />
                                </div>

                                <p className="mt-2 text-sm text-gray-600">
                                    {isCompleted ? "Lesson completed" : "Lesson not completed"} ({progressPercent}%)
                                </p>
                            </section>

                            {/* */}
                            {incompleteGdpr && (
                                <section className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                    <p className="text-sm text-yellow-800">?
                                        ⚠️ You have complete all GDPR lessons before this learning plan can be considered complete.
                                    </p>
                                </section>
                            )}

                            {/* Lessons */}
                            <section className="space-y-6">
                                <h2 className="text-lg font-semibold">Lessons</h2>
                                {lesson && (
                                        <section key={lesson.id} className="mb-6 rounded-lg border p-5">
                                            <h3 className="text-lg font-semibold">
                                                {lesson.title}
                                            </h3>

                                            <div className="flex items-center justify-between">

                                                <div className="flex items-center gap-3">
                                                    {lesson.is_gdpr && (
                                                        <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
                                                            Mandatory (GDPR)
                                                        </span>
                                                    )}

                                                    {!isCompleted && (
                                                        <form action={async () => {
                                                            "use server";
                                                            await markLessonComplete(lesson.id);
                                                        }}>
                                                            <button className="mt-4 rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
                                                                Mark lesson complete
                                                            </button>
                                                        </form>
                                                    )}
                                                    
                                                    {isCompleted && (
                                                        <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                                                            Completed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="mt-3 text-gray-700">{lesson.content}</p>

                                            <div className="mt-4 rounded bg-gray-50 p-3 text-sm">
                                                <strong>Reflection:</strong>
                                                <p className="mt-1">
                                                    How could misuse of AI in this area impact user privacy or
                                                    organisational compliance?
                                                </p>
                                            </div>
                                        </section>
                                )}
                            </section>
                            
                            {/* GDPR & Ethical */}
                            <section className="rounded-lg border border-red-200 bg-red-50 p-6">
                                <h2 className="text-lg font-semibold text-red-800">
                                    Data Protection & Ethical AI Use
                                </h2>

                                <p className="mt-3 text-sm text-red-700">
                                    This learning plan includes mandatory guidance on GDPR and the Data
                                    Protection Act 2018. Users must understand legal responsibilities
                                    before applying AI automation in real-world job scenarios.
                                </p>
                            </section>
                            
                            {/* Final Reflection */}
                            <section className="rounded-lg border p-6">
                                <h2 className="text-lg font-semibold">Before You Automate</h2>

                                <ul className="mt-3 list-disc pl-6 text-sm space-y-1">
                                    <li>Have you identified personal or sensitive data?</li>
                                    <li>Is AI being used to assist, not replace, human judgment?</li>
                                    <li>Can the output be audited or explained?</li>
                                </ul>

                                <p className="mt-4 text-gray-600">{plan.final_recap}</p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}