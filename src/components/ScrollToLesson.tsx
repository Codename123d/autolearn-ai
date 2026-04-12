// src/components/ScrollToLesson.tsx
"use client";

import { useEffect } from "react";  

export default function ScrollToLesson({ lessonId }: { lessonId?: string }) {
    useEffect(() => {
        if (!lessonId) return;

        const el = document.getElementById(lessonId);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    }, [lessonId]);

    return null;
}