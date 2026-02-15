import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  detected: boolean;
  quality: 'excellent' | 'good' | 'poor' | 'none' | null;
};

export default function FaceDetectionIndicator({ detected, quality }: Props) {
  const bg =
    !detected
      ? 'rgba(255, 193, 7, 0.6)'
      : quality === 'excellent' || quality === 'good'
      ? 'rgba(40, 167, 69, 0.7)'
      : 'rgba(220, 53, 69, 0.7)';
  const label =
    !detected ? 'Align face' : quality === 'excellent' || quality === 'good' ? 'Good' : 'Adjust';
  return (
    <View style={[styles.container, { backgroundColor: bg }]} accessibilityLabel="Face detection indicator">
      <View style={styles.dot} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff'
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2
  }
});

