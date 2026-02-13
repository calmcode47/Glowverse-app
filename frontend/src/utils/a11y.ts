import { AccessibilityInfo, Platform } from "react-native";
let Haptics: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Haptics = require("expo-haptics");
} catch {}

export function a11y(label: string, options?: { hint?: string; role?: "button" | "link" | "image" | "none"; disabled?: boolean }) {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: options?.hint,
    accessibilityRole: options?.role,
    accessibilityState: options?.disabled ? { disabled: true } : undefined
  };
}

export function announce(message: string) {
  try {
    AccessibilityInfo.announceForAccessibility?.(message);
  } catch {}
}

export async function haptic(type: "light" | "medium" | "heavy" | "success" | "error" = "light") {
  if (!Haptics) return;
  try {
    if (type === "success" && Haptics.notificationAsync) return await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (type === "error" && Haptics.notificationAsync) return await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    const map: any = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy
    };
    await Haptics.impactAsync?.(map[type] || Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

export function touchTarget() {
  return { minWidth: 44, minHeight: 44 };
}
