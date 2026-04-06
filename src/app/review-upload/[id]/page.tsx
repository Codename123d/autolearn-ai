// src/app/review-upload/[id]/page.tsx
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import ReviewEditor from "@/components/ReviewEditor";

export default async function ReviewPage({ params }: any) {
    const { id } = await params;
    const cookieStore = await cookies();

    const supabase = await createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name: string) => {
                    return cookieStore.get(name)?.value;
                }
            },
        }
    );

    const { data: doc } = await supabase
        .from("uploaded_documents")
        .select("*")
        .eq("id", id)
        .single();

    if (!doc) {
        return <p className="p-10">Document not found</p>;
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-500 to-teal-400 p-6">
            <div className="mx-auto max-w-7xl  bg-white rounded-3xl shadow-2xl overflow-hidden flex">
                
                <Sidebar />

                <div className="flex-1 bg-slate-50">
                    <Topbar title="Review Uploaded Document" />

                    <div className="p-8 space-y-6">
                        {/* Header */}
                        <div>
                            <h2 className="text-xl font-semibold">
                                Review & Clean Your Document
                            </h2>

                            <p className="text-sm text-slate-500">
                                Sensitive data has been automatically redacted.
                                Please review before continuing.
                            </p>
                        </div>

                        {/* Split view */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Original (Sensitive) */}
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h3 className="font-semibold text-red-700 mb-2">
                                    Original (Sensitive)
                                </h3>

                                <pre className="text-xs whitespace-pre-wrap max-h-[500px] overflow-auto bg-white p-3 rounded border">
                                    {doc.extracted_text}
                                </pre>
                            </div>

                            <ReviewEditor docId={doc.id} originalText={doc.extracted_text} redactedText={doc.redacted_text} />
                        </div>

                        {/* Action Section */}
                        <div className="flex justify-between items-center pt-6 border-t">

                            <p className="text-sm text-slate-500">
                                Make sure no sensitive data remains before continuing.
                            </p>

                            {/* Continue button */}
                            <Link 
                                href={`/create-plan?docId=${doc.id}`} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                                Continue to create Plan →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}