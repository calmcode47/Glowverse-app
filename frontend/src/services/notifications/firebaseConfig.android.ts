import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as notificationsApi from "../api/notifications.api";
import { deepLinkingService } from "../deepLinking.service";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

class ExpoNotificationServiceAndroid {
  private receivedSub?: Notifications.Subscription;
  private responseSub?: Notifications.Subscription;

  async initialize() {
    const permission = await this.requestPermission();
    if (!permission) return false;
    const token = await this.getDeviceToken();
    if (token) {
      await this.registerDeviceToken(token);
      this.setupNotificationListeners();
    }
    return true;
  }

  async requestPermission(): Promise<boolean> {
    const settings = await Notifications.getPermissionsAsync();
    let granted = settings.granted;
    if (!granted) {
      const req = await Notifications.requestPermissionsAsync();
      granted = req.granted;
    }
    return granted;
  }

  async getDeviceToken(): Promise<string | null> {
    try {
      const response = await Notifications.getExpoPushTokenAsync();
      return response.data || null;
    } catch {
      return null;
    }
  }

  async registerDeviceToken(token: string) {
    try {
      await notificationsApi.registerDevice({
        deviceToken: token,
        platform: Platform.OS,
      });
    } catch {}
  }

  setupNotificationListeners() {
    this.receivedSub = Notifications.addNotificationReceivedListener((_notification) => {});
    this.responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = (response.notification.request.content.data || {}) as any;
      this.handleNotificationTap({ data });
    });
  }

  handleNotificationReceived(_cb: (message: any) => void) {}
  handleNotificationTapped(_cb: (message: any) => void) {}

  async setBadgeCount(_count: number) {}
  async clearBadge() {}

  cleanup() {
    this.receivedSub?.remove();
    this.responseSub?.remove();
  }

  displayInAppNotification(_notification: any) {}

  handleNotificationTap(notification: any) {
    const data = notification?.data || {};
    const { deepLink, orderId, productId, type } = data;
    if (deepLink) {
      deepLinkingService.navigate(deepLink);
      return;
    }
    switch (type) {
      case "order_shipped":
      case "order_delivered":
        if (orderId) deepLinkingService.navigate(`glowverse://order/${orderId}`);
        break;
      case "promo_available":
        deepLinkingService.navigate("glowverse://promo");
        break;
      case "product_back_in_stock":
        if (productId) deepLinkingService.navigate(`glowverse://product/${productId}`);
        break;
      default:
        deepLinkingService.navigate("glowverse://notifications");
    }
  }
}

export const notificationService = new ExpoNotificationServiceAndroid();

