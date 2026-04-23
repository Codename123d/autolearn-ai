// src/types/index.ts
import { ReactNode } from "react";
export type Lesson = {
    id: string;
    title?: string;
    learning_plan_id?: string;
    content?: string;
    lesson_order?: number;
    is_gdpr?: boolean;
};

export type LearningPlan = {
        id: string;
        title: string;
        introduction?: string;
        estimated_duration?: string;
        final_recap?: string;
        lessons?: Lesson[];
        user_id: string;
    };

export type LessonProgress = {
    lesson_id: string;
    completed: boolean;
};

export type CardProps = {
    title: string;
    children: ReactNode;
    badge?: string;
};

export type PlanItemProps = {
    id: string;
    title: string;
    meta: string;
};

export type StatCardProps = {
    label: string;
    value: number | string;
};

export type StatsCardProps = StatCardProps &{
    icon: ReactNode;
};

export type QuizRequest = {
    score: number;
    level: string;
};

export type ParsedDocument = {
    jobRole: string;
    tasks: string[];
    goals: string[];
};

export type ReviewEditorProps = {
    docId: string;
    originalText: string;
    redactedText: string;
};

export type PlanWithLessons = {
    id: string;
    title: string;
    lessons: Lesson[];
};

export type ParsedJobData = {
    job_role?: string;
    seniority_level?: string;
    industry?: string;
    tasks?: string[];
    goals?: string[];
    skill_level?: string;
}; 

export type UploadElementProps = {
    onParsed?: (data: ParsedJobData, docId: string) => void;
};

export type AchievementDef = {
    id: string;
    title: string;
    description: string;
    icon: string;
};

export type SkillType = {
    label: string;
    level: string;
    percentage: number;
};

export type GenerateRequestBody = {
    jobRole: string;
    seniority?: string;
    industry?: string;
    tasks: string;
    goals: string;
    skillLevel?: string;
};

export type Plan = {
    id: string;
    title: string;
    status: string | null;
    lessons: Lesson[] | null;
};

export type LibraryPlan = {
    id: string;
    title: string;
    status: string | null;
    lessons: {
        title?: string;
        is_gdpr?: boolean;
        lesson_order?: number;
    }[] | null;
};

export type LinePoint = {
    date: string;
    completed: number;
};

export type Props = {
    chartData: any[];
    lineData: any[];
    pieData: any[];
    totalPlans: number;
    totalLessons: number;
    completedLessons: number;
};