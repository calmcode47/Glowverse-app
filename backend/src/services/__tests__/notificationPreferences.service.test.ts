/**
 * Unit Tests for NotificationPreferencesService
 */

// Mock Prisma at module level
jest.mock('@prisma/client', () => {
    const mockPrisma = {
        notificationPreferences: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            upsert: jest.fn()
        }
    };
    return {
        PrismaClient: jest.fn(() => mockPrisma)
    };
});

import { NotificationPreferencesService } from '../notificationPreferences.service';
import { PrismaClient } from '@prisma/client';

describe('NotificationPreferencesService', () => {
    let service: NotificationPreferencesService;
    let mockPrisma: any;

    beforeEach(() => {
        service = new NotificationPreferencesService();
        mockPrisma = new PrismaClient() as any;
    });

    describe('getPreferences', () => {
        it('should return existing preferences', async () => {
            const mockPreferences = {
                id: 'pref_123',
                userId: 'user_456',
                emailEnabled: true,
                pushEnabled: true,
                smsEnabled: false,
            };

            mockPrisma.notificationPreferences.findUnique = jest.fn().mockResolvedValue(mockPreferences);

            const result = await service.getPreferences('user_456');

            expect(result).toEqual(mockPreferences);
            expect(mockPrisma.notificationPreferences.findUnique).toHaveBeenCalledWith({
                where: { userId: 'user_456' },
            });
        });

        it('should create default preferences if none exist', async () => {
            const defaultPreferences = {
                id: 'pref_789',
                userId: 'user_new',
                emailEnabled: true,
                pushEnabled: true,
                promotionsEnabled: true,
            };

            mockPrisma.notificationPreferences.findUnique = jest.fn().mockResolvedValue(null);
            mockPrisma.notificationPreferences.create = jest.fn().mockResolvedValue(defaultPreferences);

            const result = await service.getPreferences('user_new');

            expect(result).toEqual(defaultPreferences);
            expect(mockPrisma.notificationPreferences.create).toHaveBeenCalled();
        });
    });

    describe('updatePreferences', () => {
        it('should update existing preferences', async () => {
            const existing = { id: 'pref_123', userId: 'user_456' };
            const updated = { ...existing, pushEnabled: false };

            mockPrisma.notificationPreferences.findUnique = jest.fn().mockResolvedValue(existing);
            mockPrisma.notificationPreferences.update = jest.fn().mockResolvedValue(updated);

            const result = await service.updatePreferences('user_456', { pushEnabled: false });

            expect(result.pushEnabled).toBe(false);
            expect(mockPrisma.notificationPreferences.update).toHaveBeenCalled();
        });

        it('should throw error for invalid time format', async () => {
            await expect(
                service.updatePreferences('user_456', { digestTime: '25:00' })
            ).rejects.toThrow('Invalid time format');

            await expect(
                service.updatePreferences('user_456', { quietHoursStart: '9:00AM' })
            ).rejects.toThrow('Invalid time format');
        });

        it('should accept valid time format', async () => {
            mockPrisma.notificationPreferences.findUnique = jest.fn().mockResolvedValue(null);
            mockPrisma.notificationPreferences.create = jest.fn().mockResolvedValue({});

            await expect(
                service.updatePreferences('user_456', { digestTime: '09:00' })
            ).resolves.not.toThrow();

            await expect(
                service.updatePreferences('user_456', { quietHoursStart: '23:59' })
            ).resolves.not.toThrow();
        });
    });

    describe('resetToDefaults', () => {
        it('should reset all preferences to defaults', async () => {
            const defaults = {
                emailEnabled: true,
                pushEnabled: true,
                smsEnabled: false,
                ordersEnabled: true,
                promotionsEnabled: true,
                fitnessEnabled: true,
                promotionFrequency: 'daily',
            };

            mockPrisma.notificationPreferences.upsert = jest.fn().mockResolvedValue(defaults);

            const result = await service.resetToDefaults('user_456');

            expect(result).toMatchObject(defaults);
            expect(mockPrisma.notificationPreferences.upsert).toHaveBeenCalled();
        });
    });
});
