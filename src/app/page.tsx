// src/app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-500 to-teal-400">
        <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-12 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
                <img src="/logos/AILogo.png" alt="AutoLearn Logo" className="w-14 h-14" />
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
                AutoLearn AI
            </h1>

            {/* Description */}
            <p className="text-gray-600 text-lg max-w-xl mx-auto mb-10">
                AutoLearn AI helps professionals and students create personalized learning plans using artificial intelligence.
                This helps to automate personal workplace tasks and enhance productivity.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="/register" className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg shadow-md hover:opacity-90 transition">
                    Get Started
                </a>

                <a href="/login" className="px-8 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-lg hover:bg-slate-50 transition">
                    Sign In
                </a>
            </div>
        </div>
    </main>
  );
}