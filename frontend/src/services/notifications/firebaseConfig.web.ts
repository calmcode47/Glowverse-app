import { Platform } from "react-native";
import { deepLinkingService } from "../deepLinking.service";
import * as notificationsApi from "../api/notifications.api";

class WebNotificationService {
  async initialize() {
    return false;
  }
  async requestPermission(): Promise<boolean> {
    return Notification && Notification.requestPermission
      ? (await Notification.requestPermission()) === "granted"
      : false;
  }
  async getDeviceToken(): Promise<string | null> {
    return null;
  }
  async registerDeviceToken(_token: string) {
    // no-op on web
  }
  handleNotificationReceived(_cb: (msg: any) => void) {}
  handleNotificationTapped(_cb: (msg: any) => void) {}
  setupNotificationListeners() {}
  async setBadgeCount(_count: number) {}
  async clearBadge() {}
  cleanup() {}
  displayInAppNotification(_notification: any) {}
  handleNotificationTap(notification: any) {
    const data = notification?.data || {};
    const { deepLink } = data;
    if (deepLink) {
      deepLinkingService.navigate(deepLink);
    }
  }
}

export const notificationService = new WebNotificationService();

