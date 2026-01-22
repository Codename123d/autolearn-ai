export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-xl text-center space-y-6 p-6">
            <h1 className="text-4xl font-bold">AutoLearn AI</h1>

            <p className="text-gray-600">
                AutoLearn AI helps professionals and students create personalized learning plans using artificial intelligence.
                This helps to automate personal workplace tasks and enhance productivity.
            </p>

            <div className="flex justify-center gap-4">
                <button className="px-6 py-3 bg-black text-white rounded-lg">
                    Get Started
                </button>
                <button className="px-6 py-3 border rounded-lg">
                    Learn More
                </button>
            </div>
        </div>
    </main>
  );
}