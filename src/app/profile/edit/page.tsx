// src/app/profile/edit/page.tsx
"use client";
import { Mail, MapPin, Calendar, CheckCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type EditProfileForm = {
    name: string;
    email: string;
    primary_job_role: string;
    location: string;
    avatar?: string;
};

export default function EditProfilePage() {
    // Form state
    const [form, setForm] = useState<EditProfileForm>({
        name: "",
        email: "",
        primary_job_role: "",
        location: "",
        avatar: "",
    });

    const [pageLoading, setPageLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [memberSince, setMemberSince] = useState<string>("N/A");
    const [loading, setLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [originalForm, setOriginalForm] = useState<EditProfileForm | null>(null);

    // Fetch profile from API
    useEffect(() => {
        const fetchProfile = async () => {
            const res = await fetch("/api/profile");
            if (!res.ok) {
                setPageLoading(false);
                toast.error("Failed to load profile");
                return;
            }
            const { profile } = await res.json();
            setForm({
                name: profile?.name || "",
                email: profile?.email || "",
                primary_job_role: profile?.primary_job_role || "",
                location: profile?.location || "",
                avatar: profile?.avatar || ""
            });
            if (!profile) {
                toast.error("Profile not found");
                setPageLoading(false);
                return;
            }
            setUserId(profile.id);
            setMemberSince(profile.created_at || "N/A");
            setPageLoading(false);
            const formattedProfile = {
                name: profile?.name || "",
                email: profile?.email || "",
                primary_job_role: profile?.primary_job_role || "",
                location: profile?.location || "",
                avatar: profile?.avatar || ""
            };

            setForm(formattedProfile);
            setOriginalForm(formattedProfile);
        };
        fetchProfile();
    }, []);

    const isChanged = JSON.stringify(form) !== JSON.stringify(originalForm);

    if (pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white text-lg">
                Loading profile...
            </div>
        );
    }

    // Avatar preview handler
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);

            const previewUrl = URL.createObjectURL(file);
            setForm({ ...form, avatar: previewUrl });
        }
    };

    // Save profile to Supabase
    const handleSave = async () => {

        // show loading toast
        const toastId = toast.loading("Saving profile...", { duration: 3000 });

        setLoading(true);
        let avatarPath = form.avatar;

        // Upload avatar if a new file is selected
        if (avatarFile) {
            const uploadRes = await fetch(`/api/upload-avatar?userId=${userId}`, {
                method: "POST",
                body: avatarFile,
            });

            const uploadData = await uploadRes.json();

            if (!uploadRes.ok || !uploadData?.path) {
                setLoading(false);
                toast.error("Avatar upload failed", { id: toastId, duration: 3000 });
                return;
            }

            avatarPath = uploadData.path
        }

        // Update profile
        const res = await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, id: userId, avatar: avatarPath }),
        });

        setLoading(false);

        if (!res.ok) {
            const { error } = await res.json();
            toast.error("Failed to save profile: " + error.message, { id: toastId, duration: 3000 });
        } else {
            toast.success("Profile saved successfully!", { id: toastId, duration: 3000 });
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-500 to-teal-400 p-6">
            <div className="mx-auto max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">

                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">

                    {/* Top Bar */}
                    <Topbar title="Edit Profile" />

                    {/* Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-slate-50 flex-1">

                        {/* Left: Profile card */}
                        <div className="bg-white rounded-2xl shadow p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative group">
                                    <img src={form.avatar || "/logos/AvatarIcon.png"} alt="Avatar" className="w-24 h-24 rounded-full border mb-2 object-cover" />

                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition rounded-full cursor-pointer">
                                        Change Avatar
                                        <input title="Change Avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                    </label>
                                </div>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" className="border rounded-xl p-2 w-full mb-2 text-center" />
                                <input type="text" value={form.primary_job_role} onChange={(e) => setForm({ ...form, primary_job_role: e.target.value })} placeholder="Job Role" className="border rounded-xl p-2 w-full mb-2 text-center" />
                                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="border rounded-xl p-2 w-full mb-2 text-center" />
                                <div className="flex gap-3 mt-4">
                                    <button onClick={handleSave} disabled={loading || !isChanged} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-all
                                        ${loading
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                        }`}>
                                            {loading ? (
                                                <>
                                                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                                    Saving...
                                                </>
                                            ): (
                                                <>
                                                    <CheckCircle size={16} /> 
                                                    Save Changes
                                                </>
                                            )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right section */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Email / Stats */}
                            <div className="bg-white rounded-2xl shadow p-6 space-y-4">
                                <h3 className="font-semibold text-lg">Account Info</h3>

                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail size={16} /> {form.email}
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar size={16} /> Member since: {new Date(memberSince).toLocaleDateString()}
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPin size={16} /> Location: {form.location || "Unknown"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}