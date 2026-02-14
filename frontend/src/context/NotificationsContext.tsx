import React from "react";
import { Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { notificationService } from "../services/notifications.service";
import { client } from "../services/api/client";
import * as Notifications from "expo-notifications";
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
  const navigation = useNavigation<any>();
  const [expoPushToken, setExpoPushToken] = React.useState<string | null>(null);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      initializePush().catch(() => {});
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
  }, []);

  async function initializePush() {
    const granted = await notificationService.requestPermissions();
    if (!granted) return;
    const token = await notificationService.registerForPushNotifications();
    if (!token) return;
    setExpoPushToken(token);
    try {
      await client.post("/api/v1/users/push-token", { token, platform: Platform.OS });
    } catch {}
    await refreshNotifications();
  }

  async function refreshNotifications() {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await client.get("/api/v1/notifications");
      const list: AppNotification[] = res.data.notifications || res.data || [];
      setNotifications(list);
      const unread = list.filter((n) => !n.read).length;
      setUnreadCount(unread);
      await notificationService.setBadgeCount(unread);
    } catch {
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
    } catch {}
  }

  async function markAllAsRead() {
    try {
      await client.patch("/api/v1/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      await notificationService.clearBadge();
    } catch {}
  }

  async function deleteNotification(id: string) {
    try {
      await client.delete(`/api/v1/notifications/${encodeURIComponent(id)}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      analytics.trackEvent(AnalyticsEventName.NOTIFICATION_DISMISSED, { notification_id: id });
    } catch {}
  }

  async function requestPermission(): Promise<boolean> {
    return notificationService.requestPermissions();
  }

  function handleNotificationNavigation(data: any) {
    if (!data) return;
    const { type, id, deepLink } = data;
    if (deepLink) {
      deepLinkingService.navigate(deepLink);
      return;
    }
    if (type === "order") navigation.navigate("OrderDetail", { orderId: id });
    else if (type === "product") navigation.navigate("ProductDetail", { productId: id });
    else if (type === "promotion") navigation.navigate("Promotions");
    else if (type === "referral") navigation.navigate("Referral");
    else if (deepLink) {
      // Linking.openURL(deepLink);
    }
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
