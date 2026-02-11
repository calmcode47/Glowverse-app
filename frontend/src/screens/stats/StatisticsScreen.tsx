import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { darkTheme } from '../../theme/darkTheme';
import ParticleBackground from '../../components/animated/ParticleBackground';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    spending: [120, 280, 150, 320, 250, 380],
    orders: [2, 5, 3, 7, 4, 8],
};

const categoryData = [
    { category: 'Sunglasses', amount: 450, percentage: 30, color: darkTheme.colors.categories.sunglasses },
    { category: 'Watches', amount: 380, percentage: 25, color: darkTheme.colors.categories.watches },
    { category: 'Clothes', amount: 320, percentage: 21, color: darkTheme.colors.categories.clothes },
    { category: 'Shoes', amount: 220, percentage: 15, color: darkTheme.colors.categories.shoes },
    { category: 'Gym', amount: 100, percentage: 7, color: darkTheme.colors.categories.gym },
    { category: 'Tech', amount: 30, percentage: 2, color: darkTheme.colors.categories.tech },
];

export default function StatisticsScreen() {
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
    const maxSpending = Math.max(...monthlyData.spending);

    return (
        <View style={styles.container}>
            <ParticleBackground variant="stats" />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Statistics</Text>
                    <Text style={styles.headerSubtitle}>Your shopping insights</Text>
                </View>

                {/* Period Selector */}
                <View style={styles.periodSelector}>
                    {(['week', 'month', 'year'] as const).map((period) => (
                        <TouchableOpacity
                            key={period}
                            style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
                            onPress={() => setSelectedPeriod(period)}
                        >
                            <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Total Spending Card */}
                <View style={styles.totalCard}>
                    <LinearGradient
                        colors={darkTheme.colors.gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.totalGradient}
                    >
                        <Text style={styles.totalLabel}>Total Spent This Month</Text>
                        <Text style={styles.totalAmount}>$1,250</Text>
                        <View style={styles.totalChange}>
                            <MaterialCommunityIcons name="trending-up" size={16} color={darkTheme.colors.text.inverse} />
                            <Text style={styles.totalChangeText}>+23% from last month</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* Spending Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Monthly Spending</Text>
                    <View style={styles.chart}>
                        {monthlyData.labels.map((label, index) => (
                            <View key={label} style={styles.barContainer}>
                                <View style={styles.barWrapper}>
                                    <LinearGradient
                                        colors={darkTheme.colors.gradients.secondary}
                                        style={[
                                            styles.bar,
                                            {
                                                height: `${(monthlyData.spending[index] / maxSpending) * 100}%`,
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.barLabel}>{label}</Text>
                                <Text style={styles.barValue}>${monthlyData.spending[index]}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Category Breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Spending by Category</Text>
                    {categoryData.map((item) => (
                        <View key={item.category} style={styles.categoryItem}>
                            <View style={styles.categoryHeader}>
                                <View style={styles.categoryInfo}>
                                    <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                                    <Text style={styles.categoryName}>{item.category}</Text>
                                </View>
                                <Text style={styles.categoryAmount}>${item.amount}</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <LinearGradient
                                    colors={[item.color, item.color + '80'] as const}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.progressFill, { width: `${item.percentage}%` }]}
                                />
                            </View>
                            <Text style={styles.categoryPercentage}>{item.percentage}%</Text>
                        </View>
                    ))}
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatGridItem icon="package-variant" label="Total Orders" value="29" color={darkTheme.colors.accent.emerald} />
                    <StatGridItem icon="star" label="Avg Rating" value="4.8" color={darkTheme.colors.accent.gold} />
                    <StatGridItem icon="truck-delivery" label="In Transit" value="3" color={darkTheme.colors.accent.blue} />
                    <StatGridItem icon="arrow-u-left-top" label="Returns" value="1" color={darkTheme.colors.accent.gold} />
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

function StatGridItem({ icon, label, value, color }: {
    icon: string;
    label: string;
    value: string;
    color: string;
}) {
    return (
        <View style={styles.statGridItem}>
            <LinearGradient
                colors={darkTheme.colors.gradients.productCard}
                style={styles.statGridGradient}
            >
                <MaterialCommunityIcons name={icon as any} size={24} color={color} />
                <Text style={styles.statGridValue}>{value}</Text>
                <Text style={styles.statGridLabel}>{label}</Text>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: darkTheme.colors.background.primary,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingBottom: 20,
    },
    header: {
        paddingHorizontal: darkTheme.spacing.base,
        marginBottom: darkTheme.spacing.lg,
    },
    headerTitle: {
        fontSize: darkTheme.typography.sizes.xxl,
        fontWeight: darkTheme.typography.weights.bold,
        color: darkTheme.colors.text.primary,
    },
    headerSubtitle: {
        fontSize: darkTheme.typography.sizes.sm,
        color: darkTheme.colors.text.secondary,
        marginTop: 4,
    },
    periodSelector: {
        flexDirection: 'row',
        paddingHorizontal: darkTheme.spacing.base,
        gap: darkTheme.spacing.sm,
        marginBottom: darkTheme.spacing.lg,
    },
    periodButton: {
        flex: 1,
        paddingVertical: darkTheme.spacing.md,
        borderRadius: darkTheme.radius.md,
        backgroundColor: darkTheme.colors.background.card,
        borderWidth: 1,
        borderColor: darkTheme.colors.border.light,
        alignItems: 'center',
    },
    periodButtonActive: {
        backgroundColor: darkTheme.colors.accent.emerald,
        borderColor: darkTheme.colors.accent.emerald,
    },
    periodText: {
        fontSize: darkTheme.typography.sizes.sm,
        color: darkTheme.colors.text.secondary,
        fontWeight: darkTheme.typography.weights.medium,
    },
    periodTextActive: {
        color: darkTheme.colors.text.inverse,
    },
    totalCard: {
        marginHorizontal: darkTheme.spacing.base,
        borderRadius: darkTheme.radius.xl,
        overflow: 'hidden',
        marginBottom: darkTheme.spacing.xl,
    },
    totalGradient: {
        padding: darkTheme.spacing.lg,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: darkTheme.typography.sizes.sm,
        color: darkTheme.colors.text.inverse,
        opacity: 0.9,
    },
    totalAmount: {
        fontSize: darkTheme.typography.sizes.hero,
        fontWeight: darkTheme.typography.weights.black,
        color: darkTheme.colors.text.inverse,
        marginVertical: darkTheme.spacing.sm,
    },
    totalChange: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    totalChangeText: {
        fontSize: darkTheme.typography.sizes.sm,
        color: darkTheme.colors.text.inverse,
        fontWeight: darkTheme.typography.weights.medium,
    },
    section: {
        marginBottom: darkTheme.spacing.xl,
    },
    sectionTitle: {
        fontSize: darkTheme.typography.sizes.lg,
        fontWeight: darkTheme.typography.weights.bold,
        color: darkTheme.colors.text.primary,
        paddingHorizontal: darkTheme.spacing.base,
        marginBottom: darkTheme.spacing.md,
    },
    chart: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: darkTheme.spacing.base,
        height: 160,
        alignItems: 'flex-end',
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
        height: '100%',
    },
    barWrapper: {
        flex: 1,
        width: '70%',
        justifyContent: 'flex-end',
    },
    bar: {
        width: '100%',
        borderRadius: darkTheme.radius.sm,
        minHeight: 20,
    },
    barLabel: {
        fontSize: darkTheme.typography.sizes.xs,
        color: darkTheme.colors.text.muted,
        marginTop: darkTheme.spacing.xs,
    },
    barValue: {
        fontSize: darkTheme.typography.sizes.xs,
        color: darkTheme.colors.text.secondary,
        fontWeight: darkTheme.typography.weights.semibold,
    },
    categoryItem: {
        paddingHorizontal: darkTheme.spacing.base,
        marginBottom: darkTheme.spacing.base,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: darkTheme.spacing.xs,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: darkTheme.spacing.sm,
    },
    categoryDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    categoryName: {
        fontSize: darkTheme.typography.sizes.base,
        color: darkTheme.colors.text.primary,
        fontWeight: darkTheme.typography.weights.medium,
    },
    categoryAmount: {
        fontSize: darkTheme.typography.sizes.base,
        color: darkTheme.colors.text.primary,
        fontWeight: darkTheme.typography.weights.bold,
    },
    progressBar: {
        height: 8,
        backgroundColor: darkTheme.colors.background.card,
        borderRadius: darkTheme.radius.sm,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        borderRadius: darkTheme.radius.sm,
    },
    categoryPercentage: {
        fontSize: darkTheme.typography.sizes.xs,
        color: darkTheme.colors.text.muted,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: darkTheme.spacing.base,
        gap: darkTheme.spacing.md,
    },
    statGridItem: {
        width: (SCREEN_WIDTH - darkTheme.spacing.base * 2 - darkTheme.spacing.md) / 2,
        borderRadius: darkTheme.radius.lg,
        overflow: 'hidden',
    },
    statGridGradient: {
        padding: darkTheme.spacing.base,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: darkTheme.colors.border.light,
        borderRadius: darkTheme.radius.lg,
    },
    statGridValue: {
        fontSize: darkTheme.typography.sizes.xxl,
        fontWeight: darkTheme.typography.weights.bold,
        color: darkTheme.colors.text.primary,
        marginVertical: darkTheme.spacing.xs,
    },
    statGridLabel: {
        fontSize: darkTheme.typography.sizes.xs,
        color: darkTheme.colors.text.secondary,
    },
});
