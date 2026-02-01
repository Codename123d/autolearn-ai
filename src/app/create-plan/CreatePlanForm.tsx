// src/app/create-plan/CreatePlanForm.tsx
"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Image from "next/image";
import { useState } from "react";

export default function CreatePlanPage({ userId }: { userId: string }) {
    const [jobRole, setJobRole] = useState("");
    const [industry, setIndustry] = useState("");
    const [tasks, setTasks] = useState("");
    const [goals, setGoals] = useState("");
    const [skillLevel, setSkillLevel] = useState("");

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    async function handleGenerate() {
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    jobRole,
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

            setResult(data.content);
        } catch (err: any) {
            setResult(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    const isDisabled = 
        !jobRole || !industry || !tasks || !goals || !skillLevel || loading;

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
                        <div className="absolute right-10 top-4 hidden lg:block">
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
                                        <select title="jobRole" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={jobRole} onChange={(e) => setJobRole(e.target.value)}>
                                            <option value="">Select your job role...</option>
                                            <option>Project Manager</option>
                                            <option>Software Developer</option>
                                            <option>Data Analyst</option>
                                            <option>Marketing Specialist</option>
                                        </select>
                                    </div>

                                    {/* Industry */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-slate-700">Industry</label>
                                        <select className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" title="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                                            <option value="">Select your industry...</option>
                                            <option>Technology</option>
                                            <option>Finance</option>
                                            <option>Healthcare</option>
                                            <option>Education</option>
                                        </select>
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
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
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

                            {/* Result */}
                            {result && (
                                <div className="mt-10 bg-white rounded-xl shadow-md p-8">
                                    <h3 className="font-semibold mb-4 text-slate-800">
                                        Generated Learning Plan
                                    </h3>
                                    <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                                        {result}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}