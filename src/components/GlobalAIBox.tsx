// src/components/GlobalAIBox.tsx
"use client";
import { useState } from "react";

export default function GlobalAIBox() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleAsk() {
        if (!question.trim()) return;

        setLoading(true);
        setAnswer("");

        try {
            const res = await fetch("/api/ai-global", {
                method: "POST",
                body: JSON.stringify({ question }),
            });

            const data = await res.json();
            setAnswer(data.answer);
        } catch (err) {
            console.error(err);
            setAnswer("Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-3">
            <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask AI about automation..." className="w-full border rounded-lg px-3 py-2 text-sm" />

            <button onClick={handleAsk} className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600">
                {loading ? "Thinking..." : "Ask AI"}
            </button>

            {answer && (
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {answer}
                </div>
            )}
        </div>
    );
}