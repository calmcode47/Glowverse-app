import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../theme/themeContext';
import * as NotificationsAPI from '../../services/api/notifications.api';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollAnimatedView from '../../components/animations/ScrollAnimatedView';
import GlassmorphicCard from '../../components/ui/GlassmorphicCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function NotificationPreferencesScreen() {
    const { theme, isDark } = useTheme();
    const [prefs, setPrefs] = useState<NotificationsAPI.NotificationPreferences>({
        orderUpdates: true,
        promotions: true,
        productRestocked: true,
        newsletter: false,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const data = await NotificationsAPI.getPreferences();
            setPrefs(data);
        } catch (error) {
            console.error('Failed to load notification preferences:', error);
            // Fallback stays as default
        } finally {
            setLoading(false);
        }
    };

    const togglePreference = async (key: keyof NotificationsAPI.NotificationPreferences) => {
        const newValue = !prefs[key];
        setPrefs(prev => ({ ...prev, [key]: newValue }));

        try {
            await NotificationsAPI.updatePreferences({ [key]: newValue });
        } catch (error) {
            Alert.alert('Error', 'Failed to update preferences. Please try again.');
            setPrefs(prev => ({ ...prev, [key]: !newValue })); // Revert on failure
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ProfessionalBackground />
                <ActivityIndicator size="large" color={theme.colors.accent.emerald} />
            </View>
        );
    }

    const PreferenceItem = ({ icon, label, description, value, onToggle }: any) => (
        <View style={styles.itemRow}>
            <View style={styles.itemIcon}>
                <MaterialCommunityIcons name={icon} size={24} color={theme.colors.accent.emerald} />
            </View>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemLabel, { color: theme.colors.text.primary }]}>{label}</Text>
                <Text style={[styles.itemDesc, { color: theme.colors.text.secondary }]}>{description}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: theme.colors.border.DEFAULT, true: theme.colors.accent.emerald + '80' }}
                thumbColor={value ? theme.colors.accent.emerald : theme.colors.text.muted}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <ProfessionalBackground variant="subtle" />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.text.primary }]}>Notifications</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Manage how we keep you updated</Text>
                </View>

                <ScrollAnimatedView variant="slideUp" delay={0}>
                    <GlassmorphicCard style={styles.card} intensity={20} tint={isDark ? "dark" : "light"}>
                        <PreferenceItem
                            icon="package-variant-closed"
                            label="Order Updates"
                            description="Get notified about your purchase status and shipping"
                            value={prefs.orderUpdates}
                            onToggle={() => togglePreference('orderUpdates')}
                        />
                        <View style={[styles.divider, { backgroundColor: theme.colors.border.light }]} />
                        <PreferenceItem
                            icon="tag-outline"
                            label="Promotions & Deals"
                            description="Be the first to know about sales and exclusive coupons"
                            value={prefs.promotions}
                            onToggle={() => togglePreference('promotions')}
                        />
                        <View style={[styles.divider, { backgroundColor: theme.colors.border.light }]} />
                        <PreferenceItem
                            icon="bell-ring-outline"
                            label="Product Restocked"
                            description="Notifications when items in your wishlist are back"
                            value={prefs.productRestocked}
                            onToggle={() => togglePreference('productRestocked')}
                        />
                        <View style={[styles.divider, { backgroundColor: theme.colors.border.light }]} />
                        <PreferenceItem
                            icon="email-outline"
                            label="Newsletter"
                            description="Weekly beauty tips and trend reports"
                            value={prefs.newsletter}
                            onToggle={() => togglePreference('newsletter')}
                        />
                    </GlassmorphicCard>
                </ScrollAnimatedView>

                <View style={styles.infoSection}>
                    <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.text.tertiary} />
                    <Text style={[styles.infoText, { color: theme.colors.text.tertiary }]}>
                        Push notifications are sent based on these preferences. You can also manage app-wide permissions in your device settings.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        padding: 24,
        paddingTop: 80,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    card: {
        padding: 8,
        borderRadius: 24,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    itemIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    itemInfo: {
        flex: 1,
        marginRight: 8,
    },
    itemLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    itemDesc: {
        fontSize: 12,
        marginTop: 2,
        lineHeight: 16,
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
    infoSection: {
        flexDirection: 'row',
        marginTop: 32,
        paddingHorizontal: 16,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
});
