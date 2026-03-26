// src/app/create-plan/CreatePlanForm.tsx
"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Image from "next/image";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreatePlanPage({ userId, defaultJobRole, }: { userId: string; defaultJobRole: string; }) {
    const [jobRole, setJobRole] = useState(defaultJobRole);
    const [industry, setIndustry] = useState("");
    const [tasks, setTasks] = useState("");
    const [goals, setGoals] = useState("");
    const [skillLevel, setSkillLevel] = useState("");
    const [loading, setLoading] = useState(false);
    const [seniority, setSeniority] = useState("");
    const router = useRouter();
    const generationRef = useRef(false);

    async function handleGenerate() {
        if (generationRef.current) return; // HARD STOP
        generationRef.current = true;
        setLoading(true);

        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    jobRole,
                    seniority,
                    industry,
                    tasks,
                    goals,
                    skillLevel,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate learning plan");
            }

            router.push(`/learning-plans`);



        } catch (err: any) {
            alert(err.message);
        } finally {
            generationRef.current = false; // release lock
            setLoading(false);
        }
    }

    useEffect(() => {
        async function checkActivePlan() {
            try {
                const res = await fetch("/api/active-plan");
                const data = await res.json();

                if (data.plan?.id) {
                    router.push(`/learning-plan/${data.plan.id}`);
                }
            } catch (err) {
                console.error("Error checking active plan:", err);
            }
        }

        checkActivePlan();
    }, [router]);

    const isDisabled = 
        !jobRole || !seniority || !industry || !tasks || !goals || !skillLevel || loading;

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-500 to-teal-400 p-6">
            <div className="mx-auto max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">

                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 bg-slate-50">
                    <Topbar title="Create a Learning Plan" />

                    {/* Unified Header (description + illustration only) */}
                    <div className="relative px-10 py-8 bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
                        <p className="text-slate-600 max-w-2xl text-sm leading-relaxed">
                            Fill out the form below to generate a personalized AI-driven Learning
                            plan to automate your tasks and enhance your skills.
                        </p>

                        {/* AI Side Illustration */}
                        <div className="absolute right-10 top-0 hidden lg:block">
                            <Image src="/logos/AI robot with checklist assistance.png" alt="AI robot with checklist assistance" width={220} height={220} />
                        </div>
                    </div>

                    {/* Page Content */}
                    <div className="p-10">
                        <div className="max-w-5xl mx-auto">

                            {/* Form Card */}
                            <div className="bg-white rounded-xl shadow-md p-8">
                                <h2 className="text-lg font-semibold mb-6 text-slate-800">
                                    Job Information
                                </h2>

                                {/* Grid Form */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Job Role */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-slate-700">Job Role</label>
                                        <input type="text" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. Backend Developer, Product Manager, DevOps Engineer..." value={jobRole} onChange={(e) => setJobRole(e.target.value)} />
                                        <p className="text-xs text-slate-500">
                                            Be specific - this improves the quality of your generated plan.
                                        </p>
                                    </div>

                                    {/* Seniority Level */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Seniority Level
                                        </label>
                                        <select title="Seniority Level" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={seniority} onChange={(e) => setSeniority(e.target.value)}>
                                            <option value="">Select level</option>
                                            <option>Intern</option>
                                            <option>Junior</option>
                                            <option>Mid-level</option>
                                            <option>Senior</option>
                                            <option>Lead</option>
                                            <option>Manager</option>
                                            <option>Director</option>
                                            <option>VP</option>
                                            <option>C-Level</option>
                                        </select>
                                    </div>

                                    {/* Industry */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-slate-700">Industry</label>
                                        <input type="text" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. Finance, Healthcare, Tech, Retail..." value={industry} onChange={(e) => setIndustry(e.target.value)} />
                                    </div>

                                    {/* Tasks */}
                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <label className="text-sm font-medium text-slate-700">Tasks for Automation</label>
                                        <textarea className="w-full min-h-[130px] resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" maxLength={500} placeholder="Describe the tasks you want to automate..." value={tasks} onChange={(e) => setTasks(e.target.value)} />
                                        <span className="text-xs text-right text-slate-400">
                                            {tasks.length} / 500
                                        </span>
                                    </div>

                                    {/* Goals */}
                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <label className="text-sm font-medium text-slate-700">Learning Goals</label>
                                        <textarea className="w-full min-h-[130px] resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" maxLength={300} placeholder="Explain what you hope to achieve..." value={goals} onChange={(e) => setGoals(e.target.value)} />
                                        <span className="text-xs text-right text-slate-400">
                                            {goals.length} / 300
                                        </span>
                                    </div>

                                    {/* Skill Level */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-slate-700">Skill Level</label>
                                        <select title="Skill Level" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
                                            <option value="">Select Skill Level</option>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Button */}
                                <div className="flex justify-center mt-10">
                                    <button onClick={handleGenerate} disabled={isDisabled} className="px-10 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                        {loading ? "Generating..." : "Generate Learning Plan"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}