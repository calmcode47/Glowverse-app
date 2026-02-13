import { AccessibilityInfo, findNodeHandle } from "react-native";
import React from "react";

const focusStore = new Map<string, React.RefObject<any>>();

export const focusManagement = {
  setFocus(ref: React.RefObject<any>) {
    if (!ref?.current) return;
    const node = findNodeHandle(ref.current);
    if (node) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  },
  announce(message: string, _options?: { queue?: boolean }) {
    AccessibilityInfo.announceForAccessibility(message);
  },
  async isScreenReaderEnabled(): Promise<boolean> {
    try {
      return await AccessibilityInfo.isScreenReaderEnabled();
    } catch {
      return false;
    }
  },
  storeFocus(elementId: string, ref: React.RefObject<any>) {
    focusStore.set(elementId, ref);
  },
  restoreFocus(elementId: string) {
    const r = focusStore.get(elementId);
    if (r) this.setFocus(r);
  }
};
