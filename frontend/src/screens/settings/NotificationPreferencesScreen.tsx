/**
 * Premium Notification Preferences Screen
 * 
 * Granular control over notifications with high-end visual design.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../theme/themeContext';
import * as NotificationPreferencesAPI from '../../services/api/notificationPreferences.api';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollAnimatedView from '../../components/animations/ScrollAnimatedView';
import GlassmorphicCard from '../../components/ui/GlassmorphicCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Divider } from 'react-native-paper';

export default function NotificationPreferencesScreen() {
    const { theme, isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState<NotificationPreferencesAPI.NotificationPreferences | null>(null);

    // Time picker state
    const [showQuietStart, setShowQuietStart] = useState(false);
    const [showQuietEnd, setShowQuietEnd] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            setLoading(true);
            const data = await NotificationPreferencesAPI.getNotificationPreferences();
            setPreferences(data);
        } catch (error) {
            console.error('Failed to load notification preferences:', error);
            Alert.alert('Error', 'Failed to load settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updatePreference = async (updates: NotificationPreferencesAPI.UpdatePreferencesDto) => {
        if (!preferences) return;

        // Optimistic update
        const previousPrefs = { ...preferences };
        setPreferences({ ...preferences, ...updates } as any);

        try {
            setSaving(true);
            const updated = await NotificationPreferencesAPI.updateNotificationPreferences(updates);
            setPreferences(updated);
        } catch (error) {
            setPreferences(previousPrefs);
            Alert.alert('Error', 'Failed to update preferences.');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        Alert.alert(
            'Reset to Defaults',
            'This will restore all notification settings to their original values.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setSaving(true);
                            const reset = await NotificationPreferencesAPI.resetNotificationPreferences();
                            setPreferences(reset);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reset settings.');
                        } finally {
                            setSaving(false);
                        }
                    }
                }
            ]
        );
    };

    const parseTime = (timeStr: string): Date => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours || 0, minutes || 0, 0, 0);
        return date;
    };

    const formatTime = (date: Date): string => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const PreferenceItem = ({ icon, label, description, value, onToggle, disabled }: any) => (
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
                disabled={disabled}
                trackColor={{ false: theme.colors.border.DEFAULT, true: theme.colors.accent.emerald + '80' }}
                thumbColor={value ? theme.colors.accent.emerald : theme.colors.text.muted}
            />
        </View>
    );

    const FrequencyItem = ({ label, value, selected, onSelect }: any) => (
        <TouchableOpacity
            style={[
                styles.frequencyBox,
                {
                    backgroundColor: selected ? theme.colors.accent.emerald + '20' : 'rgba(255,255,255,0.05)',
                    borderColor: selected ? theme.colors.accent.emerald : 'transparent'
                }
            ]}
            onPress={onSelect}
        >
            <Text style={[
                styles.frequencyLabel,
                { color: selected ? theme.colors.accent.emerald : theme.colors.text.secondary }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ProfessionalBackground />
                <ActivityIndicator size="large" color={theme.colors.accent.emerald} />
            </View>
        );
    }

    if (!preferences) return null;

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
                    <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Tailor your Glowverse experience</Text>
                </View>

                {/* Section: Channels */}
                <ScrollAnimatedView variant="slideUp" delay={0}>
                    <Text style={styles.sectionHeader}>Channels</Text>
                    <GlassmorphicCard style={styles.card} intensity={20} tint={isDark ? "dark" : "light"}>
                        <PreferenceItem
                            icon="email-outline"
                            label="Email"
                            description="Receive updates via your registered email"
                            value={preferences.emailEnabled}
                            onToggle={(v: boolean) => updatePreference({ emailEnabled: v })}
                            disabled={saving}
                        />
                        <Divider style={styles.divider} />
                        <PreferenceItem
                            icon="cellphone-play"
                            label="Push Notifications"
                            description="Real-time alerts on your device"
                            value={preferences.pushEnabled}
                            onToggle={(v: boolean) => updatePreference({ pushEnabled: v })}
                            disabled={saving}
                        />
                        <Divider style={styles.divider} />
                        <PreferenceItem
                            icon="message-text-outline"
                            label="SMS / Text"
                            description="Direct alerts via mobile messaging"
                            value={preferences.smsEnabled}
                            onToggle={(v: boolean) => updatePreference({ smsEnabled: v })}
                            disabled={saving}
                        />
                    </GlassmorphicCard>
                </ScrollAnimatedView>

                {/* Section: Categories */}
                <ScrollAnimatedView variant="slideUp" delay={100}>
                    <Text style={styles.sectionHeader}>Categories</Text>
                    <GlassmorphicCard style={styles.card} intensity={20} tint={isDark ? "dark" : "light"}>
                        <PreferenceItem
                            icon="package-variant-closed"
                            label="Orders"
                            description="Confirmation, status, and shipping"
                            value={preferences.ordersEnabled}
                            onToggle={(v: boolean) => updatePreference({ ordersEnabled: v })}
                            disabled={saving}
                        />
                        <Divider style={styles.divider} />
                        <PreferenceItem
                            icon="sale"
                            label="Promotions"
                            description="Sales, coupons, and restock alerts"
                            value={preferences.promotionsEnabled}
                            onToggle={(v: boolean) => updatePreference({ promotionsEnabled: v })}
                            disabled={saving}
                        />
                        <Divider style={styles.divider} />
                        <PreferenceItem
                            icon="dumbbell"
                            label="Fitness & Glow"
                            description="Workout reminders and challenges"
                            value={preferences.fitnessEnabled}
                            onToggle={(v: boolean) => updatePreference({ fitnessEnabled: v })}
                            disabled={saving}
                        />
                        <Divider style={styles.divider} />
                        <PreferenceItem
                            icon="account-cog-outline"
                            label="Account Safety"
                            description="Security alerts and profile updates"
                            value={preferences.accountEnabled}
                            onToggle={(v: boolean) => updatePreference({ accountEnabled: v })}
                            disabled={saving}
                        />
                        <Divider style={styles.divider} />
                        <PreferenceItem
                            icon="account-group-outline"
                            label="Social activity"
                            description="Likes, comments, and community engagement"
                            value={preferences.socialEnabled}
                            onToggle={(v: boolean) => updatePreference({ socialEnabled: v })}
                            disabled={saving}
                        />
                    </GlassmorphicCard>
                </ScrollAnimatedView>

                {/* Section: Advanced Settings */}
                <ScrollAnimatedView variant="slideUp" delay={200}>
                    <Text style={styles.sectionHeader}>Advanced Settings</Text>
                    <GlassmorphicCard style={styles.card} intensity={20} tint={isDark ? "dark" : "light"}>
                        <View style={styles.advancedSection}>
                            <Text style={[styles.advancedTitle, { color: theme.colors.text.primary }]}>Promotion Frequency</Text>
                            <View style={styles.frequencyRow}>
                                {['daily', 'weekly', 'monthly', 'never'].map((f) => (
                                    <FrequencyItem
                                        key={f}
                                        label={f.charAt(0).toUpperCase() + f.slice(1)}
                                        selected={preferences.promotionFrequency === f}
                                        onSelect={() => updatePreference({ promotionFrequency: f as any })}
                                    />
                                ))}
                            </View>
                        </View>

                        <Divider style={styles.divider} />

                        <View style={styles.advancedSection}>
                            <View style={styles.quietHoursHeader}>
                                <View>
                                    <Text style={[styles.advancedTitle, { color: theme.colors.text.primary }]}>Quiet Hours</Text>
                                    <Text style={[styles.advancedDesc, { color: theme.colors.text.secondary }]}>Pause alerts while you rest</Text>
                                </View>
                                <Switch
                                    value={preferences.quietHoursEnabled}
                                    onValueChange={(v) => updatePreference({ quietHoursEnabled: v })}
                                    trackColor={{ false: theme.colors.border.DEFAULT, true: theme.colors.accent.emerald + '80' }}
                                    thumbColor={preferences.quietHoursEnabled ? theme.colors.accent.emerald : theme.colors.text.muted}
                                />
                            </View>

                            {preferences.quietHoursEnabled && (
                                <View style={styles.timePickerContainer}>
                                    <TouchableOpacity style={styles.timeDisplay} onPress={() => setShowQuietStart(true)}>
                                        <Text style={[styles.timeLabel, { color: theme.colors.text.secondary }]}>From</Text>
                                        <Text style={[styles.timeValue, { color: theme.colors.accent.emerald }]}>{preferences.quietHoursStart}</Text>
                                    </TouchableOpacity>
                                    <MaterialCommunityIcons name="arrow-right" size={20} color={theme.colors.text.muted} />
                                    <TouchableOpacity style={styles.timeDisplay} onPress={() => setShowQuietEnd(true)}>
                                        <Text style={[styles.timeLabel, { color: theme.colors.text.secondary }]}>To</Text>
                                        <Text style={[styles.timeValue, { color: theme.colors.accent.emerald }]}>{preferences.quietHoursEnd}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </GlassmorphicCard>
                </ScrollAnimatedView>

                {showQuietStart && (
                    <DateTimePicker
                        value={parseTime(preferences.quietHoursStart)}
                        mode="time"
                        is24Hour={true}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(_event: any, date?: Date) => {
                            setShowQuietStart(false);
                            if (date) updatePreference({ quietHoursStart: formatTime(date) });
                        }}
                    />
                )}

                {showQuietEnd && (
                    <DateTimePicker
                        value={parseTime(preferences.quietHoursEnd)}
                        mode="time"
                        is24Hour={true}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(_event: any, date?: Date) => {
                            setShowQuietEnd(false);
                            if (date) updatePreference({ quietHoursEnd: formatTime(date) });
                        }}
                    />
                )}

                <View style={styles.footer}>
                    <Button
                        mode="outlined"
                        onPress={handleReset}
                        textColor={theme.colors.error}
                        style={[styles.resetButton, { borderColor: theme.colors.error + '40' }]}
                    >
                        Reset all to defaults
                    </Button>
                    <Text style={[styles.infoText, { color: theme.colors.text.tertiary }]}>
                        High-priority security updates will always be sent regardless of quiet hours settings.
                    </Text>
                </View>
            </ScrollView>

            {saving && (
                <View style={styles.savingOverlay}>
                    <ActivityIndicator size="small" color={theme.colors.accent.emerald} />
                    <Text style={[styles.savingText, { color: theme.colors.text.primary }]}>Syncing...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scroll: { flex: 1 },
    content: { padding: 24, paddingTop: 60, paddingBottom: 100 },
    header: { marginBottom: 32 },
    title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
    subtitle: { fontSize: 16, marginTop: 4 },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginTop: 24,
        opacity: 0.6
    },
    card: { padding: 8, borderRadius: 24 },
    itemRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    itemIcon: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center', justifyContent: 'center', marginRight: 16,
    },
    itemInfo: { flex: 1, marginRight: 8 },
    itemLabel: { fontSize: 16, fontWeight: '700' },
    itemDesc: { fontSize: 12, marginTop: 2, lineHeight: 16 },
    divider: { marginVertical: 4 },
    advancedSection: { padding: 16 },
    advancedTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    advancedDesc: { fontSize: 12, marginTop: 2 },
    frequencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    frequencyBox: {
        paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 12, borderWidth: 1,
        minWidth: 70, alignItems: 'center'
    },
    frequencyLabel: { fontSize: 12, fontWeight: '600' },
    quietHoursHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
    },
    timePickerContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
        marginTop: 20, padding: 12, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.03)'
    },
    timeDisplay: { alignItems: 'center' },
    timeLabel: { fontSize: 10, textTransform: 'uppercase', marginBottom: 2 },
    timeValue: { fontSize: 20, fontWeight: '700' },
    footer: { marginTop: 40, alignItems: 'center' },
    resetButton: { width: '100%', borderRadius: 16 },
    infoText: { textAlign: 'center', fontSize: 12, marginTop: 16, paddingHorizontal: 20 },
    savingOverlay: {
        position: 'absolute', bottom: 40, alignSelf: 'center',
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 20, paddingVertical: 10,
        borderRadius: 30, gap: 10
    },
    savingText: { fontSize: 14, fontWeight: '600' }
});
