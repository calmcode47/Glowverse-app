import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { theme } from '@/design-system/theme';
import { OptimizedView } from '@/components/optimized/OptimizedView';

interface Props {
  mode?: 'analysis' | 'tryon';
}

export default function ProCameraOverlay({ mode = 'analysis' }: Props) {
  return (
    <OptimizedView withShadow style={styles.container}>
      <View style={styles.frame} />
      <View style={styles.footer}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>{mode === 'analysis' ? 'Face aligned • Good lighting' : 'Ready for try-on'}</Text>
      </View>
    </OptimizedView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between'
  },
  frame: {
    alignSelf: 'center',
    width: '70%',
    height: '50%',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FF6B2C',
    marginTop: 80
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3250',
    margin: theme.spacing[4],
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.xl
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#B4FF39',
    marginRight: theme.spacing[2]
  },
  statusText: {
    color: theme.colors.neutral[0],
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium as any
  }
});
