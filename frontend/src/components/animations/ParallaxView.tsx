import React from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    SharedValue,
} from 'react-native-reanimated';

interface ParallaxViewProps {
    children: React.ReactNode;
    scrollY: SharedValue<number>;
    speed?: number;
    style?: ViewStyle;
    startOffset?: number;
}

/**
 * Parallax scrolling component
 * Creates depth effect by moving layers at different speeds
 */
export default function ParallaxView({
    children,
    scrollY,
    speed = 0.5,
    style,
    startOffset = 0,
}: ParallaxViewProps) {
    const animatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            scrollY.value,
            [startOffset, startOffset + 1000],
            [0, -1000 * speed],
            Extrapolate.EXTEND
        );

        return {
            transform: [{ translateY }],
        };
    });

    return <Animated.View pointerEvents="none" style={[animatedStyle, style]}>{children}</Animated.View>;
}

/**
 * Multi-layer parallax container
 */
interface ParallaxLayersProps {
    scrollY: SharedValue<number>;
    layers: {
        component: React.ReactNode;
        speed: number;
        style?: ViewStyle;
    }[];
    containerStyle?: ViewStyle;
}

export function ParallaxLayers({ scrollY, layers, containerStyle }: ParallaxLayersProps) {
    return (
        <Animated.View style={containerStyle}>
            {layers.map((layer, index) => (
                <ParallaxView
                    key={index}
                    scrollY={scrollY}
                    speed={layer.speed}
                    style={layer.style}
                >
                    {layer.component}
                </ParallaxView>
            ))}
        </Animated.View>
    );
}
