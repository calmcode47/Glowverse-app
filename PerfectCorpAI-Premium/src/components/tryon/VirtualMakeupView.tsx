import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { theme } from '@/design-system/theme';

interface VirtualMakeupViewProps {
  imageUri?: string;
  color: string;
  intensity: number; // 0..1
  style?: ViewStyle;
}

export default function VirtualMakeupView({ imageUri, color, intensity, style }: VirtualMakeupViewProps) {
  return (
    <View style={[styles.container, style]}>
      {imageUri ? (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
          <View style={[styles.overlay, { backgroundColor: color, opacity: intensity }]} />
        </>
      ) : (
        <View style={[styles.placeholder, theme.shadows.md]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.neutral[200]
  },
  image: {
    width: '100%',
    height: '100%'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject
  },
  placeholder: {
    flex: 1,
    backgroundColor: theme.colors.neutral[300]
  }
});
