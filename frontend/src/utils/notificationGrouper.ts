import type { AppNotification } from "../services/api/notifications.api";

export type GroupedNotifications = { today: AppNotification[]; yesterday: AppNotification[]; thisWeek: AppNotification[]; older: AppNotification[] };

export function groupNotificationsByDate(notifications: AppNotification[]): GroupedNotifications {
  const groups: GroupedNotifications = { today: [], yesterday: [], thisWeek: [], older: [] };
  const now = new Date();
  notifications.forEach((n) => {
    const d = new Date(n.createdAt);
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays < 1) groups.today.push(n);
    else if (diffDays < 2) groups.yesterday.push(n);
    else if (diffDays < 7) groups.thisWeek.push(n);
    else groups.older.push(n);
  });
  return groups;
}

