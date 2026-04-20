// src/components/AutomationGuide.tsx
"use client";

import { useState } from "react";

export default function AutomationGuide() {
    const [tasks, setTasks] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleGenerate() {
        if (!tasks.trim()) return;

        setLoading(true);

        try {
            const res = await fetch("/api/automation", {
                method: "POST",
                body: JSON.stringify({ tasks }),
                headers: { "Content-Type": "application/json" },
            });
            
            const data = await res.json();
            setResult(data.output);
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    }

    return (
        <div className="space-y-4">
            {/* Step 1 */}
            <textarea placeholder="List your repetitive tasks (e.g. emails, reports...)" value={tasks} onChange={(e) => setTasks(e.target.value)} className="w-full p-3 border rounded-lg text-sm" />

            {/* Step 2 */}
            <button onClick={handleGenerate} className="w-full bg-indigo-500 text-white py-2 rounded-lg">
                {loading ? "Generating..." : "Generate Automation Plan"}    
            </button>            

            {/* Step 3 */}
            {result && (
                <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                    {result}
                </div>
            )}
        </div>
    );
}