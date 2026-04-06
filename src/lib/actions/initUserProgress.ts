import { createSupabaseServer } from "@/lib/supabase/server";

export async function initUserProgressFromPlan(userId: string, planId: string) {
    const supabase = await createSupabaseServer();
    
    // Check if user already has progress
    const { count } = await supabase
        .from("lesson_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

    if ((count ?? 0) > 0) return; // already initialised

    // Get job role from plan
    const { data: plan } = await supabase
        .from("learning_plans")
        .select("intake_form_id")
        .eq("id", planId)
        .single();
    
    const { data: intake } = await supabase
        .from("job_intake_forms")
        .select("job_role")
        .eq("id", plan?.intake_form_id)
        .single();
    
    const skillName = intake?.job_role || "General AI";

    // Create ONLY skill (real, not fake)
    await supabase.from("skills").upsert({
        user_id: userId,
        label: skillName,
        level: "Beginner",
        percentage: 0,
    }, {
        onConflict: "user_id,label"
    });
}