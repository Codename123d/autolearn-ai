// src/components/QuizElement.tsx
"use client";

import { useState } from "react";

export default function QuizElement({ onComplete }: { onComplete: (level: string) => void }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [result, setResult] = useState<string | null>(null);
    const [score, setScore] = useState(0);

    const questions = [
        {
            question: "How often do you use AI tools in your work?",
            options: [
                { text: "Never used AI tools", value: 1 },
                { text: "Occasionally use AI tools", value: 2 },
                { text: "Regularly use AI tools", value: 3 },
            ],
        },
        {
            question: "How comfortable are you with automating repetitive tasks?",
            options: [
                { text: "Never comfortable", value: 1 },
                { text: "Somewhat comfortable", value: 2 },
                { text: "Very comfortable", value: 3 },
            ],
        },
        {
            question: "Have you ever created scripts or macros to speed up your work?",
            options: [
                { text: "Never", value: 1 },
                { text: "Yes, a few times", value: 2 },
                { text: "Yes, often", value: 3 },
            ],
        },
        {
            question: "How familiar are you with AI concepts like machine learning or natural language processing?",
            options: [
                { text: "Not familiar", value: 1 },
                { text: "Somewhat familiar", value: 2 },
                { text: "Very familiar", value: 3 },
            ],
        },
        {
            question: "When given a new AI tool, how quickly can you learn to use it?",
            options: [
                { text: "It takes a long time", value: 1 },
                { text: "I can learn with some guidance", value: 2 },
                { text: "I can learn quickly on my own", value: 3 },
            ],
        },
        {
            question: "How often do you analyze data or reports to make decisions at work?",
            options: [
                { text: "Rarely or never", value: 1 },
                { text: "Sometimes", value: 2 },
                { text: "Frequently", value: 3 },
            ],
        },
        {
            question: "Do you know how to integrate AI tools with your existing workflows?",
            options: [
                { text: "No idea", value: 1 },
                { text: "I have some ideas", value: 2 },
                { text: "Yes, I can do it confidently", value: 3 },
            ],
        },
        {
            question: "How often do you experiment with new technology to improve your productivity?",
            options: [
                { text: "Never", value: 1 },
                { text: "Sometimes", value: 2 },
                { text: "Frequently", value: 3 },
            ],
        },
        {
            question: "How confident are you with analyzing large datasets or automating reports?",
            options: [
                { text: "Not comfortable", value: 1 },
                { text: "Somewhat comfortable", value: 2 },
                { text: "Very comfortable", value: 3 },
            ],
        },
        {
            question: "Would you be confident using AI to automate part of your daily work tasks?",
            options: [
                { text: "No", value: 1 },
                { text: "Maybe with guidance", value: 2 },
                { text: "Yes, independently", value: 3 },
            ],
        },
    ];

    async function saveResult(score: number, level: string) {
        try {
            await fetch("/api/save-quiz", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    score,
                     level
                }),
            });
        } catch (err) {
            console.error("Failed to save quiz result:", err);
        }
    }

    function getSkillLevel(score: number) {
        if (score <= 10) return "Beginner";
        if (score <= 25) return "Intermediate";
        return "Advanced";
    }

    function handleAnswer(value: number) {
        const newScore = score + value;

        if (currentQuestion + 1 < questions.length) {
            setScore(newScore);
            setCurrentQuestion(currentQuestion + 1);
        } else {
            const level = getSkillLevel(newScore);

            setResult(level); // show results first

            // save to DB
            saveResult(newScore, level);

            // delay redirect
            setTimeout(()=> {
                onComplete(level);
            }, 2500); // 2.5 seconds
        }
    }

    const q = questions[currentQuestion];

    if (result) {
            return (
                <div className="mb-8 p-6 bg-indigo-50 rounded-xl text-center">
                    <h2 className="text-xl font-semibold mb-4">
                        Your Skill Level
                    </h2>

                    <p className="text-2xl font-bold text-indigo-600">
                        {result}
                    </p>

                    <p className="text-sm text-slate-500 mt-2">
                        Redirecting to your personalised plan...
                    </p>
                </div>
            );
        }

    return (
        <div className="mb-8 p-6 bg-indigo-50 rounded-xl">

            <h2 className="text-lg font-semibold mb-4">
                AI Skill Assessment
            </h2>

            <p className="mb-4 text-slate-700">
                {q.question}
            </p>

            <div className="flex flex-col gap-2">
                {q.options.map((opt, index) => (
                    <button key={index} onClick={() => handleAnswer(opt.value)} className="px-4 py-2 bg-white border rounded-lg hover:bg-indigo-100 transition">
                        {opt.text}
                    </button>        
                ))}
            </div>

            <p className="text-xs text-slate-500 mt-4">
                Question {currentQuestion + 1} of {questions.length}
            </p>
        </div>
    );
}