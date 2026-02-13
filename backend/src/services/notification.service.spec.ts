
import { NotificationService } from "../../src/services/notification.service";
import { AppError } from "../../src/utils/errors";

const mockPrisma = {
    notification: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        delete: jest.fn()
    }
};

jest.mock("../../src/config/database", () => ({
    __esModule: true,
    default: mockPrisma
}));

describe("NotificationService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createNotification", () => {
        it("should create notification", async () => {
            mockPrisma.notification.create.mockResolvedValue({
                id: "notif-1",
                userId: "user-1",
                title: "Test",
                message: "Message",
                type: "INFO",
                isRead: false
            });

            const result = await NotificationService.createNotification(
                "user-1",
                "Test",
                "Message",
                "INFO"
            );

            expect(result).toBeDefined();
            expect(mockPrisma.notification.create).toHaveBeenCalledWith({
                data: {
                    userId: "user-1",
                    title: "Test",
                    message: "Message",
                    type: "INFO"
                }
            });
        });
    });

    describe("markAsRead", () => {
        it("should mark notification as read", async () => {
            mockPrisma.notification.update.mockResolvedValue({
                id: "notif-1",
                isRead: true
            });

            await NotificationService.markAsRead("notif-1");

            expect(mockPrisma.notification.update).toHaveBeenCalledWith({
                where: { id: "notif-1" },
                data: { isRead: true }
            });
        });
    });
});
