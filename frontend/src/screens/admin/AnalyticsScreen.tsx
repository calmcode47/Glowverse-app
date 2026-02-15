import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { adminApi, AdminStats } from '../../services/api/admin.api';
import { useTheme } from '../../theme/themeContext';
import { AnimatedBarChart, GradientCard } from '../../components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AnalyticsScreen() {
    const { theme } = useTheme();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await adminApi.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to load analytics', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background.primary }]}>
                <ActivityIndicator size="large" color={theme.colors.accent.blue} />
            </View>
        );
    }

    // Mock data for charts if API doesn't provide historical data yet
    const salesData = [
        { label: 'Mon', value: 450 },
        { label: 'Tue', value: 300 },
        { label: 'Wed', value: 600 },
        { label: 'Thu', value: 800 },
        { label: 'Fri', value: 500 },
        { label: 'Sat', value: 900 },
        { label: 'Sun', value: 750 },
    ];

    const userGrowthData = [
        { label: 'M1', value: 100 },
        { label: 'M2', value: 150 },
        { label: 'M3', value: 280 },
        { label: 'M4', value: 400 },
        { label: 'M5', value: 550 },
        { label: 'M6', value: 800 },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text.primary }]}>Analytics</Text>
                <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Performance metrics and insights</Text>
            </View>

            <View style={styles.content}>
                <GradientCard title="Weekly Sales" style={styles.chartCard}>
                    <AnimatedBarChart
                        data={salesData.map(d => ({ ...d, color: 'primary' as any }))}
                        height={150}
                    />
                </GradientCard>

                <View style={[styles.section, { backgroundColor: theme.colors.background.elevated }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Quick Metrics</Text>
                    <View style={styles.metricGrid}>
                        <MetricItem
                            label="Conversion Rate"
                            value="3.2%"
                            icon="trending-up"
                            color={theme.colors.accent.emerald}
                            theme={theme}
                        />
                        <MetricItem
                            label="Avg. Order Value"
                            value={`$${(stats?.totalRevenue ?? 0 / (stats?.totalOrders || 1)).toFixed(2)}`}
                            icon="currency-usd"
                            color={theme.colors.accent.blue}
                            theme={theme}
                        />
                        <MetricItem
                            label="Customer LTV"
                            value="$124.50"
                            icon="heart-outline"
                            color="#EC4899"
                            theme={theme}
                        />
                        <MetricItem
                            label="Churn Rate"
                            value="1.5%"
                            icon="account-minus-outline"
                            color={theme.colors.error}
                            theme={theme}
                        />
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: theme.colors.background.elevated }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>User Growth</Text>
                    <View style={{ paddingVertical: 10 }}>
                        <AnimatedBarChart
                            data={userGrowthData}
                            height={120}
                        />
                    </View>
                </View>
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

function MetricItem({ label, value, icon, color, theme }: any) {
    return (
        <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { backgroundColor: color + '15' }]}>
                <MaterialCommunityIcons name={icon} size={20} color={color} />
            </View>
            <Text style={[styles.metricValue, { color: theme.colors.text.primary }]}>{value}</Text>
            <Text style={[styles.metricLabel, { color: theme.colors.text.tertiary }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    content: {
        paddingHorizontal: 20,
    },
    chartCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
    },
    section: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
    },
    metricGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
    },
    metricItem: {
        width: '45%',
    },
    metricIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    metricLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
