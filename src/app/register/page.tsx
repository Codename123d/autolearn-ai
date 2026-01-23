// src/app/register/page.tsx
import RegisterCard from "@/components/RegisterCard";

export default function RegisterPage() {
    return (
        <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-blue-600 to-teal-400">

            {/* Floating logo (top left) */}
            <div className="absolute top-8 left-8 w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center">
                <img src="/logos/AILogo.png" alt="AutoLearn Logo" className="w-7 h-7" />
            </div>

            <RegisterCard />
        </main>
    );
}