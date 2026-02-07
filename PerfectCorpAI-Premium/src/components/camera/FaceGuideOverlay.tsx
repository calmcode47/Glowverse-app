import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { theme } from '@/design-system/theme';

interface Props {
  faceDetected: boolean;
}

export default function FaceGuideOverlay({ faceDetected }: Props) {
  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={[styles.circle, faceDetected ? styles.circleActive : styles.circleInactive]} />
      <Text style={[styles.text, faceDetected ? styles.textActive : styles.textInactive]}>
        {faceDetected ? 'Face detected' : 'Align your face'}
      </Text>
    </View>
  );
}

const circleSize = 220;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    alignItems: 'center',
    gap: theme.spacing[2]
  },
  circle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    borderWidth: 3
  },
  circleActive: {
    borderColor: theme.colors.accent[500]
  },
  circleInactive: {
    borderColor: theme.colors.primary[500]
  },
  text: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium as any
  },
  textActive: {
    color: theme.colors.neutral[0]
  },
  textInactive: {
    color: theme.colors.neutral[200]
  }
});
