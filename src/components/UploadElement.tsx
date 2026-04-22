// src/components/UploadElement.tsx
"use client";
import { UploadElementProps } from "@/types";

export default function UploadElement({ onParsed }: UploadElementProps) {
    return (
        <div>
            <p className="text-sm text-gray-500 mb-4">
                Upload a document (PDF, DOCX, TXT) to extract tasks automatically.
            </p>

            {/* Hidden file input */}
            <input title="Upload Document" type="file" accept=".pdf,.docx,.txt" id="fileUpload" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const formData = new FormData();
                        formData.append("file", file);

                        try {
                            const res = await fetch("/api/upload", {
                                method: "POST",
                                body: formData,
                            });

                            const data = await res.json();

                            if (!res.ok) {
                                throw new Error(data.error);
                            }

                            if (data?.parsed) {
                                onParsed?.(data.parsed, data.documentId);
                            }
                        } catch (err) {
                            console.error("Upload error:", err);
                        }
            }} />

            {/* Triger button */}
            <label htmlFor="fileUpload" className="inline-block px-4 py-2 bg-indigo-500 text-white rounded-lg cursor-pointer hover:bg-indigo-600">
                Browse File
            </label>
        </div>
    );
}