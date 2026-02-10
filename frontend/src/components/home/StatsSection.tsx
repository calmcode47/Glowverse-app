import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Polyline } from 'react-native-svg';
import { useTheme } from '../../theme/themeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const data = [20, 45, 28, 80, 99, 43, 60];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StatsSection() {
    const { theme } = useTheme();

    // Calculate path
    const graphWidth = SCREEN_WIDTH - 80; // adjusted for padding
    const graphHeight = 150;

    // Create points for line
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * graphWidth;
        const y = graphHeight - (value / 100) * graphHeight;
        return `${x},${y}`;
    }).join(' ');

    // Create path for area fill (closed loop)
    const fillPath = `${points} ${graphWidth},${graphHeight} 0,${graphHeight}`;

    return (
        <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.background.elevated,
                    borderColor: theme.colors.border.light
                }
            ]}
        >
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: theme.colors.text.primary }]}>Weekly Activity</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Your style journey this week</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: theme.colors.accent.emerald + '20' }]}>
                    <Text style={[styles.badgeText, { color: theme.colors.accent.emerald }]}>+12%</Text>
                </View>
            </View>

            <View style={styles.graphContainer}>
                <Svg width={graphWidth} height={graphHeight + 20}>
                    <Defs>
                        <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={theme.colors.accent.emerald} stopOpacity="0.5" />
                            <Stop offset="1" stopColor={theme.colors.accent.emerald} stopOpacity="0" />
                        </LinearGradient>
                    </Defs>

                    <Polyline
                        points={fillPath}
                        fill="url(#gradient)"
                        stroke="none"
                    />
                    <Polyline
                        points={points}
                        stroke={theme.colors.accent.emerald}
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                    />

                    {data.map((value, index) => {
                        const x = (index / (data.length - 1)) * graphWidth;
                        const y = graphHeight - (value / 100) * graphHeight;
                        return (
                            <Circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="4"
                                fill={theme.colors.background.elevated}
                                stroke={theme.colors.accent.emerald}
                                strokeWidth="2"
                            />
                        );
                    })}
                </Svg>

                <View style={styles.labels}>
                    {days.map((day, index) => (
                        <Text key={index} style={[styles.label, { color: theme.colors.text.tertiary }]}>
                            {day}
                        </Text>
                    ))}
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 12,
        marginTop: 4,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    graphContainer: {
        alignItems: 'center',
    },
    labels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    label: {
        fontSize: 10,
        width: 30,
        textAlign: 'center',
    },
});
