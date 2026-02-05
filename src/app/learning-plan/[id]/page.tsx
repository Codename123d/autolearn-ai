import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function LearningPlanPage({ params }: { params: Promise<{ id: string }>; }) {
    const cookieStore = await cookies();
    const { id } = await params;

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                }
            },
        },
    );

    const { data: plan } = await supabase
        .from("learning_plans")
        .select("*, lessons(*)")
        .eq("id", id)
        .single();

    if (!plan) {
        return <p>Learning plan not found.</p>;
    }

    return (
        <main className="p-10">
            <h1>{plan.title}</h1>
            <p>{plan.description}</p>

            {plan.lessons?.map((lesson: any) => (
                <section key={lesson.id}>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.content}</p>
                </section>
            ))}

            <p>{plan.final_recap}</p>
        </main>
    );
}