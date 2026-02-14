import AsyncStorage from "@react-native-async-storage/async-storage";
import { analytics } from "./analytics.service";
import { conflictDetector } from "./conflictDetector.service";
import { client as apiClient } from "./api/client";
import { ConflictType, type ConflictResolution, type SyncConflict } from "../types/conflicts";

class ConflictQueueService {
  private conflicts: Map<string, SyncConflict> = new Map();
  private listeners: Set<(conflicts: SyncConflict[]) => void> = new Set();
  private activeListeners: Set<(conflict: SyncConflict | null) => void> = new Set();
  private activeConflictId: string | null = null;

  async addConflict(conflict: SyncConflict): Promise<void> {
    this.conflicts.set(conflict.id, conflict);
    await this.persistConflicts();
    this.notifyListeners();
    if (conflictDetector.canAutoResolve(conflict)) {
      await this.autoResolveConflict(conflict);
    } else {
      this.showConflictModal(conflict);
    }
    await analytics.logEvent({
      name: "sync_conflict_detected",
      properties: {
        conflict_type: conflict.type,
        resource: conflict.resource,
        auto_resolvable: conflict.autoResolvable
      }
    });
  }

  async resolveConflict(conflictId: string, resolution: ConflictResolution): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return;
    await this.applyResolution(conflict, resolution);
    this.conflicts.delete(conflictId);
    if (this.activeConflictId === conflictId) this.setActiveConflict(null);
    await this.persistConflicts();
    this.notifyListeners();
    await analytics.logEvent({
      name: "sync_conflict_resolved",
      properties: {
        conflict_type: conflict.type,
        resolution_action: resolution.action,
        manual: true
      }
    });
  }

  private async autoResolveConflict(conflict: SyncConflict): Promise<void> {
    const resolution = conflictDetector.suggestResolution(conflict);
    try {
      await this.applyResolution(conflict, resolution);
      this.conflicts.delete(conflict.id);
      if (this.activeConflictId === conflict.id) this.setActiveConflict(null);
      await this.persistConflicts();
      await analytics.logEvent({
        name: "sync_conflict_resolved",
        properties: {
          conflict_type: conflict.type,
          resolution_action: resolution.action,
          manual: false
        }
      });
    } catch {
      this.showConflictModal(conflict);
    }
  }

  private async applyResolution(conflict: SyncConflict, resolution: ConflictResolution): Promise<void> {
    switch (resolution.action) {
      case "accept_server":
        return;
      case "retry_local":
        await this.retryOperation(conflict, resolution.modifiedData ?? conflict.localState);
        return;
      case "discard":
        return;
      case "manual_fix":
        return;
    }
  }

  private async retryOperation(conflict: SyncConflict, data: any): Promise<void> {
    const endpoint = this.getEndpointForResource(conflict.resource);
    if (conflict.operationType === "create") {
      await apiClient.post(endpoint, data);
    } else if (conflict.operationType === "update") {
      const id = conflict.localState?.id ?? data?.id;
      if (!id) throw new Error("Missing id");
      await apiClient.put(`${endpoint}/${encodeURIComponent(String(id))}`, data);
    } else if (conflict.operationType === "delete") {
      const id = conflict.localState?.id ?? data?.id;
      if (!id) throw new Error("Missing id");
      await apiClient.delete(`${endpoint}/${encodeURIComponent(String(id))}`);
    }
  }

  private getEndpointForResource(resource: string): string {
    const endpoints: Record<string, string> = {
      cart_item: "/api/v1/cart/items",
      address: "/api/v1/addresses",
      favorite: "/api/v1/favorites",
      profile: "/api/v1/users/me"
    };
    return endpoints[resource] || "/api/v1/";
  }

  private showConflictModal(conflict: SyncConflict): void {
    this.setActiveConflict(conflict.id);
  }

  private getConflictMessage(conflict: SyncConflict): string {
    const messages: Record<ConflictType, string> = {
      [ConflictType.CART_ITEM_PRICE_CHANGED]: "Price updated",
      [ConflictType.CART_ITEM_OUT_OF_STOCK]: "Item unavailable",
      [ConflictType.CART_ITEM_REMOVED]: "Item removed",
      [ConflictType.ADDRESS_VALIDATION_FAILED]: "Address validation error",
      [ConflictType.FAVORITE_ALREADY_EXISTS]: "Already in favorites",
      [ConflictType.RESOURCE_NOT_FOUND]: "Not found",
      [ConflictType.VERSION_CONFLICT]: "Version conflict",
      [ConflictType.UNKNOWN]: "Unknown conflict"
    };
    return messages[conflict.type] || "Conflict resolved";
  }

  private async persistConflicts(): Promise<void> {
    const conflictsArray = Array.from(this.conflicts.values()).map((c) => ({
      ...c,
      timestamp: c.timestamp instanceof Date ? c.timestamp.toISOString() : c.timestamp
    }));
    await AsyncStorage.setItem("sync_conflicts", JSON.stringify(conflictsArray));
  }

  async loadConflicts(): Promise<void> {
    const data = await AsyncStorage.getItem("sync_conflicts");
    if (data) {
      try {
        const conflicts: any[] = JSON.parse(data);
        conflicts.forEach((c) => {
          const restored: SyncConflict = {
            ...c,
            timestamp: new Date(c.timestamp)
          };
          this.conflicts.set(restored.id, restored);
        });
        this.notifyListeners();
      } catch {}
    }
  }

  getConflicts(): SyncConflict[] {
    return Array.from(this.conflicts.values());
  }

  subscribe(listener: (conflicts: SyncConflict[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeActive(listener: (conflict: SyncConflict | null) => void): () => void {
    this.activeListeners.add(listener);
    listener(this.getActiveConflict());
    return () => {
      this.activeListeners.delete(listener);
    };
  }

  getActiveConflict(): SyncConflict | null {
    if (!this.activeConflictId) return null;
    return this.conflicts.get(this.activeConflictId) || null;
    }

  clearActiveConflict(): void {
    this.setActiveConflict(null);
  }

  private setActiveConflict(conflictId: string | null): void {
    this.activeConflictId = conflictId;
    const active = this.getActiveConflict();
    this.activeListeners.forEach((l) => l(active));
  }

  private notifyListeners(): void {
    const snapshot = this.getConflicts();
    this.listeners.forEach((l) => l(snapshot));
  }

  focusConflict(conflictId: string): void {
    this.setActiveConflict(conflictId);
  }
}

export const conflictQueue = new ConflictQueueService();
