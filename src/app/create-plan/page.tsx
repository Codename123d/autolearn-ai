// src/app/create-plan/page.tsx
import { requireUser } from "@/lib/auth/requireUser";
import CreatePlanForm from "./CreatePlanForm";

export default async function CreatePlanPage() {
    // Protect page
    const { user, supabase } = await requireUser("/create-plan");

    const { data: profile } = await supabase
        .from("profiles")
        .select("primary_job_role")
        .eq("id", user.id)
        .single();

    return (
        <CreatePlanForm userId={user.id} defaultJobRole={profile?.primary_job_role || ""} />
    );
}