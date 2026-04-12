// src/app/search/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function SearchPage({ searchParams }: any) {
    const query = searchParams.q;
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string){
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: plans } = await supabase
        .from("learning_plans")
        .select("id, title, introduction")
        .ilike("title", `%${query}%`);

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-6">
                Search results for "{query}"
            </h1>

            <div className="space-y-4">
                {plans?.map((plan) => (
                    <a key={plan.id} href={`/learning-plans/${plan.id}`} className="block p-4 border rounded-lg hover:bg-gray-50">
                        <h2 className="font-semibold">{plan.title}</h2>
                        <p className="text-sm text-gray-600">
                            {plan.introduction}
                        </p>
                    </a>
                ))}
            </div>
        </div>
    );
}