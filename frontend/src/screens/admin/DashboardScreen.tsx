import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { adminApi, AdminStats } from '../../services/api/admin.api';
import { useTheme } from '../../theme/themeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PillButton } from '../../components/ui';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            const data = await adminApi.getDashboardStats();
            setStats(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load dashboard');
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

    if (!stats) return null;

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text.primary }]}>Admin Dashboard</Text>
                <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Overview of your Glowverse business</Text>
            </View>

            {/* Stat Cards Row 1 */}
            <View style={styles.statsRow}>
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon="cash-multiple"
                    color={theme.colors.accent.emerald}
                    theme={theme}
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders.toString()}
                    icon="package-variant"
                    color={theme.colors.accent.blue}
                    theme={theme}
                />
            </View>

            {/* Stat Cards Row 2 */}
            <View style={styles.statsRow}>
                <StatCard
                    title="Active Users"
                    value={stats.totalUsers.toString()}
                    icon="account-group"
                    color="#9C27B0"
                    theme={theme}
                />
                <StatCard
                    title="Products"
                    value={stats.activeProducts.toString()}
                    icon="shopping"
                    color="#FF9800"
                    theme={theme}
                />
            </View>

            {/* Today's Stats */}
            <View style={[styles.section, { backgroundColor: theme.colors.background.elevated }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Today's Activity</Text>
                <View style={styles.todayStats}>
                    <View style={styles.todayStat}>
                        <Text style={[styles.todayValue, { color: theme.colors.accent.blue }]}>{stats.ordersToday}</Text>
                        <Text style={[styles.todayLabel, { color: theme.colors.text.tertiary }]}>Orders Today</Text>
                    </View>
                    <View style={styles.todayStat}>
                        <Text style={[styles.todayValue, { color: theme.colors.accent.blue }]}>{stats.signupsToday}</Text>
                        <Text style={[styles.todayLabel, { color: theme.colors.text.tertiary }]}>New Signups</Text>
                    </View>
                </View>
            </View>

            {/* Recent Orders */}
            <View style={[styles.section, { backgroundColor: theme.colors.background.elevated }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Recent Orders</Text>
                {stats.recentOrders.map((order) => (
                    <View key={order.id} style={[styles.orderCard, { backgroundColor: theme.colors.background.secondary }]}>
                        <View>
                            <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>#{order.id.slice(-8).toUpperCase()}</Text>
                            <Text style={[styles.orderDate, { color: theme.colors.text.tertiary }]}>
                                {new Date(order.createdAt).toLocaleString()}
                            </Text>
                        </View>
                        <View style={styles.orderRight}>
                            <Text style={[styles.orderAmount, { color: theme.colors.text.primary }]}>
                                ${order.total.toFixed(2)}
                            </Text>
                            <StatusBadge status={order.status} />
                        </View>
                    </View>
                ))}
            </View>

            {/* Quick Actions */}
            <View style={[styles.section, { backgroundColor: theme.colors.background.elevated }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Quick Actions</Text>
                <PillButton
                    label="Add New Product"
                    onPress={() => navigation.navigate('Products')}
                    icon="plus"
                    style={styles.actionButton}
                />
                <PillButton
                    label="View All Orders"
                    onPress={() => navigation.navigate('Orders')}
                    icon="format-list-bulleted"
                    secondary
                    style={styles.actionButton}
                />
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

// Reusable Stat Card Component
function StatCard({ title, value, icon, color, theme }: any) {
    return (
        <View style={[styles.statCard, { borderLeftColor: color, backgroundColor: theme.colors.background.elevated }]}>
            <MaterialCommunityIcons name={icon} size={32} color={color} style={styles.statIcon} />
            <View style={styles.statContent}>
                <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{value}</Text>
                <Text style={[styles.statTitle, { color: theme.colors.text.secondary }]}>{title}</Text>
            </View>
        </View>
    );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        pending: '#FFA726',
        processing: '#42A5F5',
        shipped: '#66BB6A',
        delivered: '#4CAF50',
        cancelled: '#EF5350',
    };

    return (
        <View style={[styles.statusBadge, { backgroundColor: (colors[status] || '#999') + '20' }]}>
            <Text style={[styles.statusText, { color: colors[status] || '#999' }]}>{status}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        paddingBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 4,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statIcon: {
        marginRight: 10,
    },
    statContent: {
        flex: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statTitle: {
        fontSize: 12,
    },
    section: {
        margin: 20,
        borderRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    todayStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    todayStat: {
        alignItems: 'center',
    },
    todayValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    todayLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    orderCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
    },
    orderId: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    orderDate: {
        fontSize: 11,
    },
    orderRight: {
        alignItems: 'flex-end',
    },
    orderAmount: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    actionButton: {
        marginBottom: 12,
    },
});
