import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/themeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProfessionalBackgroundProps {
    variant?: 'subtle' | 'normal' | 'vibrant';
}

// Clean professional background - keeping it simple and respecting theme
export default function ProfessionalBackground({ variant = 'subtle' }: ProfessionalBackgroundProps) {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            {/* 
               User requested to remove the "black background".
               We will just render the container with the theme's primary background color.
               If a gradient is desired later, it can be added back, but for now 
               stripping it down is the direct fix for "remove that black background".
            */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1,
    },
});

