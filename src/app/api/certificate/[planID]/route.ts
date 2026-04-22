// src/app/api/certificate/[planId]/route.ts
import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import crypto from "crypto";
import { Lesson, LessonProgress, PlanWithLessons } from "@/types";

export async function GET(req: Request, { params }: { params: { planId: string } }) {
    const { planId } = params;
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: existingCert } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .eq("plan_id", planId)
        .single();

    let certificate;

    if (existingCert) {
        certificate = existingCert;
    } else {
        const certId = crypto.randomUUID();

        const { data: newCert, error } = await supabase
            .from("certificates")
            .insert({
                user_id: user.id,
                plan_id: planId,
                certificate_id: certId,
            })
            .select()
            .single();
        
        if (error) {
            return NextResponse.json({ error: "Failed to create certificate" }, { status: 500 });
        }

        certificate = newCert;
    }

    // Fetch plan + lessons
    const { data: plan } = await supabase
        .from("learning_plans")
        .select("id, title, lessons (id, is_gdpr)")
        .eq("id", planId)
        .eq("user_id", user.id)
        .single()  as { data: PlanWithLessons | null };

    if (!plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Fetch progress
    const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id);
    
    const lessons = plan.lessons || [];

    if (!lessons.length){
        return NextResponse.json(
            { error: "No lessons found for this plan" },
            { status: 400 }
        );
    }

    const completedLessons = (lessons as Lesson[]).filter((lesson) =>
        (progress as LessonProgress[] | null)?.some(
            (p) => p.lesson_id === lesson.id && p.completed
        )
    );

    const incompleteGdpr = (lessons as Lesson[]).some((lesson) =>
        lesson.is_gdpr &&
        !progress?.some(
            (p) => p.lesson_id === lesson.id && p.completed
        )
    );

    //  Validation
    if (completedLessons.length !== lessons.length || incompleteGdpr) {
        return NextResponse.json(
            { error: "You must complete all lessons (including GDPR)." },
            { status: 403 }
        );
    }

    // Create PDF certificate
    const doc = new PDFDocument();

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const safeTitle = plan.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();

    return new Promise((resolve) => {
        doc.on("end", () => {
            const pdfBuffer = Buffer.concat(chunks);

            resolve(
                new NextResponse(pdfBuffer, {
                    headers: {
                        "Content-Type": "application/pdf",
                        "Content-Disposition": `attachment; filename="${safeTitle}_certificate.pdf"`,
                    },
                })
            );
        });

        // DESIGN
        doc.rect(40, 40, 520, 720).stroke();

        doc.fontSize(30).fillColor("blue").text("AutoLearn AI", {
            align: "center",
        });

        doc.moveDown(2);

        // Certificate Design
        doc.fontSize(28).fillColor("black").text("Certificate of Completion", { align: "center" });

        doc.moveDown();

        doc.fontSize(16).text("This certifies that", { align: "center" });

        doc.moveDown();

        doc.fontSize(22).text(user.email ?? "User", { align: "center" });

        doc.moveDown();

        doc.fontSize(16).text(
            "has successfully completed the AI Learning Plan", 
            { align: "center" }
        );

        doc.moveDown();

        // Plan title included
        doc.fontSize(18).fillColor("green").text(plan.title, {
            align: "center",
        });

        doc.moveDown(2);

        const certId = certificate.certificate_id;

        doc.fontSize(12).fillColor("gray").text(`Certificate ID: ${certId}`, {
            align: "center",
        });

        doc.text(`Date: ${new Date().toLocaleDateString()}`, { 
            align: "center"
        });

        doc.moveDown(2);

        doc.text("________________________________________________", {
            align: "center",
        });

        doc.text("AutoLearn AI Instructor", {
            align: "center",
        });
        
        doc.end();
    });
}