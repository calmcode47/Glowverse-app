import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export class InventoryService {
    /**
     * Decrease stock for a list of order items
     */
    async decreaseStock(items: any[], tx?: Prisma.TransactionClient): Promise<void> {
        const client = tx || prisma;

        for (const item of items) {
            await client.product.update({
                where: { id: item.productId },
                data: {
                    stock: { decrement: item.quantity },
                    purchaseCount: { increment: item.quantity }
                }
            });
        }
    }

    /**
     * Increase stock (e.g., on cancellation or refund)
     */
    async increaseStock(items: any[], tx?: Prisma.TransactionClient): Promise<void> {
        const client = tx || prisma;

        for (const item of items) {
            await client.product.update({
                where: { id: item.productId },
                data: {
                    stock: { increment: item.quantity }
                }
            });
        }
    }
}

export const inventoryService = new InventoryService();
