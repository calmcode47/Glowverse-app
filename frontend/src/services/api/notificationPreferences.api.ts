/**
 * Notification Preferences API Service
 * 
 * Frontend API client for notification preferences.
 */

import { client } from './client';
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface NotificationPreferences {
    id: string;
    userId: string;

    // Channel preferences
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;

    // Category preferences
    ordersEnabled: boolean;
    promotionsEnabled: boolean;
    fitnessEnabled: boolean;
    accountEnabled: boolean;
    socialEnabled: boolean;

    // Frequency settings
    promotionFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
    digestEnabled: boolean;
    digestTime: string;

    // Quiet hours
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;

    createdAt: string;
    updatedAt: string;
}

export interface UpdatePreferencesDto {
    emailEnabled?: boolean;
    pushEnabled?: boolean;
    smsEnabled?: boolean;
    ordersEnabled?: boolean;
    promotionsEnabled?: boolean;
    fitnessEnabled?: boolean;
    accountEnabled?: boolean;
    socialEnabled?: boolean;
    promotionFrequency?: 'daily' | 'weekly' | 'monthly' | 'never';
    digestEnabled?: boolean;
    digestTime?: string;
    quietHoursEnabled?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
}

/**
 * Get current user's notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
        const response = await client.get('/api/v1/notifications/preferences');
        return (response.data.data || response.data) as NotificationPreferences;
    } catch {
        const raw = await AsyncStorage.getItem("demo_notification_prefs");
        if (raw) return JSON.parse(raw);
        const now = new Date().toISOString();
        const defaults: NotificationPreferences = {
            id: "demo",
            userId: "demo",
            emailEnabled: true,
            pushEnabled: true,
            smsEnabled: false,
            ordersEnabled: true,
            promotionsEnabled: true,
            fitnessEnabled: true,
            accountEnabled: true,
            socialEnabled: true,
            promotionFrequency: "weekly",
            digestEnabled: true,
            digestTime: "09:00",
            quietHoursEnabled: false,
            quietHoursStart: "22:00",
            quietHoursEnd: "07:00",
            createdAt: now,
            updatedAt: now
        };
        await AsyncStorage.setItem("demo_notification_prefs", JSON.stringify(defaults));
        return defaults;
    }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
    updates: UpdatePreferencesDto
): Promise<NotificationPreferences> {
    try {
        const response = await client.patch('/api/v1/notifications/preferences', updates);
        return (response.data.data || response.data) as NotificationPreferences;
    } catch {
        const current = await getNotificationPreferences();
        const next = { ...current, ...updates, updatedAt: new Date().toISOString() } as NotificationPreferences;
        await AsyncStorage.setItem("demo_notification_prefs", JSON.stringify(next));
        return next;
    }
}

/**
 * Reset preferences to defaults
 */
export async function resetNotificationPreferences(): Promise<NotificationPreferences> {
    try {
        const response = await client.post('/api/v1/notifications/preferences/reset');
        return (response.data.data || response.data) as NotificationPreferences;
    } catch {
        await AsyncStorage.removeItem("demo_notification_prefs");
        return getNotificationPreferences();
    }
}
