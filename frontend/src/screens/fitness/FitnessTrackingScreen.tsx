import * as React from "react";
import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@constants/theme";
import ScrollAnimatedView from "@components/animations/ScrollAnimatedView";
import GlassmorphicCard from "@components/ui/GlassmorphicCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const fitnessData = {
    todaySteps: 8450,
    stepGoal: 10000,
    workoutMinutes: 35,
    caloriesBurned: 240,
    weeklyGoal: 5,
    workoutsCompleted: 3,
};

const exercises = [
    { id: '1', name: 'Push-ups', duration: '10 min', icon: 'arm-flex' },
    { id: '2', name: 'Cardio', duration: '20 min', icon: 'run' },
    { id: '3', name: 'Abs Workout', duration: '15 min', icon: 'ab-testing' },
    { id: '4', name: 'Yoga', duration: '30 min', icon: 'yoga' },
];

export default function FitnessTrackingScreen() {
    const [selectedDay, setSelectedDay] = useState(3);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyData = [65, 80, 45, 90, 75, 60, 85];

    const progressPercentage = (fitnessData.todaySteps / fitnessData.stepGoal) * 100;
    const workoutProgressPercentage = (fitnessData.workoutsCompleted / fitnessData.weeklyGoal) * 100;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.backgroundDark] as const}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Fitness Tracking</Text>
                    <Text style={styles.headerSubtitle}>Stay fit, look great</Text>
                </View>

                {/* Stats Cards */}
                <ScrollAnimatedView variant="slideUp" delay={0}>
                    <View style={styles.statsRow}>
                        <GlassmorphicCard style={styles.statCard} intensity={90} tint="dark">
                            <MaterialCommunityIcons name="walk" size={32} color={theme.colors.orange} />
                            <Text style={styles.statValue}>{fitnessData.todaySteps.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Steps Today</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                            </View>
                        </GlassmorphicCard>

                        <GlassmorphicCard style={styles.statCard} intensity={90} tint="dark">
                            <MaterialCommunityIcons name="fire" size={32} color={theme.colors.orange} />
                            <Text style={styles.statValue}>{fitnessData.caloriesBurned}</Text>
                            <Text style={styles.statLabel}>Calories</Text>
                            <Text style={styles.statSubtext}>Burned today</Text>
                        </GlassmorphicCard>
                    </View>
                </ScrollAnimatedView>

                {/* Weekly Progress */}
                <ScrollAnimatedView variant="slideUp" delay={100}>
                    <GlassmorphicCard style={styles.weeklyCard} intensity={90} tint="dark">
                        <Text style={styles.cardTitle}>Weekly Progress</Text>
                        <View style={styles.chartContainer}>
                            {days.map((day, index) => (
                                <TouchableOpacity
                                    key={day}
                                    style={styles.barContainer}
                                    onPress={() => setSelectedDay(index)}
                                >
                                    <View style={styles.barWrapper}>
                                        <LinearGradient
                                            colors={
                                                selectedDay === index
                                                    ? theme.colors.gradient.orange
                                                    : (['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)'] as const)
                                            }
                                            style={[styles.bar, { height: `${weeklyData[index]}%` }]}
                                        />
                                    </View>
                                    <Text style={[styles.dayLabel, selectedDay === index && styles.dayLabelActive]}>
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </GlassmorphicCard>
                </ScrollAnimatedView>

                {/* Workout Goal */}
                <ScrollAnimatedView variant="slideUp" delay={200}>
                    <GlassmorphicCard style={styles.goalCard} intensity={90} tint="dark">
                        <View style={styles.goalHeader}>
                            <Text style={styles.cardTitle}>Workout Goal</Text>
                            <Text style={styles.goalProgress}>
                                {fitnessData.workoutsCompleted}/{fitnessData.weeklyGoal} this week
                            </Text>
                        </View>
                        <View style={styles.circleProgress}>
                            <Text style={styles.circlePercentage}>{Math.round(workoutProgressPercentage)}%</Text>
                        </View>
                    </GlassmorphicCard>
                </ScrollAnimatedView>

                {/* Quick Exercises */}
                <ScrollAnimatedView variant="slideUp" delay={300}>
                    <Text style={styles.sectionTitle}>Quick Exercises</Text>
                    {exercises.map((exercise, index) => (
                        <TouchableOpacity key={exercise.id} style={styles.exerciseItem}>
                            <GlassmorphicCard style={styles.exerciseCard} intensity={90} tint="dark">
                                <View style={styles.exerciseIcon}>
                                    <MaterialCommunityIcons
                                        name={exercise.icon as any}
                                        size={24}
                                        color={theme.colors.orange}
                                    />
                                </View>
                                <View style={styles.exerciseInfo}>
                                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                                    <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
                                </View>
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={24}
                                    color={theme.colors.text.light}
                                />
                            </GlassmorphicCard>
                        </TouchableOpacity>
                    ))}
                </ScrollAnimatedView>

                <View style={styles.bottomPad} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingHorizontal: theme.spacing.scale[4],
        paddingBottom: 100,
    },
    header: {
        marginBottom: theme.spacing.scale[6],
    },
    headerTitle: {
        fontSize: theme.typography.fontSizes.xxl,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.text.inverse,
    },
    headerSubtitle: {
        fontSize: theme.typography.fontSizes.md,
        color: theme.colors.text.light,
        marginTop: theme.spacing.scale[1],
    },
    statsRow: {
        flexDirection: 'row',
        gap: theme.spacing.scale[3],
        marginBottom: theme.spacing.scale[4],
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.text.inverse,
        marginTop: theme.spacing.scale[2],
    },
    statLabel: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.text.light,
        marginTop: theme.spacing.scale[1],
    },
    statSubtext: {
        fontSize: theme.typography.fontSizes.xs,
        color: theme.colors.text.muted,
        marginTop: 2,
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        marginTop: theme.spacing.scale[2],
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.orange,
        borderRadius: 2,
    },
    weeklyCard: {
        marginBottom: theme.spacing.scale[4],
    },
    cardTitle: {
        fontSize: theme.typography.fontSizes.lg,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.text.inverse,
        marginBottom: theme.spacing.scale[4],
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
    },
    barWrapper: {
        width: '80%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    bar: {
        width: '100%',
        borderRadius: theme.radius.sm,
        minHeight: 20,
    },
    dayLabel: {
        fontSize: theme.typography.fontSizes.xs,
        color: theme.colors.text.muted,
        marginTop: theme.spacing.scale[1],
    },
    dayLabelActive: {
        color: theme.colors.orange,
        fontWeight: theme.typography.fontWeights.bold,
    },
    goalCard: {
        marginBottom: theme.spacing.scale[4],
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.scale[4],
    },
    goalProgress: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.orange,
        fontWeight: theme.typography.fontWeights.semibold,
    },
    circleProgress: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 8,
        borderColor: theme.colors.orange,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    circlePercentage: {
        fontSize: 24,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.text.inverse,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSizes.lg,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.text.inverse,
        marginBottom: theme.spacing.scale[3],
    },
    exerciseItem: {
        marginBottom: theme.spacing.scale[3],
    },
    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    exerciseIcon: {
        width: 48,
        height: 48,
        borderRadius: theme.radius.lg,
        backgroundColor: 'rgba(255, 107, 53, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.scale[3],
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: theme.typography.fontSizes.md,
        fontWeight: theme.typography.fontWeights.semibold,
        color: theme.colors.text.inverse,
    },
    exerciseDuration: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.text.light,
        marginTop: 2,
    },
    bottomPad: {
        height: 24,
    },
});
