import { groupNotificationsByDate } from "../notificationGrouper";

describe("notificationGrouper", () => {
  it("groups by relative date ranges", () => {
    const now = Date.now();
    const mk = (deltaMs: number) => ({ id: String(deltaMs), title: "", message: "", read: false, createdAt: new Date(now - deltaMs).toISOString() });
    const items = [
      mk(1000 * 60),           // today
      mk(1000 * 60 * 60 * 26), // yesterday+
      mk(1000 * 60 * 60 * 24 * 3), // this week
      mk(1000 * 60 * 60 * 24 * 10) // older
    ] as any[];
    const g = groupNotificationsByDate(items);
    expect(g.today.length).toBeGreaterThanOrEqual(1);
    expect(g.yesterday.length + g.thisWeek.length + g.older.length).toBeGreaterThanOrEqual(1);
  });
});

