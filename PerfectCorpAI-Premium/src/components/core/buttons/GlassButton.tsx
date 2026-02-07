import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { theme } from '@/design-system/theme';
import * as Haptics from 'expo-haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ title, onPress, icon, disabled = false, style }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.container, animatedStyle, style]}
      activeOpacity={0.9}
    >
      <BlurView intensity={80} style={styles.blur}>
        <Animated.View style={styles.content}>
          {icon}
          <Text style={styles.text}>{title}</Text>
        </Animated.View>
      </BlurView>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  blur: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[3]
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2]
  },
  text: {
    color: theme.colors.neutral[0],
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold as any
  }
});
