// src/app/create-plan/page.tsx
import { requireUser } from "@/lib/auth/requireUser";
import CreatePlanForm from "./CreatePlanForm";

export default async function CreatePlanPage() {
    // Protect page
    const { user } = await requireUser("/create-plan");

    return <CreatePlanForm userId={user.id} />;
}