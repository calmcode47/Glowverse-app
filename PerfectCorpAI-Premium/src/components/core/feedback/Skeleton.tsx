/**
 * Skeleton Loader
 * Shimmer effect for loading states
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/design-system/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = theme.borderRadius.base,
  style
}) => {
  const translateX = useSharedValue(-1);

  useEffect(() => {
    translateX.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateValue = interpolate(translateX.value, [-1, 1], [-300, 300], Extrapolate.CLAMP);
    return { transform: [{ translateX: translateValue }] };
  });

  const containerStyle: ViewStyle = { width: width as any, height, borderRadius };
  return (
    <View style={[styles.container, containerStyle, style]}>
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0)'] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.neutral[200],
    overflow: 'hidden'
  },
  shimmer: {
    width: '100%',
    height: '100%'
  },
  gradient: {
    flex: 1
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4]
  }
});

export const SkeletonCard = () => (
  <View style={{ padding: theme.spacing[4] }}>
    <Skeleton height={150} style={{ marginBottom: theme.spacing[3] }} />
    <Skeleton height={20} width="70%" style={{ marginBottom: theme.spacing[2] }} />
    <Skeleton height={16} width="50%" />
  </View>
);

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={styles.listItem}>
        <Skeleton width={60} height={60} borderRadius={theme.borderRadius.full} />
        <View style={{ flex: 1, marginLeft: theme.spacing[3] }}>
          <Skeleton height={20} width="80%" style={{ marginBottom: theme.spacing[2] }} />
          <Skeleton height={16} width="60%" />
        </View>
      </View>
    ))}
  </View>
);
