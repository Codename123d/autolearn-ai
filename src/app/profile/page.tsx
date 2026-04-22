// src/app/profile/page.tsx
import { Mail, MapPin, Calendar, Settings, Edit, CheckCircle, Clock, Zap, Star, Brain } from "lucide-react";
import { requireUser } from "@/lib/auth/requireUser";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { syncUserProgress } from "@/lib/actions/progress";
import Link from "next/link";
import { StatsCardProps, AchievementDef, SkillType } from "@/types";

export default async function ProfilePage() {

    // Protect page & get supabase + user
    const { user, supabase } = await requireUser("/profile");

    await syncUserProgress(user.id);

    // Fetch profile data from Supabase
    const { data: profile } = await supabase
        .from("profiles") // assuming your table is called 'profiles'
        .select("*")
        .eq("id", user.id)
        .single();

    const { data: achievementsData } = await supabase
        .from("user_achievements")
        .select(`
            unlocked_at,
            achievement_definitions (
                id,
                title,
                description,
                icon
            )
        `)
        .eq("user_id", user.id);

    const achievements = achievementsData ?? [];
    
    // Fetch updated lesson count
    const { count: lessonsCompleted } = await supabase
        .from("lesson_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("completed", true);
    
    const lessonsCompletedCount = lessonsCompleted ?? 0;

    // Fetch updated skill data (for timeSaved calculation) 
    const { data: skillsData } = await supabase
        .from("skills")
        .select("*")
        .eq("user_id", user.id);

    const skills = skillsData ?? [];

    // Compute timeSaved and completionRate (or fetch from user_stats if you store them)
    const timeSavedStat = await supabase
        .from("user_stats")
        .select("value")
        .eq("user_id", user.id)
        .eq("label", "time_saved")
        .single();
    
    const timeSaved = timeSavedStat?.data?.value || "0 mins";

    const { count: totalLessons } = await supabase
        .from("lesson_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

    const completionRate = totalLessons
        ? `${Math.round((lessonsCompletedCount / totalLessons) * 100)}%`
        : "0%";
    
    type IconKey = "check" | "clock" | "zap" | "star" | "brain";

    const iconMap: Record<IconKey, any> = {
        check: CheckCircle,
        clock:  Clock,
        brain: Brain,
        star: Star,
        zap: Zap
    };

    const { data: allAchievements } = await supabase
        .from("achievement_definitions")
        .select("*");

    const achievementsWithStatus = allAchievements?.map(def => {
        const unlockedData = achievements.find(a => {
            const achievementDef = a.achievement_definitions as unknown as AchievementDef;
            console.log("TYPE CHECK:", Array.isArray(a.achievement_definitions));
            console.log(a.achievement_definitions);
            return achievementDef?.id === def.id;
        });

        return { ...def, unlocked: !!unlockedData, unlocked_at: unlockedData?.unlocked_at || null };
    });
    console.log(achievementsData);

    achievementsWithStatus?.sort((a, b) => {
        if (!a.unlocked_at) return 1;
        if (!b.unlocked_at) return -1;
        return new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime();
    });

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
                                    <Link href="/profile/edit" className="px-4 py-2 rounded-xl border flex items-center gap-2 text-sm hover:bg-indigo-50 transition">
                                        <Edit size={16} /> Edit Profile
                                    </Link>
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
                                    <Calendar size={16} /> Member since: {new Date(profile?.created_at).toLocaleDateString() || "N/A"}
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
                                    <StatCard icon={<CheckCircle />} label="Lessons Completed" value={lessonsCompletedCount} />
                                    <StatCard icon={<Clock />} label="Time Saved" value={timeSaved} />
                                    <StatCard icon={<Zap />} label="Completion Rate" value={completionRate} />
                                </div>
                            </div>                   

                            {/* Achivements */}
                            <div className="bg-white rounded-2xl shadow p-6">
                                <h3 className="text-lg font-semibold mb-4">Achievements</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {achievementsWithStatus?.map((a) => {
                                        const iconKey = (a.icon || "star").toLowerCase() as IconKey;

                                        const IconComponent = iconMap[iconKey] ?? iconMap["star"];

                                        return (
                                            <Achievement key={a.title} icon={
                                                <IconComponent color={a.unlocked ? "#facc15" : "#d1d5db"} className="w-5 h-5" /> // yellow-400 / gray-300
                                            }
                                            title={a.title} desc={a.unlocked ? a.description : "Locked"} />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* AI Skills */}
                            <div className="bg-white rounded-2xl shadow p-6">
                                <h3 className="text-lg font-semibold mb-4">AI Skills</h3>
                                {skills?.length ? (
                                    skills?.map((skill: SkillType) => (
                                        <Skill
                                            key={`${skill.label}-${skill.percentage}`}
                                            label={skill.label}
                                            level={skill.level}
                                            percentage={skill.percentage}
                                        />
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">Complete lessons to build your AI skill profile</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function StatCard({ icon, label, value }: StatsCardProps) {
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
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
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