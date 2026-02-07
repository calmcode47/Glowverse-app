import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export enum HapticFeedbackType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SELECTION = 'selection'
}

class HapticsManager {
  private enabled: boolean = true;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  async impact(type: HapticFeedbackType = HapticFeedbackType.MEDIUM) {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      switch (type) {
        case HapticFeedbackType.LIGHT:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case HapticFeedbackType.MEDIUM:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case HapticFeedbackType.HEAVY:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      // Haptics may not be available on some environments
    }
  }

  async notification(type: HapticFeedbackType) {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      switch (type) {
        case HapticFeedbackType.SUCCESS:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case HapticFeedbackType.WARNING:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case HapticFeedbackType.ERROR:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch {
      // Haptics may not be available on some environments
    }
  }

  async selection() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // Haptics may not be available on some environments
    }
  }

  async pattern(durations: number[]) {
    if (!this.enabled || Platform.OS !== 'android') return;
    // iOS does not support custom vibration patterns via expo-haptics
    // Implement Android-specific custom vibration via other APIs if needed
  }
}

export const haptics = new HapticsManager();
