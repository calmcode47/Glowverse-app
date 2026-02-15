import { prisma } from '../config/database';

export class WebhookIdempotencyService {
    /**
     * Check if webhook event has already been processed successfully
     */
    async isProcessed(eventId: string): Promise<boolean> {
        const event = await prisma.webhookEvent.findUnique({
            where: { id: eventId }
        });

        return event?.processed === true;
    }

    /**
     * Mark webhook event as processing (initial record)
     */
    async markAsProcessing(eventId: string, eventType: string): Promise<void> {
        await prisma.webhookEvent.upsert({
            where: { id: eventId },
            create: {
                id: eventId,
                type: eventType,
                processed: false,
                createdAt: new Date()
            },
            update: {
                // If it exists, just ensure it's not marked as processed yet
                // This handles retries where the first attempt crashed before updating status
            }
        });
    }

    /**
     * Mark webhook event as processed successfully
     */
    async markAsProcessed(eventId: string): Promise<void> {
        await prisma.webhookEvent.update({
            where: { id: eventId },
            data: {
                processed: true,
                processedAt: new Date()
            }
        });
    }

    /**
     * Mark webhook event as failed with error details
     */
    async markAsFailed(eventId: string, error: string): Promise<void> {
        await prisma.webhookEvent.update({
            where: { id: eventId },
            data: {
                error,
                processedAt: new Date()
            }
        });
    }
}

export const webhookIdempotencyService = new WebhookIdempotencyService();
