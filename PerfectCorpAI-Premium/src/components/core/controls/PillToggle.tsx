import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ViewStyle } from 'react-native';
import { theme } from '@/design-system/theme';

interface PillToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  style?: ViewStyle;
  activeColor?: string;
}

export const PillToggle: React.FC<PillToggleProps> = ({ value, onChange, style, activeColor = '#FFB800' }) => {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 250, useNativeDriver: true }).start();
  }, [value]);

  return (
    <TouchableOpacity onPress={() => onChange(!value)} style={[styles.container, style]} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.knob,
          {
            transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [2, 34] }) }, { scale: anim }],
            backgroundColor: value ? '#FFFFFF' : '#E2E8F0'
          }
        ]}
      />
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: anim.interpolate({
              inputRange: [0, 1],
              outputRange: ['#E2E8F0', activeColor]
            }) as any
          }
        ]}
      />
      <View style={styles.labels}>
        <Text style={[styles.label, !value && styles.labelActive]}>Off</Text>
        <Text style={[styles.label, value && styles.labelActive]}>On</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 70,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center'
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18
  },
  knob: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[2]
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.neutral[600]
  },
  labelActive: {
    color: theme.colors.neutral[900],
    fontWeight: '700' as any
  }
});
