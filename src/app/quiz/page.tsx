// src/app/quiz/page.tsx
"use client";

import QuizElement from "@/components/QuizElement";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useRouter } from "next/navigation";

export default function QuizPage() {
    const router = useRouter();

    function handleQuizCompletion(level: string) {
        // redirect with level
        router.push(`/create-plan?level=${level.toLowerCase()}`);
    }

    return (
        <main className="min-h-screen flex bg-gradient-to-b from-indigo-600 via-blue-500 to-teal-400 p-6">
            <div className="mx-auto max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-1">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-slate-50">
                    {/* Topbar */}
                    <Topbar title="AI Skill Assessment" />

                    {/* Page Content */}
                    <div className="p-10 flex-1 overflow-y-auto flex items-center justify-center">
                        <div className="w-full max-w-3xl">
                        <QuizElement onComplete={handleQuizCompletion} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}