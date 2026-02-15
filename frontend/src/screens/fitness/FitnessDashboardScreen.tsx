import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeContext';
import * as FitnessAPI from '../../services/api/fitness.api';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollAnimatedView from '../../components/animations/ScrollAnimatedView';
import GlassmorphicCard from '../../components/ui/GlassmorphicCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FitnessDashboardScreen({ navigation }: any) {
    const { theme } = useTheme();
    const [stats, setStats] = useState<FitnessAPI.FitnessStats | null>(null);
    const [activities, setActivities] = useState<FitnessAPI.Activity[]>([]);
    const [goals, setGoals] = useState<FitnessAPI.Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadFitnessData();
    }, []);

    const loadFitnessData = async () => {
        try {
            const [statsData, activitiesData, goalsData] = await Promise.all([
                FitnessAPI.getStats(),
                FitnessAPI.getActivities(),
                FitnessAPI.getGoals(),
            ]);
            setStats(statsData);
            setActivities(activitiesData);
            setGoals(goalsData);
        } catch (error) {
            console.error('Failed to load fitness data:', error);
            // Fallback data for preview if API fails
            setStats({
                todaySteps: 8450,
                dailyStepGoal: 10000,
                caloriesBurned: 240,
                weeklySteps: [6000, 7500, 4000, 9200, 8100, 5000, 8450]
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ProfessionalBackground />
                <ActivityIndicator size="large" color={theme.colors.accent.emerald} />
            </View>
        );
    }

    const chartConfig = {
        backgroundGradientFrom: 'rgba(255, 255, 255, 0)',
        backgroundGradientTo: 'rgba(255, 255, 255, 0)',
        color: (opacity = 1) => `rgba(255, 107, 157, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.7})`,
        strokeWidth: 3,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#FF6B9D'
        }
    };

    const lineChartData = {
        labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        datasets: [{
            data: stats?.weeklySteps || [0, 0, 0, 0, 0, 0, 0],
        }],
    };

    // Progress data for goals (top 3)
    const progressData = {
        labels: goals.slice(0, 3).map(g => g.name.length > 8 ? g.name.substring(0, 7) + '..' : g.name),
        data: goals.slice(0, 3).map(g => g.progress / g.target),
    };

    return (
        <View style={styles.container}>
            <ProfessionalBackground />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.text.inverse }]}>Fitness Dashboard</Text>
                    <TouchableOpacity onPress={loadFitnessData}>
                        <MaterialCommunityIcons name="refresh" size={24} color={theme.colors.text.inverse} />
                    </TouchableOpacity>
                </View>

                {/* Today's Main Stats */}
                <ScrollAnimatedView variant="slideUp" delay={0}>
                    <View style={styles.statsRow}>
                        <GlassmorphicCard style={styles.statCard} intensity={25} tint="dark">
                            <MaterialCommunityIcons name="foot-print" size={32} color="#FFD700" />
                            <Text style={styles.statValue}>{stats?.todaySteps?.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Steps Today</Text>
                            <View style={styles.miniProgress}>
                                <View style={[styles.miniFill, {
                                    width: `${Math.min((stats?.todaySteps || 0) / (stats?.dailyStepGoal || 10000) * 100, 100)}%`,
                                    backgroundColor: '#FFD700'
                                }]} />
                            </View>
                        </GlassmorphicCard>

                        <GlassmorphicCard style={styles.statCard} intensity={25} tint="dark">
                            <MaterialCommunityIcons name="fire" size={32} color="#FF6B6B" />
                            <Text style={styles.statValue}>{stats?.caloriesBurned}</Text>
                            <Text style={styles.statLabel}>Calories</Text>
                            <Text style={styles.statSub}>kCal burned</Text>
                        </GlassmorphicCard>
                    </View>
                </ScrollAnimatedView>

                {/* Weekly Step Chart */}
                <ScrollAnimatedView variant="slideUp" delay={100}>
                    <GlassmorphicCard style={styles.chartSection} intensity={20} tint="dark">
                        <Text style={styles.sectionTitle}>Weekly Activity</Text>
                        <LineChart
                            data={lineChartData}
                            width={SCREEN_WIDTH - 60}
                            height={180}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                            withHorizontalLines={false}
                            withVerticalLines={false}
                        />
                    </GlassmorphicCard>
                </ScrollAnimatedView>

                {/* Goals Section */}
                <ScrollAnimatedView variant="slideUp" delay={200}>
                    <View style={styles.goalsContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Goal Progress</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('CreateGoal')}>
                                <Text style={{ color: theme.colors.accent.emerald, fontWeight: '700' }}>Add New</Text>
                            </TouchableOpacity>
                        </View>

                        <GlassmorphicCard style={styles.goalsCard} intensity={20} tint="dark">
                            {goals.length > 0 ? (
                                <View style={styles.goalsGrid}>
                                    <ProgressChart
                                        data={progressData}
                                        width={SCREEN_WIDTH - 80}
                                        height={150}
                                        strokeWidth={12}
                                        radius={32}
                                        chartConfig={{
                                            ...chartConfig,
                                            color: (opacity = 1, index) => {
                                                const colors = ['#4CAF50', '#2196F3', '#FFC107'];
                                                return index !== undefined ? colors[index % colors.length] : '#4CAF50';
                                            }
                                        }}
                                        hideLegend={false}
                                    />
                                </View>
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <MaterialCommunityIcons name="target" size={48} color="rgba(255,255,255,0.3)" />
                                    <Text style={styles.emptyText}>No active goals set</Text>
                                </View>
                            )}
                        </GlassmorphicCard>
                    </View>
                </ScrollAnimatedView>

                {/* Recent Activities */}
                <ScrollAnimatedView variant="slideUp" delay={300}>
                    <Text style={styles.sectionTitle}>Recent Workouts</Text>
                    {activities.length > 0 ? (
                        activities.slice(0, 5).map((activity) => (
                            <GlassmorphicCard key={activity.id} style={styles.activityItem} intensity={15} tint="dark">
                                <View style={styles.activityIcon}>
                                    <MaterialCommunityIcons
                                        name={activity.type.toLowerCase().includes('run') ? 'run' : 'arm-flex'}
                                        size={24}
                                        color="#fff"
                                    />
                                </View>
                                <View style={styles.activityInfo}>
                                    <Text style={styles.activityType}>{activity.type}</Text>
                                    <Text style={styles.activityDate}>
                                        {new Date(activity.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={styles.activityStats}>
                                    <Text style={styles.actStat}>{activity.duration}m</Text>
                                    <Text style={styles.actSub}>{activity.calories} cal</Text>
                                </View>
                            </GlassmorphicCard>
                        ))
                    ) : (
                        <GlassmorphicCard style={styles.activityItem} intensity={15} tint="dark">
                            <Text style={styles.emptyText}>No recent activities</Text>
                        </GlassmorphicCard>
                    )}
                </ScrollAnimatedView>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Log FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.accent.emerald }]}
                onPress={() => navigation.navigate('LogActivity')}
            >
                <MaterialCommunityIcons name="plus" size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 24,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginTop: 10,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
    },
    statSub: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
    },
    miniProgress: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        marginTop: 8,
        width: '100%',
    },
    miniFill: {
        height: '100%',
        borderRadius: 2,
    },
    chartSection: {
        padding: 20,
        borderRadius: 24,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 15,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
        marginLeft: -20,
    },
    goalsContainer: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    goalsCard: {
        padding: 15,
        borderRadius: 24,
    },
    goalsGrid: {
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        marginTop: 10,
        fontSize: 14,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 18,
        marginBottom: 10,
    },
    activityIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    activityInfo: {
        flex: 1,
    },
    activityType: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    activityDate: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
    },
    activityStats: {
        alignItems: 'flex-end',
    },
    actStat: {
        color: '#FF6B9D',
        fontSize: 16,
        fontWeight: '700',
    },
    actSub: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});
