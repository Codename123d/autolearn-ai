// src/app/help/page.tsx
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function HelpPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-500 to-teal-400 p-6">
            <div className="mx-auto max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
                <Sidebar />

                <div className="flex-1 bg-slate-50 flex flex-col">
                    <Topbar title="Help & Support"/>

                    <div className="p-10">
                        <div className="max-w-4xl mx-auto space-y-10">

                            {/* Title */}
                            <header>
                                <h1 className="text-3xl font-bold">
                                    Help & Support
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Learn how to use the AI learning platform effectively and safetly.
                                </p>
                            </header>

                            {/* Getting Started */}
                            <section className="rounded-lg border p-6">
                                <h2 className="text-xl font-semibold">Getting Started</h2>
                                <ul className="mt-3 list-disc pl-6 text-sm space-y-2">
                                    <li>Create an account and log in</li>
                                    <li>Generate your first AI learning plan</li>
                                    <li>Follow lessons step-by-step</li>
                                </ul>  
                            </section>

                            {/* Learning Plans */}
                            <section className="rounded-lg border p-6">
                                <h2 className="text-xl font-semibold">Using Learning Plans</h2>
                                <ul className="mt-3 list-disc pl-6 text-sm space-y-2">
                                    <li>Each plan is personalised based on your job tasks</li>
                                    <li>Lessons guide you on how to automate tasks using AI</li>
                                    <li>Mark lessons as complete to track progress</li>
                                </ul>
                            </section>

                            {/* AI Assistance */}
                            <section className="rounded-lg border p-6">
                                <h2 className="text-xl font-semibold">AI Assistance</h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    The AI assistant helps you understand lessons better.
                                </p>

                                <ul className="mt-3 list-disc pl-6 text-sm space-y-2">
                                    <li>Ask questions about lesson content</li>
                                    <li>Get simplified explanations</li>
                                    <li>Apply concepts to real job tasks</li>
                                </ul>
                            </section>

                            {/* Progress Tracking */}
                            <section className="rounded-lg border p-6">
                                <h2 className="text-xl font-semibold">Progress Tracking</h2>
                                <ul className="mt-3 list-disc pl-6 text-sm space-y-2">
                                    <li>Your progress is automatically saved</li>
                                    <li>Completed lessons are tracked visually</li>
                                    <li>You must complete required lessons (e.g. GDPR)</li>
                                </ul>
                            </section>

                            {/* GDPR & Safety */}
                            <section className="rounded-lg border border-red-200 bg-red-50 p-6">
                                <h2 className="text-xl font-semibold text-red-800">
                                    Data Protection & Ethical Use
                                </h2>

                                <ul className="mt-3 list-disc pl-6 text-sm text-red-700 space-y-2">
                                    <li>Do not input sensitive or personal data into AI tools</li>
                                    <li>Always review AI-generated outputs</li>
                                    <li>Follow GDPR and Data Protection Act 2018 guidelines</li>
                                </ul>
                            </section>

                            {/* Troubleshooting */}
                            <section className="rounded-lg border p-6">
                                <h2 className="text-xl font-semibold">Troubleshooting</h2>

                                <ul className="mt-3 list-disc pl-6 text-sm space-y-2">
                                    <li>If lessons are not saving, refresh the page</li>
                                    <li>If login fails, check your credentials</li>
                                    <li>Ensure your internet connection is stable</li>
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}