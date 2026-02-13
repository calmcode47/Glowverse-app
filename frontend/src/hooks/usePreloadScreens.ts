import { useEffect } from "react";

export function usePreloadScreens() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      import("../screens/profile/OrderHistoryScreen");
      import("../screens/shop/PromotionsScreen");
      import("../screens/notifications/NotificationsScreen");
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);
}
