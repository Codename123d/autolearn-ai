// src/components/AskAIBox.tsx
"use client";
import { useState } from "react";
import { askFollowUp } from "@/app/learning-plans/[id]/action";

export default function AskAIBox({ lessonContent }: { lessonContent: string }) {
    const [question, setQuestion] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleAsk() {
        if (!question) return;

        setLoading(true);

        const res = await askFollowUp(question, lessonContent);

        setResponse(res || "No response");
        setLoading(false);
    }

    return (
        <div className="space-y-3">
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about this lesson..." className="w-full border rounded p-3 text-sm" />

                <button onClick={handleAsk} className="px-4 py-2 bg-indigo-600 text-white rounded">
                    {loading ? "Thinking..." : "Ask AI"}
                </button>

                {response && (
                    <div className="p-3 bg-gray-100 rounded text-sm">
                        {response}
                    </div>
                )}
        </div>
    );
}