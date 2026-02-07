import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { theme } from '@/design-system/theme';
import * as Haptics from 'expo-haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface FloatingButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  withPulse?: boolean;
  style?: ViewStyle;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  icon,
  onPress,
  size = 56,
  position = 'bottom-right',
  withPulse = true,
  style
}) => {
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (withPulse) {
      pulseScale.value = withRepeat(withSequence(withTiming(1.1, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1, false);
    }
  }, [withPulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const positionStyles = {
    'bottom-right': { bottom: theme.spacing[6], right: theme.spacing[6] },
    'bottom-center': { bottom: theme.spacing[6], alignSelf: 'center' },
    'bottom-left': { bottom: theme.spacing[6], left: theme.spacing[6] }
  };

  const pos = positionStyles[position] as ViewStyle;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        pos,
        { width: size, height: size, borderRadius: size / 2 },
        animatedStyle,
        style
      ]}
      activeOpacity={0.9}
    >
      <LinearGradient colors={theme.gradients.primary.default as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.gradient, { borderRadius: size / 2 }]}>
        {icon}
      </LinearGradient>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    ...theme.shadows.lg
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
