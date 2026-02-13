import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollReveal from '../../components/animations/ScrollReveal';
import Biometrics from '../../services/biometrics.service';
import * as UserAPI from "../../services/api/user.api";
import { useAuth } from '../../context/AuthContext';

export default function SettingsScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      const avail = await Biometrics.isAvailable();
      setBiometricAvailable(avail);
      const pref = await Biometrics.getBiometricPreference();
      setBiometricEnabled(pref && avail);
    })();
  }, []);

  // Notification states
  const [notifications, setNotifications] = useState({
    marketing: true,
    security: true,
    orders: true,
  });

  // Privacy states
  const [privacy, setPrivacy] = useState({
    analytics: true,
    personalizedAds: false,
  });

  const styles = createStyles(theme, isDark);

  const SettingToggle = ({ icon, label, value, onToggle, color }: any) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: (color || theme.colors.accent.emerald) + '15' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color || theme.colors.accent.emerald} />
        </View>
        <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.colors.border.DEFAULT, true: theme.colors.accent.emerald }}
        thumbColor="#fff"
      />
    </View>
  );

  const SettingLink = ({ icon, label, value, onPress, color }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: (color || theme.colors.accent.blue) + '15' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color || theme.colors.accent.blue} />
        </View>
        <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={[styles.settingValue, { color: theme.colors.text.tertiary }]}>{value}</Text>}
        <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="subtle" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScrollReveal delay={0}>
          <Text style={[styles.sectionTitle, { color: theme.colors.accent.emerald }]}>Notifications</Text>
          <View style={[styles.section, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }]}>
            <SettingToggle
              icon="bell-ring"
              label="Push Notifications"
              value={notifications.marketing}
              onToggle={(v: boolean) => setNotifications(p => ({ ...p, marketing: v }))}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="shield-alert"
              label="Security Alerts"
              value={notifications.security}
              onToggle={(v: boolean) => setNotifications(p => ({ ...p, security: v }))}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="package-variant"
              label="Order Updates"
              value={notifications.orders}
              onToggle={(v: boolean) => setNotifications(p => ({ ...p, orders: v }))}
            />
          </View>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <Text style={[styles.sectionTitle, { color: theme.colors.accent.emerald }]}>Security & Privacy</Text>
          <View style={[styles.section, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }]}>
            <SettingLink
              icon="lock-reset"
              label="Change Password"
              onPress={() => {
                Alert.prompt?.("Change Password", "Enter current password", (current) => {
                  Alert.prompt?.("New Password", "Enter new password", async (next) => {
                    if (!user?.id || !current || !next) return;
                    if (next.length < 8) {
                      Alert.alert("Error", "Password must be at least 8 characters");
                      return;
                    }
                    try {
                      await UserAPI.changePassword(user.id, { currentPassword: current, newPassword: next });
                      Alert.alert("Success", "Password updated");
                    } catch (e: any) {
                      Alert.alert("Error", e?.message || "Failed to change password");
                    }
                  });
                });
              }}
            />
            <View style={styles.divider} />
            <SettingLink
              icon="fingerprint"
              label="Biometric Login"
              value={biometricAvailable ? (biometricEnabled ? "Enabled" : "Disabled") : "Unavailable"}
              onPress={async () => {
                if (!biometricAvailable) return;
                if (!biometricEnabled) {
                  const ok = await Biometrics.authenticate();
                  if (ok) {
                    await Biometrics.saveBiometricPreference(true);
                    setBiometricEnabled(true);
                  } else {
                    Alert.alert("Authentication failed", "Could not enable biometric login.");
                  }
                } else {
                  await Biometrics.saveBiometricPreference(false);
                  setBiometricEnabled(false);
                }
              }}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="chart-timeline-variant"
              label="Usage Analytics"
              value={privacy.analytics}
              onToggle={(v: boolean) => setPrivacy(p => ({ ...p, analytics: v }))}
            />
          </View>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <Text style={[styles.sectionTitle, { color: theme.colors.accent.emerald }]}>App Preferences</Text>
          <View style={[styles.section, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }]}>
            <SettingLink
              icon="translate"
              label="App Language"
              value="English"
              onPress={() => { }}
            />
            <View style={styles.divider} />
            <SettingLink
              icon="database-refresh"
              label="Clear Cache"
              value="124 MB"
              onPress={() => Alert.alert('Clear Cache', 'Cache cleared successfully!')}
            />
          </View>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <TouchableOpacity
            style={[styles.dangerButton, { borderColor: theme.colors.error + '40', backgroundColor: theme.colors.error + '05' }]}
            onPress={() => Alert.alert('Delete Account', 'This action is irreversible. Enter your password to confirm.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => {
                Alert.prompt?.("Confirm Password", "", async (pw) => {
                  if (!user?.id || !pw) return;
                  try {
                    await UserAPI.deleteAccount(user.id, { password: pw });
                    Alert.alert("Account Deleted", "We’re sorry to see you go.");
                    navigation.replace("Welcome");
                  } catch (e: any) {
                    Alert.alert("Error", e?.message || "Failed to delete account");
                  }
                });
              } }
            ])}
          >
            <MaterialCommunityIcons name="account-remove" size={20} color={theme.colors.error} />
            <Text style={[styles.dangerText, { color: theme.colors.error }]}>Delete Account</Text>
          </TouchableOpacity>
        </ScrollReveal>

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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 24,
      marginBottom: 12,
      marginLeft: 4,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    section: {
      borderRadius: 20,
      borderWidth: 1,
      overflow: 'hidden',
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '600',
    },
    settingRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    settingValue: {
      fontSize: 14,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border.light,
      marginHorizontal: 16,
    },
    dangerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 40,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      gap: 8,
    },
    dangerText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
