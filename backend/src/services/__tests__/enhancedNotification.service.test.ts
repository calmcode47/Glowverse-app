/**
 * Unit Tests for EnhancedNotificationService
 */

import { EnhancedNotificationService } from '../services/enhancedNotification.service';
import { notificationPreferencesService } from '../services/notificationPreferences.service';

jest.mock('../services/notificationPreferences.service');

describe('EnhancedNotificationService', () => {
    let service: EnhancedNotificationService;

    beforeEach(() => {
        service = new EnhancedNotificationService();
        jest.clearAllMocks();
    });

    describe('Type Preferences', () => {
        it('should send notification when type is enabled', async () => {
            const mockPreferences = {
                promotionsEnabled: true,
                emailEnabled: true,
                quietHoursEnabled: false,
                promotionFrequency: 'daily',
            };

            (notificationPreferencesService.getPreferences as jest.Mock).mockResolvedValue(mockPreferences);

            const result = await service.sendNotification({
                userId: 'user_123',
                type: 'promotion',
                channel: 'email',
                subject: 'Sale',
                message: 'Big sale!',
            });

            expect(result).toBe(true);
        });

        it('should suppress notification when type is disabled', async () => {
            const mockPreferences = {
                promotionsEnabled: false,
                emailEnabled: true,
            };

            (notificationPreferencesService.getPreferences as jest.Mock).mockResolvedValue(mockPreferences);

            const result = await service.sendNotification({
                userId: 'user_123',
                type: 'promotion',
                channel: 'email',
                subject: 'Sale',
                message: 'Big sale!',
            });

            expect(result).toBe(false);
        });
    });

    describe('Channel Preferences', () => {
        it('should send via enabled channels only', async () => {
            const mockPreferences = {
                ordersEnabled: true,
                emailEnabled: true,
                pushEnabled: false,
                smsEnabled: false,
                quietHoursEnabled: false,
            };

            (notificationPreferencesService.getPreferences as jest.Mock).mockResolvedValue(mockPreferences);

            const result = await service.sendNotification({
                userId: 'user_123',
                type: 'order',
                channel: 'all',
                subject: 'Order Shipped',
                message: 'Your order has shipped',
            });

            expect(result).toBe(true);
            // Only email should be sent (push and SMS disabled)
        });

        it('should not send if all channels are disabled', async () => {
            const mockPreferences = {
                ordersEnabled: true,
                emailEnabled: false,
                pushEnabled: false,
                smsEnabled: false,
            };

            (notificationPreferencesService.getPreferences as jest.Mock).mockResolvedValue(mockPreferences);

            const result = await service.sendNotification({
                userId: 'user_123',
                type: 'order',
                channel: 'all',
                subject: 'Order Shipped',
                message: 'Your order has shipped',
            });

            expect(result).toBe(false);
        });
    });

    describe('Quiet Hours', () => {
        it('should suppress low-priority notifications during quiet hours', async () => {
            // Mock current time to be 23:00 (within quiet hours 22:00-08:00)
            jest.useFakeTimers().setSystemTime(new Date('2024-01-01T23:00:00'));

            const mockPreferences = {
                promotionsEnabled: true,
                emailEnabled: true,
                quietHoursEnabled: true,
                quietHoursStart: '22:00',
                quietHoursEnd: '08:00',
                promotionFrequency: 'daily',
            };

            (notificationPreferencesService.getPreferences as jest.Mock).mockResolvedValue(mockPreferences);

            const result = await service.sendNotification({
                userId: 'user_123',
                type: 'promotion',
                channel: 'email',
                subject: 'Sale',
                message: 'Sale!',
                priority: 'low',
            });

            expect(result).toBe(false);

            jest.useRealTimers();
        });

        it('should allow high-priority notifications during quiet hours', async () => {
            jest.useFakeTimers().setSystemTime(new Date('2024-01-01T23:00:00'));

            const mockPreferences = {
                ordersEnabled: true,
                emailEnabled: true,
                quietHoursEnabled: true,
                quietHoursStart: '22:00',
                quietHoursEnd: '08:00',
            };

            (notificationPreferencesService.getPreferences as jest.Mock).mockResolvedValue(mockPreferences);

            const result = await service.sendNotification({
                userId: 'user_123',
                type: 'order',
                channel: 'email',
                subject: 'Order Delivered',
                message: 'Your order was delivered',
                priority: 'high',
            });

            expect(result).toBe(true);

            jest.useRealTimers();
        });

        it('should handle overnight quiet hours correctly', async () => {
            // 02:00 AM - within quiet hours (22:00-08:00)
            jest.useFakeTimers().setSystemTime(new Date('2024-01-01T02:00:00'));

            const mockPreferences = {
                promotionsEnabled: true,
                emailEnabled: true,
                quietHoursEnabled: true,
                quietHoursStart: '22:00',
                quietHoursEnd: '08:00',
                promotionFrequency: 'daily',
            };

            (notificationPreferencesService.getPreferences as jest.Mock).mockResolvedValue(mockPreferences);

            const result = await service.sendNotification({
                userId: 'user_123',
                type: 'promotion',
                channel: 'email',
                subject: 'Sale',
                message: 'Sale!',
                priority: 'low',
            });

            expect(result).toBe(false);

            jest.useRealTimers();
        });
    });

    describe('Frequency Limiting', () => {
        it('should suppress promotions when frequency is "never"', async () => {
            const mockPreferences = {
                promotionsEnabled: true,
                emailEnabled: true,
                quietHoursEnabled: false,
                promotionFrequency: 'never',
            };

            (notificationPreferencesService.getPreferences as jest.Mock).mockResolvedValue(mockPreferences);

            const result = await service.sendNotification({
                userId: 'user_123',
                type: 'promotion',
                channel: 'email',
                subject: 'Sale',
                message: 'Big sale!',
            });

            expect(result).toBe(false);
        });
    });
});
