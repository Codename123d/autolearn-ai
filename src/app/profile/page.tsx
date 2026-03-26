// src/app/profile/page.tsx
import { Mail, MapPin, Calendar, Settings, Edit, CheckCircle, Clock, Zap, Star, Brain } from "lucide-react";
import { requireUser } from "@/lib/auth/requireUser";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default async function ProfilePage() {
    // Protect page & get supabase + user
    const { user, supabase } = await requireUser("/profile");

    // Fetch profile data from Supabase
    const { data: profile } = await supabase
        .from("profiles") // assuming your table is called 'profiles'
        .select("*")
        .eq("id", user.id)
        .single();

    // Fetch user stats/achievements if stored
    const { data: stats } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id);

    const { data: achievements } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", user.id);

    const { data: skills } = await supabase
        .from("skills")
        .select("*")
        .eq("user_id", user.id);

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-500 to-teal-400 p-6">
            <div className="mx-auto max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">

                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">

                    {/* Topbar */}
                    <Topbar title="Profile" />

                    {/* Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 bg-slate-50 flex-1">
                        {/* Left: Profile card */}
                        <div className="bg-white rounded-2xl shadow p-6">
                            <div className="flex flex-col items-center text-center">
                                <img src={profile?.avatar || "/logos/AvatarIcon.png"} alt="Profile" className="w-24 h-24 rounded-full border mb-4" />
                                <h2 className="text-xl font-semibold">{profile?.name || user.email}</h2>
                                <p className="text-slate-500">{profile?.primary_job_role || "No primary role set"}</p>

                                <div className="flex gap-3 mt-4">
                                    <button className="px-4 py-2 rounded-xl border flex items-center gap-2 text-sm">
                                        <Edit size={16} /> Edit Profile
                                    </button>
                                    <button className="px-4 py-2 rounded-xl border flex items-center gap-2 text-sm">
                                        <Settings size={16} /> Settings
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} /> {profile?.email || user.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} /> Member since {profile?.created_at || "N/A"}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} /> {profile?.location || "Unknown"}
                                </div>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Stats */}
                            <div className="bg-white rounded-2xl shadow p-6">
                                <h3 className="text-lg font-semibold mb-4">Productivity Stats</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {stats?.map(stat => (
                                        <StatCard
                                            key={stat.label}
                                            icon={
                                                stat.icon === "tasks" ? <CheckCircle /> :
                                                stat.icon === "rate" ? <Zap /> :
                                                <Clock />
                                            }
                                            label={stat.label}
                                            value={stat.value}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Achivements */}
                            <div className="bg-white rounded-2xl shadow p-6">
                                <h3 className="text-lg font-semibold mb-4">Achievements</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {achievements?.map(a => (
                                        <Achievement
                                            key={a.title}
                                            icon={
                                                a.icon === "check" ? <CheckCircle /> :
                                                a.icon === "clock" ? <Clock /> :
                                                a.icon === "brain" ? <Brain /> :
                                                <Star />
                                            }
                                            title={a.title}
                                            desc={a.desc}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* AI Skills */}
                            <div className="bg-white rounded-2xl shadow p-6">
                                <h3 className="text-lg font-semibold mb-4">AI Skills</h3>
                                {skills?.map(skill => (
                                    <Skill
                                        key={skill.label}
                                        label={skill.label}
                                        level={skill.level}
                                        percentage={skill.percentage}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function StatCard({ icon, label, value }: any) {
    return (
        <div className="rounded-xl border p-4 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                {icon}
            </div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}

function Achievement({ icon, title, desc }: any) {
    return (
        <div className="rounded-xl border p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                {icon}
            </div>
            <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-slate-500">{desc}</p>
            </div>
        </div>
    );
}

function Skill({ label, level, percentage }: any) {
    return (
        <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
                <span>{label}</span>
                <span className="text-indigo-600">{level}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600" style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}