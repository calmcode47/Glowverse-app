import AsyncStorage from "@react-native-async-storage/async-storage";
import { client } from "./api/client";
import { analytics } from "./analytics.service";
import { conflictDetector } from "./conflictDetector.service";
import { conflictQueue } from "./conflictQueue.service";
import type { SyncConflict } from "../types/conflicts";

export type OperationType = "create" | "update" | "delete";
export type ResourceType = "cart_item" | "address" | "favorite" | "profile";

export type QueuedOperation = {
  id: string;
  endpoint: string;
  type: OperationType;
  resource: ResourceType;
  data: any;
  retryCount: number;
  maxRetries: number;
};

class OfflineQueueService {
  private storageKey = "offline_queue";

  async enqueue(op: Omit<QueuedOperation, "retryCount" | "maxRetries" | "id"> & { id?: string; maxRetries?: number }): Promise<QueuedOperation> {
    const id = op.id ?? `op_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const full: QueuedOperation = {
      id,
      endpoint: op.endpoint,
      type: op.type,
      resource: op.resource,
      data: op.data,
      retryCount: 0,
      maxRetries: op.maxRetries ?? 3
    };
    const list = await this.getQueuedOperations();
    list.push(full);
    await this.setQueuedOperations(list);
    return full;
  }

  async getQueuedOperations(): Promise<QueuedOperation[]> {
    const raw = await AsyncStorage.getItem(this.storageKey);
    if (!raw) return [];
    try {
      const arr: QueuedOperation[] = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  private async setQueuedOperations(list: QueuedOperation[]): Promise<void> {
    await AsyncStorage.setItem(this.storageKey, JSON.stringify(list));
  }

  async removeFromQueue(id: string): Promise<void> {
    const list = await this.getQueuedOperations();
    const next = list.filter((x) => x.id !== id);
    await this.setQueuedOperations(next);
  }

  async processOperation(op: QueuedOperation): Promise<void> {
    if (op.type === "create") {
      await client.post(op.endpoint, op.data);
    } else if (op.type === "update") {
      const id = op.data?.id;
      await client.put(`${op.endpoint}/${encodeURIComponent(String(id))}`, op.data);
    } else if (op.type === "delete") {
      const id = op.data?.id;
      await client.delete(`${op.endpoint}/${encodeURIComponent(String(id))}`);
    }
  }

  private simplifyError(e: any) {
    return {
      status: e?.status ?? e?.response?.status ?? 0,
      code: e?.code,
      message: e?.message || "Error",
      details: e?.details
    };
  }

  async processQueue(): Promise<void> {
    const operations = await this.getQueuedOperations();
    for (const operation of operations) {
      try {
        await this.processOperation(operation);
        await this.removeFromQueue(operation.id);
        await analytics.logEvent({
          name: "offline_sync_success",
          properties: {
            operation_type: operation.type,
            resource: operation.resource
          }
        });
      } catch (error: any) {
        const apiError = this.simplifyError(error);
        const conflict: SyncConflict | null = conflictDetector.detectConflict(
          {
            id: operation.id,
            type: operation.type,
            resource: operation.resource,
            data: operation.data
          } as any,
          apiError as any
        );
        if (conflict) {
          await conflictQueue.addConflict(conflict);
          await this.removeFromQueue(operation.id);
          await analytics.logEvent({
            name: "offline_sync_conflict",
            properties: {
              operation_type: operation.type,
              conflict_type: conflict.type
            }
          });
        } else {
          operation.retryCount++;
          if (operation.retryCount >= operation.maxRetries) {
            await analytics.logEvent({
              name: "offline_sync_failed",
              properties: {
                operation_type: operation.type,
                resource: operation.resource
              }
            });
            await this.removeFromQueue(operation.id);
          } else {
            const list = await this.getQueuedOperations();
            const idx = list.findIndex((x) => x.id === operation.id);
            if (idx >= 0) {
              list[idx] = operation;
              await this.setQueuedOperations(list);
            }
          }
        }
      }
    }
  }
}

export const offlineQueue = new OfflineQueueService();

