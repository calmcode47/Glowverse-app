import { client } from "./client";

export type Activity = {
    id: string;
    type: string;
    duration: number;
    calories: number;
    createdAt: string;
};

export type Goal = {
    id: string;
    name: string;
    target: number;
    progress: number;
    deadline: string;
};

export type FitnessStats = {
    todaySteps: number;
    dailyStepGoal: number;
    caloriesBurned: number;
    weeklySteps: number[];
};

export async function getActivities(): Promise<Activity[]> {
    const res = await client.get<Activity[]>("/api/v1/fitness/activities");
    return res.data;
}

export async function logActivity(data: Omit<Activity, "id" | "createdAt">): Promise<Activity> {
    const res = await client.post<Activity>("/api/v1/fitness/activities", data);
    return res.data;
}

export async function getGoals(): Promise<Goal[]> {
    const res = await client.get<Goal[]>("/api/v1/fitness/goals");
    return res.data;
}

export async function createGoal(data: Omit<Goal, "id" | "progress">): Promise<Goal> {
    const res = await client.post<Goal>("/api/v1/fitness/goals", data);
    return res.data;
}

export async function getStats(): Promise<FitnessStats> {
    const res = await client.get<FitnessStats>("/api/v1/fitness/stats");
    return res.data;
}
