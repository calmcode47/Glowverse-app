import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { analytics } from "./analytics.service";
import { AnalyticsEventName } from "./analytics/types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});

export class PushNotificationService {
  private notificationListener?: Notifications.Subscription;
  private responseListener?: Notifications.Subscription;

  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      return false;
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === "granted";
  }

  async registerForPushNotifications(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: (Constants as any).expoConfig?.extra?.eas?.projectId || (Constants as any).easConfig?.projectId
      } as any);
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C"
        });
        await Notifications.setNotificationChannelAsync("orders", {
          name: "Order Updates",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250]
        });
        await Notifications.setNotificationChannelAsync("promotions", {
          name: "Promotions & Offers",
          importance: Notifications.AndroidImportance.DEFAULT
        });
      }
      return token.data;
    } catch {
      return null;
    }
  }

  handleNotificationReceived(callback: (notification: Notifications.Notification) => void): void {
    this.notificationListener = Notifications.addNotificationReceivedListener((n) => {
      try {
        const data: any = n.request?.content?.data || {};
        analytics.trackEvent(AnalyticsEventName.NOTIFICATION_RECEIVED, {
          notification_id: String(n.request.identifier || ""),
          notification_type: String(data.type || "")
        });
      } catch {}
      callback(n);
    });
  }

  handleNotificationTapped(callback: (response: Notifications.NotificationResponse) => void): void {
    this.responseListener = Notifications.addNotificationResponseReceivedListener((r) => {
      try {
        const n = r.notification;
        const data: any = n.request?.content?.data || {};
        analytics.trackEvent(AnalyticsEventName.NOTIFICATION_OPENED, {
          notification_id: String(n.request.identifier || ""),
          notification_type: String(data.type || "")
        });
      } catch {}
      callback(r);
    });
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  async scheduleLocalNotification(title: string, body: string, data?: any): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: null
    });
  }

  async cancelNotification(id: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  cleanup(): void {
    if (this.notificationListener) Notifications.removeNotificationSubscription(this.notificationListener);
    if (this.responseListener) Notifications.removeNotificationSubscription(this.responseListener);
  }
}

export const notificationService = new PushNotificationService();
