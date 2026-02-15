import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { adminApi, AdminOrder } from '../../services/api/admin.api';
import { useTheme } from '../../theme/themeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function OrdersManagementScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, [statusFilter]);

    const loadOrders = async () => {
        try {
            setIsLoading(true);
            const data = await adminApi.getOrders(statusFilter);
            setOrders(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await adminApi.updateOrderStatus(orderId, newStatus);

            // Update local state
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            Alert.alert('Success', `Order status updated to ${newStatus} `);
        } catch (error) {
            Alert.alert('Error', 'Failed to update order');
        }
    };

    const showStatusPicker = (order: AdminOrder) => {
        const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        Alert.alert(
            'Update Status',
            'Select new status for this order:',
            statuses.map(s => ({
                text: s.charAt(0).toUpperCase() + s.slice(1),
                onPress: () => updateOrderStatus(order.id, s),
                style: s === 'cancelled' ? 'destructive' : 'default'
            })).concat([{ text: 'Cancel', style: 'cancel' }] as any)
        );
    };

    const renderOrder = ({ item }: { item: AdminOrder }) => (
        <View style={[styles.orderCard, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }]}>
            <View style={styles.orderHeader}>
                <View>
                    <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>#{item.id.slice(-8).toUpperCase()}</Text>
                    <Text style={[styles.orderDate, { color: theme.colors.text.tertiary }]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
                <Text style={[styles.orderAmount, { color: theme.colors.accent.blue }]}>${item.total.toFixed(2)}</Text>
            </View>

            <View style={styles.orderDetails}>
                <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="account-outline" size={16} color={theme.colors.text.tertiary} />
                    <Text style={[styles.customerName, { color: theme.colors.text.secondary }]}>
                        {item.shippingAddress.name}
                    </Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border.light }]} />

            <View style={styles.orderFooter}>
                <StatusBadge status={item.status} />

                <TouchableOpacity
                    style={[styles.statusButton, { backgroundColor: theme.colors.background.secondary }]}
                    onPress={() => showStatusPicker(item)}
                >
                    <Text style={[styles.statusButtonText, { color: theme.colors.text.primary }]}>Change Status</Text>
                    <MaterialCommunityIcons name="chevron-down" size={16} color={theme.colors.text.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            {/* Filter Header */}
            <View style={[styles.filterHeader, { borderBottomColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                        <TouchableOpacity
                            key={status}
                            style={[
                                styles.filterTab,
                                statusFilter === status && { backgroundColor: theme.colors.accent.blue }
                            ]}
                            onPress={() => setStatusFilter(status)}
                        >
                            <Text style={[
                                styles.filterTabText,
                                { color: statusFilter === status ? '#FFF' : theme.colors.text.secondary }
                            ]}>
                                {status.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Orders List */}
            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.accent.blue} />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrder}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    refreshing={isLoading}
                    onRefresh={loadOrders}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={theme.colors.border.main} />
                            <Text style={[styles.emptyText, { color: theme.colors.text.tertiary }]}>No orders found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

// Status Badge Component (reused logic)
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
    filterHeader: {
        borderBottomWidth: 1,
    },
    filterScroll: {
        padding: 12,
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    filterTabText: {
        fontSize: 10,
        fontWeight: '800',
    },
    list: {
        padding: 16,
        paddingBottom: 40,
    },
    orderCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '800',
    },
    orderAmount: {
        fontSize: 18,
        fontWeight: '800',
    },
    orderDetails: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    customerName: {
        fontSize: 14,
        fontWeight: '600',
    },
    orderDate: {
        fontSize: 12,
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginBottom: 12,
    },
    orderFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 4,
    },
    statusButtonText: {
        fontSize: 12,
        fontWeight: '700',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        padding: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        marginTop: 12,
    },
});
