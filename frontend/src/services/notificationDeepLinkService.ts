import { deepLinkingService } from "./deepLinking.service";
import type { AppNotification } from "./api/notifications.api";
import { analytics } from "./analytics.service";

class NotificationDeepLinkService {
  handleNotificationPress(n: AppNotification): void {
    const deep = n.deepLink;
    if (deep) {
      deepLinkingService.navigate(deep);
    } else {
      deepLinkingService.navigate("glowverse://notifications");
    }
    analytics.logEvent({ name: "notification_opened", properties: { notification_id: n.id, type: n.type } }).catch(() => {});
  }
}

export const notificationDeepLinkService = new NotificationDeepLinkService();

