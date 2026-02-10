import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Mock Data
const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        title: 'Order Shipped!',
        message: 'Your order #10234 has been shipped and is on its way.',
        time: '2 hours ago',
        type: 'order',
        read: false,
        icon: 'truck-delivery-outline',
        color: '#10B981', // Emerald
    },
    {
        id: '2',
        title: 'Summer Sale is Live! ☀️',
        message: 'Get up to 50% off on all sunglasses and beachwear. Limited time only.',
        time: '5 hours ago',
        type: 'promo',
        read: false,
        icon: 'tag-outline',
        color: '#F59E0B', // Amber
    },
    {
        id: '3',
        title: 'New Login Detected',
        message: 'We noticed a new login from iPhone 13 Pro in New York, USA.',
        time: '1 day ago',
        type: 'security',
        read: true,
        icon: 'shield-check-outline',
        color: '#3B82F6', // Blue
    },
    {
        id: '4',
        title: 'Price Drop Alert',
        message: 'The item "Ray-Ban Aviator Classic" in your wishlist is now on sale!',
        time: '2 days ago',
        type: 'price',
        read: true,
        icon: 'arrow-down-bold-circle-outline',
        color: '#EC4899', // Pink
    },
    {
        id: '5',
        title: 'System Update',
        message: 'Glowverse app has been updated to version 2.0. Check out the new 3D features!',
        time: '3 days ago',
        type: 'system',
        read: true,
        icon: 'cellphone-arrow-down',
        color: '#8B5CF6', // Violet
    },
];

export default function NotificationsScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const renderItem = ({ item, index }: { item: typeof MOCK_NOTIFICATIONS[0], index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            style={[
                styles.notificationCard,
                {
                    backgroundColor: theme.colors.background.elevated,
                    borderColor: item.read ? theme.colors.border.light : theme.colors.accent.blue + '40',
                }
            ]}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, { color: theme.colors.text.primary }]}>{item.title}</Text>
                    <Text style={[styles.time, { color: theme.colors.text.tertiary }]}>{item.time}</Text>
                </View>
                <Text style={[styles.message, { color: theme.colors.text.secondary }]}>{item.message}</Text>
            </View>
            {!item.read && (
                <View style={[styles.dot, { backgroundColor: theme.colors.accent.blue }]} />
            )}
        </Animated.View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <ProfessionalBackground variant="subtle" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: theme.colors.background.elevated }]}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Notifications</Text>
                <TouchableOpacity onPress={handleMarkAllRead}>
                    <Text style={[styles.markRead, { color: theme.colors.accent.blue }]}>Mark all read</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    markRead: {
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    time: {
        fontSize: 12,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
});
