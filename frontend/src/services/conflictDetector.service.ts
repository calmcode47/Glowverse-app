import { ConflictType, type ConflictResolution, type SyncConflict } from "../types/conflicts";

type QueuedOperation = {
  id?: string;
  type: "create" | "update" | "delete";
  resource?: "cart_item" | "address" | "favorite" | "profile" | string;
  data: any;
};

type ApiError = {
  status: number;
  code?: string;
  message: string;
  details?: any;
};

class ConflictDetectorService {
  detectConflict(operation: QueuedOperation, error: ApiError): SyncConflict | null {
    if (error.status === 409) {
      return this.handleVersionConflict(operation, error);
    }
    if (error.status === 422) {
      if (error.code === "OUT_OF_STOCK") {
        return this.handleOutOfStockConflict(operation, error);
      }
      if (error.code === "PRICE_CHANGED") {
        return this.handlePriceChangeConflict(operation, error);
      }
      if (error.code === "VALIDATION_ERROR") {
        return this.handleValidationConflict(operation, error);
      }
      if (error.code === "ALREADY_EXISTS" || error.code === "FAVORITE_ALREADY_EXISTS") {
        return this.handleFavoriteExists(operation, error);
      }
    }
    if (error.status === 404) {
      return this.handleNotFoundConflict(operation, error);
    }
    return null;
  }

  private handleOutOfStockConflict(operation: QueuedOperation, error: ApiError): SyncConflict {
    return {
      id: this.generateId(),
      type: ConflictType.CART_ITEM_OUT_OF_STOCK,
      operationType: "create",
      resource: "cart_item",
      localState: operation.data,
      serverState: null,
      error: {
        code: error.code || "OUT_OF_STOCK",
        message: error.message,
        details: error.details
      },
      timestamp: new Date(),
      retryable: false,
      autoResolvable: false
    };
  }

  private handlePriceChangeConflict(operation: QueuedOperation, error: ApiError): SyncConflict {
    return {
      id: this.generateId(),
      type: ConflictType.CART_ITEM_PRICE_CHANGED,
      operationType: operation.type,
      resource: "cart_item",
      localState: operation.data,
      serverState: {
        currentPrice: error.details?.currentPrice,
        previousPrice: operation.data?.price
      },
      error: {
        code: error.code || "PRICE_CHANGED",
        message: error.message,
        details: error.details
      },
      timestamp: new Date(),
      retryable: true,
      autoResolvable: true
    };
  }

  private handleValidationConflict(operation: QueuedOperation, error: ApiError): SyncConflict {
    return {
      id: this.generateId(),
      type: ConflictType.ADDRESS_VALIDATION_FAILED,
      operationType: operation.type,
      resource: "address",
      localState: operation.data,
      serverState: null,
      error: {
        code: error.code || "VALIDATION_ERROR",
        message: error.message,
        details: error.details
      },
      timestamp: new Date(),
      retryable: true,
      autoResolvable: false
    };
  }

  private handleFavoriteExists(operation: QueuedOperation, error: ApiError): SyncConflict {
    return {
      id: this.generateId(),
      type: ConflictType.FAVORITE_ALREADY_EXISTS,
      operationType: operation.type,
      resource: "favorite",
      localState: operation.data,
      serverState: error.details?.existing || null,
      error: {
        code: error.code || "ALREADY_EXISTS",
        message: error.message,
        details: error.details
      },
      timestamp: new Date(),
      retryable: false,
      autoResolvable: true
    };
  }

  private handleNotFoundConflict(operation: QueuedOperation, error: ApiError): SyncConflict {
    const res: SyncConflict = {
      id: this.generateId(),
      type: operation.resource === "cart_item" ? ConflictType.CART_ITEM_REMOVED : ConflictType.RESOURCE_NOT_FOUND,
      operationType: operation.type,
      resource: (operation.resource as any) || "profile",
      localState: operation.data,
      serverState: null,
      error: {
        code: error.code || "NOT_FOUND",
        message: error.message,
        details: error.details
      },
      timestamp: new Date(),
      retryable: false,
      autoResolvable: false
    };
    return res;
  }

  private handleVersionConflict(operation: QueuedOperation, error: ApiError): SyncConflict {
    return {
      id: this.generateId(),
      type: ConflictType.VERSION_CONFLICT,
      operationType: operation.type,
      resource: (operation.resource as any) || "profile",
      localState: operation.data,
      serverState: error.details?.serverState || null,
      error: {
        code: error.code || "VERSION_CONFLICT",
        message: error.message,
        details: error.details
      },
      timestamp: new Date(),
      retryable: true,
      autoResolvable: false
    };
  }

  canAutoResolve(conflict: SyncConflict): boolean {
    const autoResolvableTypes = [ConflictType.CART_ITEM_PRICE_CHANGED, ConflictType.FAVORITE_ALREADY_EXISTS];
    return conflict.autoResolvable && autoResolvableTypes.includes(conflict.type);
  }

  suggestResolution(conflict: SyncConflict): ConflictResolution {
    switch (conflict.type) {
      case ConflictType.CART_ITEM_PRICE_CHANGED:
        return {
          action: "retry_local",
          modifiedData: {
            ...conflict.localState,
            price: conflict.serverState?.currentPrice
          }
        };
      case ConflictType.CART_ITEM_OUT_OF_STOCK:
        return { action: "discard" };
      case ConflictType.ADDRESS_VALIDATION_FAILED:
        return { action: "manual_fix" };
      case ConflictType.FAVORITE_ALREADY_EXISTS:
        return { action: "accept_server" };
      case ConflictType.CART_ITEM_REMOVED:
      case ConflictType.RESOURCE_NOT_FOUND:
        return { action: "accept_server" };
      default:
        return { action: "accept_server" };
    }
  }

  private generateId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}

export const conflictDetector = new ConflictDetectorService();

