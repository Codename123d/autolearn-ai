// src/app/settings/page.tsx
"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        darkMode: false,
        emailNotifications: true,
        dataConsent: true,
    });
    const [originalSettings, setOriginalSettings] = useState(settings);
    const isChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    const [pageLoading, setPageLoading] = useState(true);
    const defaultSettings = {
        darkMode: false,
        emailNotifications: true,
        dataConsent: true,
    };

    useEffect(() => {
        const fetchSettings = async () => {
            const res = await fetch("/api/settings");

            if (!res.ok) {
                toast.error("Failed to load settings.");
                setPageLoading(false);
                return;
            }

            const { settings } = await res.json();

            const mapped = {
                darkMode: settings.dark_mode,
                emailNotifications: settings.email_notifications,
                dataConsent: settings.data_consent,
            };

            setSettings(mapped);
            setOriginalSettings(mapped);
            setPageLoading(false);
        };

        fetchSettings();
    }, []);

    useEffect(() => {
        setTimeout(() => {
            setPageLoading(false);
        }, 500);
    }, []);

    const handleSave = async () => {
        const toastId = toast.loading("Saving settings...");

        setLoading(true);

        try{
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(settings),
            });

            setLoading(false);

            if (!res.ok) {
                const { error } = await res.json();
                toast.error("Failed: " + error, { id: toastId, duration: 3000 });
            } else {
                setOriginalSettings(settings);
                toast.success("Settings saved!", { id: toastId, duration: 3000 });
            }

            setOriginalSettings(settings);

            toast.success("Settings saved!", { id: toastId, duration: 3000 });
        } catch (error) {
            toast.error("Failed to save settings.", { id: toastId, duration: 3000 });
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Loading settings...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-500 to-teal-400 p-6">
            <div className="mx-auto max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
                {/* Sidebar */}
                <Sidebar />

                <div className="flex-1 flex flex-col">
                    <Topbar title="Settings" />

                    <div className="p-8 space-y-6 bg-slate-50 flex-1">
                        {/* Preferences */}
                        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
                            <h2 className="text-lg font-semibold">Preferences</h2>

                            {/* Dark Mode */}
                            <div className="flex justify-between items-center">
                                <span>Dark Mode</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input title="Dark Mode" type="checkbox" checked={settings.darkMode} onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })} className="sr-only" />
                                    <div className={`w-11 h-6 rounded-full transition ${settings.darkMode ? "bg-indigo-600" : "bg-gray-300"}`} />
                                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.darkMode ? "translate-x-5" : "" }`} />
                                </label>
                            </div>

                            {/* Notifications */}
                            <div className="flex justify-between items-center">
                                <span>Email Notifications</span>
                                <input title="Email Notifications" type="checkbox" checked={settings.emailNotifications} onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })} />
                            </div>

                            {/* GDPR */}
                            <div className="flex justify-between items-center">
                                <span>Allow AI to process my data (GDPR)</span>
                                <input title="Data Consent" type="checkbox" checked={settings.dataConsent} onChange={(e) => setSettings({ ...settings, dataConsent: e.target.checked })} />
                            </div>
                        </div>

                        {/* Save Button */}
                        <button onClick={handleSave} disabled={loading || !isChanged} className={`px-4 py-2 rounded-xl text-white transition
                            ${loading || !isChanged
                                ? "bg-gray-400"
                                : "bg-indigo-600 hover:bg-indigo-700"
                            }`}>
                                {loading ? "Saving..." : "Save Settings"}
                            </button>
                        {/* Reset Button */}
                        <button onClick={() => setSettings(defaultSettings)} className="text-sm text-red-500 hover:underline">
                            Reset to Default
                        </button>

                        {!isChanged &&  !loading &&(
                            <p className="text-sm text-gray-500">
                                No changes to save.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}