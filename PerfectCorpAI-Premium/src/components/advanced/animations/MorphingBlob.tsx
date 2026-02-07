/**
 * Morphing Blob
 * Animated organic shapes for backgrounds
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Svg, Ellipse, Defs, Stop, LinearGradient } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

interface MorphingBlobProps {
  colors?: string[];
  duration?: number;
}

export const MorphingBlob: React.FC<MorphingBlobProps> = ({ colors = ['#A855F7', '#EC4899'], duration = 4000 }) => {
  const rx = useSharedValue(width * 0.4);
  const ry = useSharedValue(height * 0.3);
  const cx = useSharedValue(width * 0.5);
  const cy = useSharedValue(height * 0.4);

  useEffect(() => {
    rx.value = withRepeat(withTiming(width * 0.5, { duration, easing: Easing.inOut(Easing.ease) }), -1, true);
    ry.value = withRepeat(withTiming(height * 0.4, { duration: duration * 1.2, easing: Easing.inOut(Easing.ease) }), -1, true);
    cx.value = withRepeat(withTiming(width * 0.6, { duration: duration * 0.8, easing: Easing.inOut(Easing.ease) }), -1, true);
    cy.value = withRepeat(withTiming(height * 0.5, { duration: duration * 1.5, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    rx: rx.value,
    ry: ry.value,
    cx: cx.value,
    cy: cy.value
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={width} height={height} style={styles.svg}>
        <Defs>
          <LinearGradient id="blobGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors[0]} stopOpacity={0.6} />
            <Stop offset="1" stopColor={colors[1]} stopOpacity={0.6} />
          </LinearGradient>
        </Defs>
        <AnimatedEllipse animatedProps={animatedProps} fill="url(#blobGradient)" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject
  },
  svg: {
    position: 'absolute'
  }
});
