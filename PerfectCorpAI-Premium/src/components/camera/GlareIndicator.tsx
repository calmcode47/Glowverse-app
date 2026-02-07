import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '@/design-system/theme';

export default function GlareIndicator() {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 600, useNativeDriver: true })
    ])).start();
  }, []);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { transform: [{ scale }] }]} />
      <Text style={styles.text}>Glare</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3250',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: 6
  },
  text: { color: theme.colors.neutral[0], fontSize: theme.typography.sizes.xs, fontWeight: '700' as any }
});
