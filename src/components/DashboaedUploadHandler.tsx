// src/components/DashboaedUploadHandler.tsx
"use client";

import { useRouter } from "next/navigation";
import UploadElement from "./UploadElement";
import { ParsedJobData } from "@/types";

export default function DashboardUploadHandler() {
    const router = useRouter();

    function handleParsed(_data: ParsedJobData, docId: string) {
        // redirect to creatre plan with docId
        router.push(`/create-plan?docId=${docId}`);
    }

    return <UploadElement onParsed={handleParsed} />;
}