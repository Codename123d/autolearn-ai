// src/components/ReviewEditor.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewEditorProps } from "@/types";

export default function ReviewEditor({ docId, originalText, redactedText }: ReviewEditorProps){
    const [text, setText] = useState(redactedText);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleApprove() {
        setLoading(true);

        try {
            const res = await fetch("/api/save-clean-text", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    docId: docId,
                    finalText: text,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // redirect to create plan with doc
            router.push(`/create-plan?docId=${docId}`);
        } catch (err : unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col">
            <h3 className="font-semibold text-green-700 mb-2">
                Redacted (Editable & Safe)
            </h3>

            <textarea title="Redacted Text" value={text} onChange={(e) => setText(e.target.value)} className="w-full h-[500px] text-xs p-3 border rounded bg-white" />
            <div className="mt-4 flex  justify-end">
                <button onClick={handleApprove} disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    {loading ? "Saving..." : "Approve & Continue→"}
                </button>
            </div>
        </div>
    );
}