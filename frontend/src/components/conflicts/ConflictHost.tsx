import React from "react";
import { conflictQueue } from "../../services/conflictQueue.service";
import type { ConflictResolution, SyncConflict } from "../../types/conflicts";
import { ConflictType } from "../../types/conflicts";
import PriceChangedModal from "./PriceChangedModal";
import OutOfStockModal from "./OutOfStockModal";
import ValidationErrorModal from "./ValidationErrorModal";

export default function ConflictHost() {
  const [conflict, setConflict] = React.useState<SyncConflict | null>(null);
  React.useEffect(() => {
    const unsub = conflictQueue.subscribeActive(setConflict);
    return unsub;
  }, []);
  if (!conflict) return null;
  const onResolve = async (resolution: ConflictResolution) => {
    await conflictQueue.resolveConflict(conflict.id, resolution);
  };
  const onCancel = () => conflictQueue.clearActiveConflict();
  if (conflict.type === ConflictType.CART_ITEM_PRICE_CHANGED) {
    return <PriceChangedModal conflict={conflict} onResolve={onResolve} onCancel={onCancel} />;
  }
  if (conflict.type === ConflictType.CART_ITEM_OUT_OF_STOCK) {
    return <OutOfStockModal conflict={conflict} onResolve={onResolve} onCancel={onCancel} />;
  }
  if (conflict.type === ConflictType.ADDRESS_VALIDATION_FAILED) {
    return <ValidationErrorModal conflict={conflict} onResolve={onResolve} onCancel={onCancel} />;
  }
  return null;
}

