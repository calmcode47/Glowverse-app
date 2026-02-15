import { combineAndSort } from "../../../src/services/history/aggregate.service";
import type { ActivityItem } from "../../../src/services/history/types";

describe("combineAndSort", () => {
  it("sorts by timestamp desc", () => {
    const items: ActivityItem[] = [
      { id: "1", type: "analysis", timestamp: 1000, title: "A", description: "", metadata: {} },
      { id: "2", type: "fitness", timestamp: 2000, title: "B", description: "", metadata: {} },
      { id: "3", type: "order", timestamp: 1500, title: "C", description: "", metadata: {} }
    ];
    const sorted = combineAndSort(items.slice());
    expect(sorted[0].id).toBe("2");
    expect(sorted[1].id).toBe("3");
    expect(sorted[2].id).toBe("1");
  });
});

