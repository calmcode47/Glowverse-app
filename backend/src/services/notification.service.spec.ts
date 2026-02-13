
import { NotificationService } from "../../src/services/notification.service";
import { AppError } from "../../src/utils/errors";

import { prisma } from "../../src/config/database";
const mockPrisma = prisma as any;

jest.mock("../../src/config/database", () => {
    const mockPrisma = {
        notification: {
            create: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
            delete: jest.fn(),
            findFirst: jest.fn()
        }
    };
    return {
        __esModule: true,
        prisma: mockPrisma
    };
});

describe("NotificationService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createNotification", () => {
        it("should create notification", async () => {
            (prisma.notification.create as jest.Mock).mockResolvedValue({
                id: "notif-1",
                userId: "user-1",
                title: "Test",
                message: "Message",
                type: "INFO",
                isRead: false
            });

            const result = await NotificationService.createNotification({
                userId: "user-1",
                title: "Test",
                message: "Message",
                type: "INFO" as any
            });

            expect(result).toBeDefined();
            expect(prisma.notification.create).toHaveBeenCalledWith({
                data: {
                    userId: "user-1",
                    title: "Test",
                    message: "Message",
                    type: "INFO",
                    priority: "NORMAL",
                    data: null
                }
            });
        });
    });

    describe("markAsRead", () => {
        it("should mark notification as read", async () => {
            (prisma.notification.findFirst as jest.Mock).mockResolvedValue({ id: "notif-1" });
            (prisma.notification.update as jest.Mock).mockResolvedValue({
                id: "notif-1",
                isRead: true
            });

            await NotificationService.markAsRead("user-1", "notif-1");

            expect(prisma.notification.update).toHaveBeenCalledWith({
                where: { id: "notif-1" },
                data: { isRead: true }
            });
        });
    });
});
