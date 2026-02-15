import React from "react";
import { Platform } from "react-native";
import { notificationService } from "../services/notifications/firebaseConfig";
import { client } from "../services/api/client";
import { useAuth } from "./AuthContext";
import { deepLinkingService } from "../services/deepLinking.service";
import { analytics } from "../services/analytics.service";
import { AnalyticsEventName } from "../services/analytics/types";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  deepLink?: string;
  type?: string;
};

type Ctx = {
  expoPushToken: string | null;
  unreadCount: number;
  notifications: AppNotification[];
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  requestPermission: () => Promise<boolean>;
};

const NotificationsContext = React.createContext<Ctx | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [expoPushToken, setExpoPushToken] = React.useState<string | null>(null);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      initializePush().catch(() => { });
    }
    return () => notificationService.cleanup();
  }, [isAuthenticated]);

  React.useEffect(() => {
    notificationService.handleNotificationReceived(async () => {
      setUnreadCount((x) => x + 1);
      await refreshNotifications();
    });
    notificationService.handleNotificationTapped((response) => {
      const data = response.notification.request.content.data as any;
      handleNotificationNavigation(data);
    });
    refreshNotifications().catch(() => {});
  }, []);

  async function initializePush() {
    const granted = await notificationService.requestPermission();
    if (!granted) return;
    const token = await notificationService.getDeviceToken();
    if (!token) return;
    setExpoPushToken(token);
    try {
      await client.post("/api/v1/notifications/register-device", { deviceToken: token, platform: Platform.OS });
    } catch { }
    await refreshNotifications();
  }

  async function refreshNotifications() {
    setLoading(true);
    try {
      const res = await client.get("/api/v1/notifications");
      const list: AppNotification[] = res.data.notifications || res.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setNotifications(list);
        const unread = list.filter((n) => !n.read).length;
        setUnreadCount(unread);
        await notificationService.setBadgeCount(unread);
        return;
      }
      // Fallthrough to demo population when empty
      throw new Error("No notifications");
    } catch {
      // Demo notifications as fallback for dev
      const now = Date.now();
      const demo: AppNotification[] = [
        {
          id: "demo1",
          title: "Welcome to Glowverse",
          message: "Explore featured products and personalized deals.",
          type: "system",
          createdAt: new Date(now - 1000 * 60 * 60).toISOString(),
          read: false
        },
        {
          id: "demo2",
          title: "Back in Stock",
          message: "Ray-Ban Aviator Classic is available again.",
          type: "product",
          createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
          read: false,
          deepLink: "glowverse://product/sg-001"
        },
        {
          id: "demo3",
          title: "Limited-Time Offer",
          message: "Use code SUMMER2024 for 15% off select items.",
          type: "promo",
          createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
          read: true
        }
      ];
      setNotifications(demo);
      const unread = demo.filter((n) => !n.read).length;
      setUnreadCount(unread);
      await notificationService.setBadgeCount(unread);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      await client.patch(`/api/v1/notifications/${encodeURIComponent(id)}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((x) => Math.max(0, x - 1));
      await notificationService.setBadgeCount(Math.max(0, unreadCount - 1));
    } catch { }
  }

  async function markAllAsRead() {
    let ok = false;
    try {
      await client.patch("/api/v1/notifications/read-all");
      ok = true;
    } catch { }
    // Update state even if the backend call fails during dev/offline
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try { await notificationService.clearBadge(); } catch {}
  }

  async function deleteNotification(id: string) {
    try {
      await client.delete(`/api/v1/notifications/${encodeURIComponent(id)}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      analytics.trackEvent(AnalyticsEventName.NOTIFICATION_DISMISSED, { notification_id: id });
    } catch { }
  }

  async function requestPermission(): Promise<boolean> {
    return notificationService.requestPermission();
  }

  function handleNotificationNavigation(data: any) {
    if (!data) return;
    const { type, id, deepLink } = data;
    if (deepLink) {
      deepLinkingService.navigate(deepLink);
      return;
    }
    if (type === "order" && id) deepLinkingService.navigate(`glowverse://order/${encodeURIComponent(String(id))}`);
    else if (type === "product" && id) deepLinkingService.navigate(`glowverse://product/${encodeURIComponent(String(id))}`);
    else if (type === "promotion") deepLinkingService.navigate("glowverse://promo");
    else if (type === "referral") deepLinkingService.navigate("glowverse://referral");
    else deepLinkingService.navigate("glowverse://notifications");
  }

  const value: Ctx = {
    expoPushToken,
    unreadCount,
    notifications,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestPermission
  };
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = React.useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
