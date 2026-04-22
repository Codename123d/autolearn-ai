// src/types/index.ts
import { ReactNode } from "react";
export type Lesson = {
    id: string;
    title?: string;
    learning_plan_id: string;
    lesson_order?: number;
    is_gdpr?: boolean;
};

export type LearningPlan = {
    id: string;
    title: string;
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