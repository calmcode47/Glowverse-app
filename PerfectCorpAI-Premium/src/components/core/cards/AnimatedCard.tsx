import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/design-system/theme';
import * as Haptics from 'expo-haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ElevationKey = 'sm' | 'base' | 'md' | 'lg' | 'xl';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  withGradient?: boolean;
  gradientColors?: string[];
  style?: ViewStyle;
  elevation?: ElevationKey;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  withGradient = false,
  gradientColors = theme.gradients.primary.soft,
  style,
  elevation = 'md'
}) => {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(pressed.value, [0, 1], [0.15, 0.25]);
    return { transform: [{ scale: scale.value }], shadowOpacity };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
    pressed.value = withSpring(1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    pressed.value = withSpring(0);
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  if (withGradient) {
    const shadowStyle = theme.shadows[elevation] as any;
    return (
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!onPress}
        style={[styles.container, shadowStyle, animatedStyle, style]}
        activeOpacity={0.9}
      >
        <LinearGradient colors={gradientColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          {children}
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
      style={[styles.card, theme.shadows[elevation] as any, animatedStyle, style]}
      activeOpacity={0.9}
    >
      {children}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden'
  },
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4]
  },
  gradient: {
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.xl
  }
});
