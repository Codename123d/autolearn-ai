// src/app/login/page.tsx
import LoginCard from "@/components/LoginCard";

export default function LoginPage() {
    return (
        <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-500 to-teal-400">
            
            {/* Floating logo (top left) */}
            <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center">
                <img src="/logos/AILogo.png" alt="AutoLearn Logo" className="w-8 h-8" />
            </div>
            
            <LoginCard />
        </main>
    );
}