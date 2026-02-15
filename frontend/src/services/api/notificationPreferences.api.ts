/**
 * Notification Preferences API Service
 * 
 * Frontend API client for notification preferences.
 */

import { client } from './client';

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
    const response = await client.get('/api/v1/notifications/preferences');
    return response.data.data;
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
    updates: UpdatePreferencesDto
): Promise<NotificationPreferences> {
    const response = await client.patch('/api/v1/notifications/preferences', updates);
    return response.data.data;
}

/**
 * Reset preferences to defaults
 */
export async function resetNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await client.post('/api/v1/notifications/preferences/reset');
    return response.data.data;
}
