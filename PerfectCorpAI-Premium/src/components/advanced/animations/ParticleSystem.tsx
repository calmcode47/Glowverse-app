/**
 * Particle System
 * Floating particles animation for premium feel
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/design-system/theme';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string[];
}

interface ParticleSystemProps {
  particleCount?: number;
  colors?: string[][];
}

const createParticles = (count: number, colors: string[][]): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 30 + 10,
    duration: Math.random() * 5000 + 3000,
    delay: Math.random() * 2000,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));
};

const AnimatedParticle: React.FC<{ particle: Particle }> = ({ particle }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(-height, {
          duration: particle.duration,
          easing: Easing.linear
        }),
        -1,
        false
      )
    );

    opacity.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(0.6, {
          duration: particle.duration / 2,
          easing: Easing.inOut(Easing.ease)
        }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size
        },
        animatedStyle
      ]}
    >
      <LinearGradient colors={particle.color as any} style={styles.particleGradient} />
    </Animated.View>
  );
};

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  particleCount = 20,
  colors = [theme.gradients.primary.default, theme.gradients.secondary.default, theme.gradients.accent.default]
}) => {
  const particles = React.useMemo(() => createParticles(particleCount, colors), [particleCount, colors]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <AnimatedParticle key={particle.id} particle={particle} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden'
  },
  particle: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden'
  },
  particleGradient: {
    flex: 1
  }
});
