import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { useTheme } from '../../theme/themeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
    percentage: number;
    color: string;
    size?: number;
    strokeWidth?: number;
    label: string;
    value: string;
    delay?: number;
}

const CircularProgress = ({
    percentage,
    color,
    size = 100,
    strokeWidth = 8,
    label,
    value,
    delay = 0
}: CircularProgressProps) => {
    const { theme } = useTheme();
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withDelay(delay, withTiming(percentage / 100, {
            duration: 1500,
            easing: Easing.out(Easing.exp),
        }));
    }, []);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    return (
        <View style={{ alignItems: 'center', width: size }}>
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={size} height={size}>
                    <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                        {/* Background Circle */}
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={theme.colors.border.light}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        {/* Progress Circle */}
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={color}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={circumference}
                            animatedProps={animatedProps}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>
                <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text.primary }}>
                        {value}
                    </Text>
                </View>
            </View>
            <Text style={{
                marginTop: 8,
                fontSize: 12,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                fontWeight: '500'
            }}>
                {label}
            </Text>
        </View>
    );
};

export default function CircularStats() {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text.primary }]}>Your Activity</Text>
            </View>
            <View style={styles.statsRow}>
                <CircularProgress
                    percentage={75}
                    color={theme.colors.accent.emerald}
                    label="Daily Goal"
                    value="75%"
                    delay={200}
                />
                <CircularProgress
                    percentage={45}
                    color={theme.colors.accent.blue}
                    label="Orders"
                    value="12"
                    delay={400}
                />
                <CircularProgress
                    percentage={90}
                    color={theme.colors.accent.purple}
                    label="Reputation"
                    value="4.5"
                    delay={600}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
});
