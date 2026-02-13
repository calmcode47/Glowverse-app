import AsyncStorage from "@react-native-async-storage/async-storage";
let Notifications: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Notifications = require("expo-notifications");
} catch {}

const TOKEN_KEY = "push-token";
const listeners: Array<() => void> = [];

export async function requestPermission(): Promise<boolean> {
  if (!Notifications) return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function registerDeviceToken(): Promise<string | null> {
  if (!Notifications) return null;
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    await AsyncStorage.setItem(TOKEN_KEY, token.data || token);
    return token.data || token;
  } catch {
    return null;
  }
}

export function addListeners() {
  if (!Notifications) return { remove: () => {} };
  const sub1 = Notifications.addNotificationReceivedListener(() => {
    listeners.forEach((fn) => fn());
  });
  const sub2 = Notifications.addNotificationResponseReceivedListener((response: any) => {
    listeners.forEach((fn) => fn());
  });
  return {
    remove: () => {
      sub1?.remove?.();
      sub2?.remove?.();
    }
  };
}

export function onNotificationsChanged(cb: () => void) {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}
