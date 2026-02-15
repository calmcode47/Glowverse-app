import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Image, Alert } from 'react-native';
import * as OrdersAPI from '../../services/api/orders.api';
import Loading from '../../components/loading/Loading';
import Button from '../../components/common/Button';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';

export default function OrderTrackingScreen({ route, navigation }: any) {
    const { orderId } = route.params;
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const [order, setOrder] = useState<OrdersAPI.Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            setIsLoading(true);
            const data = await OrdersAPI.getOrderById(orderId);
            setOrder(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load order details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || !order) {
        return <Loading />;
    }

    // Define status steps for timeline
    const statusSteps = [
        { key: 'pending', label: 'Order Placed', icon: '📝' },
        { key: 'processing', label: 'Processing', icon: '⚙️' },
        { key: 'shipped', label: 'Shipped', icon: '📦' },
        { key: 'delivered', label: 'Delivered', icon: '✅' },
    ];

    // Find current step index
    const statusList = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStepIndex = statusList.indexOf(order.status);

    return (
        <View style={styles.container}>
            <ProfessionalBackground variant="subtle" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Order Header */}
                <View style={styles.header}>
                    <Text style={styles.orderNumber}>Order #{order.number || order.id.slice(0, 8).toUpperCase()}</Text>
                    <Text style={styles.orderDate}>
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                </View>

                {/* Status Timeline */}
                <View style={styles.timeline}>
                    {statusSteps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <View key={step.key} style={styles.timelineStep}>
                                {/* Step Icon */}
                                <View
                                    style={[
                                        styles.stepIcon,
                                        isCompleted && styles.stepIconCompleted,
                                        isCurrent && styles.stepIconCurrent,
                                    ]}
                                >
                                    <Text style={styles.stepIconText}>{step.icon}</Text>
                                </View>

                                {/* Step Label */}
                                <Text
                                    style={[
                                        styles.stepLabel,
                                        isCompleted && styles.stepLabelCompleted,
                                        isCurrent && styles.stepLabelCurrent,
                                    ]}
                                >
                                    {step.label}
                                </Text>

                                {/* Connecting Line */}
                                {index < statusSteps.length - 1 && (
                                    <View
                                        style={[
                                            styles.stepLine,
                                            isCompleted && styles.stepLineCompleted,
                                        ]}
                                    />
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Tracking Number (if shipped) */}
                {order.trackingNumber && (order.status === 'shipped' || order.status === 'delivered') && (
                    <View style={styles.trackingBox}>
                        <Text style={styles.trackingLabel}>Tracking Number</Text>
                        <TouchableOpacity
                            onPress={() => {
                                const trackingUrl = getTrackingUrl(order.trackingNumber!);
                                Linking.openURL(trackingUrl);
                            }}
                        >
                            <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
                            <Text style={styles.trackingLink}>Track Package →</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Estimated Delivery */}
                {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <View style={styles.deliveryBox}>
                        <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
                        <Text style={styles.deliveryDate}>
                            {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </Text>
                    </View>
                )}

                {/* Order Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Items in this order</Text>
                    {order.items.map((item, idx) => (
                        <View key={`${item.productId}-${idx}`} style={styles.orderItem}>
                            {item.product?.image ? (
                                <Image
                                    source={{ uri: item.product.image }}
                                    style={styles.itemImage}
                                />
                            ) : (
                                <View style={[styles.itemImage, { backgroundColor: theme.colors.background.secondary }]} />
                            )}
                            <View style={styles.itemDetails}>
                                <Text style={styles.itemName} numberOfLines={2}>{item.product?.name || item.productId}</Text>
                                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                            </View>
                            <Text style={styles.itemPrice}>
                                ${((item.price || 0) * item.quantity).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Shipping Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shipping Address</Text>
                    {order.shippingAddress ? (
                        <>
                            <Text style={styles.addressText}>{order.shippingAddress.fullName}</Text>
                            <Text style={styles.addressText}>{order.shippingAddress.street}</Text>
                            <Text style={styles.addressText}>
                                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                                {order.shippingAddress.postalCode}
                            </Text>
                            <Text style={styles.addressText}>{order.shippingAddress.country}</Text>
                        </>
                    ) : null}
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    {(order.status as any) === 'pending' && (
                        <Button
                            onPress={async () => {
                                Alert.alert(
                                    'Cancel Order',
                                    'Are you sure you want to cancel this order?',
                                    [
                                        { text: 'No', style: 'cancel' },
                                        {
                                            text: 'Yes, Cancel',
                                            style: 'destructive',
                                            onPress: async () => {
                                                try {
                                                    await OrdersAPI.cancelOrder(order.id);
                                                    loadOrderDetails();
                                                    Alert.alert('Success', 'Order cancelled successfully');
                                                } catch (error) {
                                                    Alert.alert('Error', 'Failed to cancel order');
                                                }
                                            },
                                        },
                                    ]
                                );
                            }}
                            variant="outline"
                            style={styles.actionButton}
                        >
                            Cancel Order
                        </Button>
                    )}

                    <Button
                        onPress={() => {
                            const subject = `Order Support Request - ${order.number || order.id.slice(0, 8)}`;
                            Linking.openURL(`mailto:support@glowverse.com?subject=${encodeURIComponent(subject)}`);
                        }}
                        variant="outline"
                        style={styles.actionButton}
                    >
                        Contact Support
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
}

function getTrackingUrl(trackingNumber: string): string {
    if (trackingNumber.startsWith('1Z')) {
        return `https://www.ups.com/track?tracknum=${trackingNumber}`;
    }
    if (/^\d{12,14}$/.test(trackingNumber)) {
        return `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`;
    }
    if (/^\d{20,22}$/.test(trackingNumber)) {
        return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
    }
    return `https://www.ups.com/track?tracknum=${trackingNumber}`;
}

function createStyles(theme: any) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background.primary,
        },
        scrollContent: {
            paddingBottom: 40,
        },
        header: {
            padding: 20,
            paddingTop: 60,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border.light,
        },
        orderNumber: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.text.primary,
            marginBottom: 4,
        },
        orderDate: {
            fontSize: 14,
            color: theme.colors.text.secondary,
        },
        timeline: {
            padding: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        timelineStep: {
            alignItems: 'center',
            flex: 1,
            position: 'relative',
        },
        stepIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.background.secondary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
        },
        stepIconCompleted: {
            backgroundColor: theme.colors.accent.emerald,
            borderColor: theme.colors.accent.emerald,
        },
        stepIconCurrent: {
            backgroundColor: theme.colors.accent.emerald,
            borderColor: theme.colors.accent.emerald,
            borderWidth: 3,
        },
        stepIconText: {
            fontSize: 22,
        },
        stepLabel: {
            fontSize: 11,
            color: theme.colors.text.secondary,
            textAlign: 'center',
        },
        stepLabelCompleted: {
            color: theme.colors.text.primary,
            fontWeight: '600',
        },
        stepLabelCurrent: {
            color: theme.colors.accent.emerald,
            fontWeight: '800',
        },
        stepLine: {
            position: 'absolute',
            top: 24,
            left: '50%',
            right: '-50%',
            height: 2,
            backgroundColor: theme.colors.border.light,
            zIndex: -1,
        },
        stepLineCompleted: {
            backgroundColor: theme.colors.accent.emerald,
        },
        trackingBox: {
            margin: 20,
            padding: 16,
            backgroundColor: theme.colors.background.elevated,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
        },
        trackingLabel: {
            fontSize: 14,
            color: theme.colors.text.secondary,
            marginBottom: 8,
        },
        trackingNumber: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text.primary,
            marginBottom: 8,
        },
        trackingLink: {
            fontSize: 14,
            color: theme.colors.accent.emerald,
            fontWeight: '600',
        },
        deliveryBox: {
            marginHorizontal: 20,
            marginBottom: 20,
            padding: 16,
            backgroundColor: '#E8F5E9',
            borderRadius: 12,
        },
        deliveryLabel: {
            fontSize: 14,
            color: '#2E7D32',
            marginBottom: 4,
        },
        deliveryDate: {
            fontSize: 18,
            fontWeight: '700',
            color: '#2E7D32',
        },
        section: {
            margin: 20,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text.primary,
            marginBottom: 16,
        },
        orderItem: {
            flexDirection: 'row',
            marginBottom: 16,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border.light,
        },
        itemImage: {
            width: 60,
            height: 60,
            borderRadius: 8,
        },
        itemDetails: {
            flex: 1,
            marginLeft: 12,
        },
        itemName: {
            fontSize: 15,
            fontWeight: '600',
            color: theme.colors.text.primary,
            marginBottom: 4,
        },
        itemQuantity: {
            fontSize: 14,
            color: theme.colors.text.secondary,
        },
        itemPrice: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.text.primary,
        },
        addressText: {
            fontSize: 16,
            color: theme.colors.text.secondary,
            marginBottom: 4,
        },
        actions: {
            padding: 20,
        },
        actionButton: {
            marginBottom: 12,
        },
    });
}
