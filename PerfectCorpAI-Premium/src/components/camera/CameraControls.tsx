import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { theme } from '@/design-system/theme';
import * as Haptics from 'expo-haptics';

type FlashMode = 'on' | 'off' | 'auto';

interface Props {
  onCapture: () => void | Promise<void>;
  onToggleCamera: () => void;
  onToggleFlash: () => void;
  flashMode: FlashMode;
  isCapturing: boolean;
  style?: ViewStyle;
}

export default function CameraControls({
  onCapture,
  onToggleCamera,
  onToggleFlash,
  flashMode,
  isCapturing,
  style
}: Props) {
  const handleCapture = () => {
    if (!isCapturing) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onCapture();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={styles.sideButton} onPress={onToggleFlash} activeOpacity={0.8}>
        <Text style={styles.sideText}>{flashMode.toUpperCase()}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.captureButton, isCapturing && styles.captureDisabled]}
        onPress={handleCapture}
        activeOpacity={0.8}
      />
      <TouchableOpacity style={styles.sideButton} onPress={onToggleCamera} activeOpacity={0.8}>
        <Text style={styles.sideText}>FLIP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[6]
  },
  sideButton: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    backgroundColor: theme.colors.glass.medium,
    borderRadius: theme.borderRadius.base
  },
  sideText: {
    color: theme.colors.neutral[0],
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium as any
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.neutral[0],
    borderWidth: 6,
    borderColor: theme.colors.neutral[900]
  },
  captureDisabled: {
    opacity: 0.6
  }
});
