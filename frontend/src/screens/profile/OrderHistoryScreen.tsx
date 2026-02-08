import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollReveal from '../../components/animations/ScrollReveal';

const orders = [
    {
        id: '1',
        orderNumber: 'ORD-2024-001',
        date: '2024-02-05',
        status: 'delivered',
        total: 299.99,
        items: 3,
        products: ['Premium Aviator Sunglasses', 'Leather Wallet'],
    },
    {
        id: '2',
        orderNumber: 'ORD-2024-002',
        date: '2024-02-01',
        status: 'shipped',
        total: 149.99,
        items: 1,
        products: ['Smart Watch Pro'],
    },
    {
        id: '3',
        orderNumber: 'ORD-2024-003',
        date: '2024-01-28',
        status: 'processing',
        total: 89.99,
        items: 2,
        products: ['Classic Cologne', 'Face Moisturizer'],
    },
    {
        id: '4',
        orderNumber: 'ORD-2024-004',
        date: '2024-01-20',
        status: 'delivered',
        total: 199.99,
        items: 1,
        products: ['Premium Headphones'],
    },
];

export default function OrderHistoryScreen({ navigation }: any) {
    const { theme, isDark } = useTheme();
    const [filter, setFilter] = useState('all');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return theme.colors.accent.emerald;
            case 'shipped':
                return theme.colors.accent.blue;
            case 'processing':
                return theme.colors.accent.gold;
            case 'cancelled':
                return theme.colors.error;
            default:
                return theme.colors.text.tertiary;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'check-circle';
            case 'shipped':
                return 'truck-delivery';
            case 'processing':
                return 'clock-outline';
            case 'cancelled':
                return 'close-circle';
            default:
                return 'package-variant';
        }
    };

    const styles = createStyles(theme, isDark);

    return (
        <View style={styles.container}>
            <ProfessionalBackground variant="subtle" />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <ScrollReveal delay={0}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <MaterialCommunityIcons
                                name="arrow-left"
                                size={24}
                                color={theme.colors.text.primary}
                            />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.headerTitle}>Order History</Text>
                            <Text style={styles.headerSubtitle}>{orders.length} total orders</Text>
                        </View>
                        <View style={{ width: 40 }} />
                    </View>
                </ScrollReveal>

                {/* Filter Chips */}
                <ScrollReveal delay={100}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterContainer}
                    >
                        {['all', 'delivered', 'shipped', 'processing'].map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.filterChip,
                                    filter === status && styles.filterChipActive,
                                ]}
                                onPress={() => setFilter(status)}
                            >
                                <Text
                                    style={[
                                        styles.filterText,
                                        filter === status && styles.filterTextActive,
                                    ]}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </ScrollReveal>

                {/* Orders List */}
                <View style={styles.ordersList}>
                    {orders.map((order, index) => (
                        <ScrollReveal key={order.id} delay={200 + index * 50}>
                            <TouchableOpacity style={styles.orderCard}>
                                <View style={styles.orderHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                                        <Text style={styles.orderDate}>{order.date}</Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            { backgroundColor: getStatusColor(order.status) + '20' },
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name={getStatusIcon(order.status) as any}
                                            size={16}
                                            color={getStatusColor(order.status)}
                                        />
                                        <Text
                                            style={[
                                                styles.statusText,
                                                { color: getStatusColor(order.status) },
                                            ]}
                                        >
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.orderBody}>
                                    <Text style={styles.productsLabel}>Products:</Text>
                                    {order.products.map((product, idx) => (
                                        <Text key={idx} style={styles.productName}>
                                            • {product}
                                        </Text>
                                    ))}
                                </View>

                                <View style={styles.orderFooter}>
                                    <View>
                                        <Text style={styles.totalLabel}>Total</Text>
                                        <Text style={styles.totalAmount}>${order.total}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.viewButton}>
                                        <Text style={styles.viewButtonText}>View Details</Text>
                                        <MaterialCommunityIcons
                                            name="arrow-right"
                                            size={18}
                                            color={theme.colors.accent.emerald}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </ScrollReveal>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const createStyles = (theme: any, isDark: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background.primary,
        },
        scroll: {
            flex: 1,
        },
        content: {
            paddingBottom: 100,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.xl,
            marginBottom: theme.spacing.xl,
        },
        backButton: {
            width: 40,
            height: 40,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.background.elevated,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerTitle: {
            fontSize: theme.typography.sizes['2xl'],
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text.primary,
            textAlign: 'center',
        },
        headerSubtitle: {
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            marginTop: 2,
        },
        filterContainer: {
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.xl,
        },
        filterChip: {
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.background.elevated,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
        },
        filterChipActive: {
            backgroundColor: theme.colors.accent.emerald + '20',
            borderColor: theme.colors.accent.emerald,
        },
        filterText: {
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.medium,
            color: theme.colors.text.secondary,
        },
        filterTextActive: {
            color: theme.colors.accent.emerald,
            fontWeight: theme.typography.weights.semibold,
        },
        ordersList: {
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.md,
        },
        orderCard: {
            backgroundColor: theme.colors.background.elevated,
            borderRadius: theme.radius.xl,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
            padding: theme.spacing.lg,
            ...theme.shadows.sm,
        },
        orderHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: theme.spacing.md,
        },
        orderNumber: {
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.text.primary,
            marginBottom: 4,
        },
        orderDate: {
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.text.tertiary,
        },
        statusBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: 4,
            borderRadius: theme.radius.sm,
            gap: 4,
        },
        statusText: {
            fontSize: theme.typography.sizes.xs,
            fontWeight: theme.typography.weights.semibold,
        },
        orderBody: {
            marginBottom: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: theme.colors.border.light,
        },
        productsLabel: {
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.xs,
        },
        productName: {
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.text.secondary,
            marginLeft: theme.spacing.sm,
            marginTop: 2,
        },
        orderFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        totalLabel: {
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.text.tertiary,
            marginBottom: 2,
        },
        totalAmount: {
            fontSize: theme.typography.sizes.xl,
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text.primary,
        },
        viewButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.base,
            paddingVertical: theme.spacing.sm,
            backgroundColor: theme.colors.accent.emerald + '15',
            borderRadius: theme.radius.md,
            gap: 4,
        },
        viewButtonText: {
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.accent.emerald,
        },
    });
