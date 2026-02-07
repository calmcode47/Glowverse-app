import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { theme } from '@/design-system/theme';
import * as Haptics from 'expo-haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'gradient' | 'solid' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  hapticFeedback?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  variant = 'gradient',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  hapticFeedback = true
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  const sizeStyles = {
    small: { height: theme.dimensions.buttonHeight.small, paddingHorizontal: theme.spacing[4] },
    medium: { height: theme.dimensions.buttonHeight.medium, paddingHorizontal: theme.spacing[6] },
    large: { height: theme.dimensions.buttonHeight.large, paddingHorizontal: theme.spacing[8] }
  };

  const textSizes = {
    small: theme.typography.sizes.sm,
    medium: theme.typography.sizes.base,
    large: theme.typography.sizes.lg
  };

  if (variant === 'gradient') {
    return (
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[animatedStyle, fullWidth && styles.fullWidth, style]}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={theme.gradients.primary.default as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, sizeStyles[size], (disabled || loading) && styles.disabled]}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.neutral[0]} />
          ) : (
            <>
              {icon && iconPosition === 'left' && icon}
              <Text style={[styles.text, { fontSize: textSizes[size] }]}>{title}</Text>
              {icon && iconPosition === 'right' && icon}
            </>
          )}
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        sizeStyles[size],
        variant === 'solid' ? styles.solid : styles.outline,
        (disabled || loading) && styles.disabled,
        fullWidth && styles.fullWidth,
        animatedStyle,
        style
      ]}
      activeOpacity={0.9}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'solid' ? theme.colors.neutral[0] : theme.colors.primary[500]}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text
            style={[styles.text, { fontSize: textSizes[size] }, variant === 'outline' && styles.outlineText]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing[2]
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing[2]
  },
  solid: {
    backgroundColor: theme.colors.primary[500]
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary[500]
  },
  text: {
    color: theme.colors.neutral[0],
    fontWeight: theme.typography.weights.semibold as any
  },
  outlineText: {
    color: theme.colors.primary[500]
  },
  disabled: {
    opacity: 0.5
  },
  fullWidth: {
    width: '100%'
  }
});
