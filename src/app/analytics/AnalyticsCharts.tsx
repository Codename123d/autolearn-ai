// src/app/analytics/AnalyticsCharts.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Props, StatCardProps } from "@/types";

export default function AnalyticsCharts({ chartData, lineData, pieData, totalPlans, totalLessons, completedLessons }: Props) {    
    
    const COLORS = ["#10B981", "#3B82F6", "#EF4444", "#F59E0B"]; // GREEN for completed, blue for remaining, red for overdue, amber for in-progress
    
    return (
        <main className="flex-1 p-8 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Bar Chart */}
                <div className="h-64">
                    <h2 className="text-lg font-semibold mb-2">Overview (Bar)</h2>

                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#6366F1" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Line Chart */}
                <div className="h-64">
                    <h2 className="text-lg font-semibold mb-2">Progress Trend</h2>

                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={lineData}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="completed" stroke="#10b981" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="h-64 md:col-span-2 flex justify-center">
                    <div className="w-64 h-64">
                        <h2 className="text-lg font-semibold mb-2 text-center">Completion Split</h2>

                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                                    {pieData.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* STATS GRID (BOTTOM) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Plans Created" value={totalPlans} />
                <StatCard label="Total Lessons" value={totalLessons} />
                <StatCard label="Completed Lessons" value={completedLessons} />
            </div>
        </main>
    );
}

function StatCard({ label, value}: StatCardProps){
    return (
        <div className="bg-white p-6 rounded-2xl shadow text-center">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    );
}