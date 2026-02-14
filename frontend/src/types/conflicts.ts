export enum ConflictType {
  CART_ITEM_OUT_OF_STOCK = "cart_item_out_of_stock",
  CART_ITEM_PRICE_CHANGED = "cart_item_price_changed",
  CART_ITEM_REMOVED = "cart_item_removed",
  ADDRESS_VALIDATION_FAILED = "address_validation_failed",
  FAVORITE_ALREADY_EXISTS = "favorite_already_exists",
  RESOURCE_NOT_FOUND = "resource_not_found",
  VERSION_CONFLICT = "version_conflict",
  UNKNOWN = "unknown"
}

export interface SyncConflict {
  id: string;
  type: ConflictType;
  operationType: "create" | "update" | "delete";
  resource: "cart_item" | "address" | "favorite" | "profile";
  localState: any;
  serverState: any | null;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
  retryable: boolean;
  autoResolvable: boolean;
}

export interface ConflictResolution {
  action: "accept_server" | "retry_local" | "discard" | "manual_fix";
  modifiedData?: any;
}

