import { useState, useCallback } from "react";
import type { ViewToken } from "react-native";

export function useViewabilityImageLoad() {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const next = new Set<string>();
    viewableItems.forEach((vi) => {
      if (vi.isViewable && vi.key) next.add(String(vi.key));
    });
    setVisibleItems(next);
  }, []);

  const viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 50,
    minimumViewTime: 100
  };

  const isItemVisible = useCallback((id: string) => visibleItems.has(String(id)), [visibleItems]);

  return { onViewableItemsChanged, viewabilityConfig, isItemVisible };
}
