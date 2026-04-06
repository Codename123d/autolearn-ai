// src/lib/actions/progress.ts
import { createSupabaseServer } from "@/lib/supabase/server";

export async function completeLesson(lessonId: string, userId: string) {
    const supabase = await createSupabaseServer();

    const { data: lesson } = await supabase
        .from("lessons")
        .select("learning_plan_id")
        .eq("id", lessonId)
        .single();
    
    const { data: plan } = await supabase
        .from("learning_plans")
        .select("intake_form_id")
        .eq("id", lesson?.learning_plan_id)
        .single();
    
    if (!lesson) throw new Error("Lesson not found");
    if (!plan) throw new Error("Learning plan not found");
    
    const { data: intake } = await supabase
        .from("job_intake_forms")
        .select("job_role")
        .eq("id", plan?.intake_form_id)
        .single();

    // Mark lesson complete
    await supabase
        .from("lesson_progress")
        .upsert({
            lesson_id: lessonId,
            user_id: userId,
            completed: true,
            completed_at: new Date().toISOString(),
        }, {
            onConflict: "user_id,lesson_id"
        });
    
    const { count } = await supabase
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("completed", true);
    
    const safeCount = count ?? 0;

    const percentage = Math.min((safeCount) * 10, 100);

    let level = "Beginner";
    if (percentage >= 70) level = "Advanced";
    else if (percentage >= 40) level = "Intermediate";

    const skillName = intake?.job_role || "General AI";

    await supabase
        .from("skills")
        .upsert({
            user_id: userId,
            label: skillName,
            level,
            percentage,
        }, {
            onConflict: "user_id,label"
        });

    // Get all achievement definitions
    const { data: definitions } = await supabase
        .from("achievement_definitions")
        .select("*");
    
    // Get already unlocked achievements
    const { data: unlocked } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", userId);
    
    const unlockedIds = unlocked?.map(a => a.achievement_id) || [];

    // Find which achievements should be unlocked
    const newUnlocks = definitions?.map(def => {
        console.log("CHECKING:", {
            title: def.title,
            typeMatch: def.type === "lessons_completed",
            thresholdMatch: safeCount >= def.threshold,
            alreadyUnlocked: unlockedIds.includes(def.id),
        });

        if (
            def.type === "lessons_completed" &&
            safeCount >= def.threshold &&
            !unlockedIds.includes(def.id)
        ) {
            return {
                user_id: userId,
                achievement_id: def.id,
            };
        }

        return null;
    }).filter(Boolean) || [];

    // Insert new achievements
    if (newUnlocks.length > 0) {
        console.log("ATTEMPTING INSERT:", newUnlocks);
        
       const { data, error } = await supabase
            .from("user_achievements")
            .insert(newUnlocks);
        
        console.log("INSERT RESULT:", data);
        console.log("INSERT ERROR:", error);
    }
}

export async function syncUserProgress(userId: string) {
    console.log("SYNC RUNNING");
    const supabase = await createSupabaseServer();

    // Get completed lessons count
    const { count } = await supabase
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("completed", true);

    const safeCount = count ?? 0;

    // Get user's job role (for skill label)
    const { data: intake} = await supabase
        .from("job_intake_forms")
        .select("job_role")
        .limit(1)
        .single();

    const skillName = intake?.job_role || "General AI";

    // Calculate skill progression
    const percentage = Math.min((safeCount) * 10, 100);

    let level = "Beginner";
    if (percentage >= 70) level = "Advanced";
    else if (percentage >= 40) level = "Intermediate";

    // Upsert skill
    await supabase
        .from("skills")
        .upsert({
            user_id: userId,
            label: skillName,
            level,
            percentage,
        }, {
            onConflict: "user_id,label"
        });

    // Get all achievement definitions
    const { data: definitions } = await supabase        
        .from("achievement_definitions")
        .select("*");

    // Get already unlocked achievements
    const { data: unlocked } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", userId);

    const unlockedIds = unlocked?.map(a => a.achievement_id) || [];
    console.log("unlockedIds:", unlockedIds);

    // Find new achievements to unlock
    const newUnlocks = definitions
        ?.filter(def =>
            def.type === "lessons_completed" &&
            safeCount >= def.threshold &&
            !unlockedIds.includes(def.id)
        )
        .map(def => ({
            user_id: userId,
            achievement_id: def.id,
        })) || [];

    // Insert new achievements
    if (newUnlocks.length > 0) {
        await supabase
            .from("user_achievements")
            .insert(newUnlocks);
    }

    // Time saved stat
    const timeSavedMinutes = safeCount * 10;

    await supabase
        .from("user_stats")
        .upsert({
            user_id: userId,
            label: "time_saved",
            value: `${timeSavedMinutes} mins`,
            icon: "clock",
        }, {
            onConflict: "user_id,label"
        });

    console.log("UNLOCK CHECK:", {
       safeCount,
       thresholds: definitions?.map(d => d.threshold), 
    });
}