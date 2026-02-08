import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollReveal from '../../components/animations/ScrollReveal';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();

  const user = {
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    avatar: null,
    level: 'Gold Member',
    points: 3420,
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
        {/* Profile Header */}
        <ScrollReveal delay={0}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={theme.colors.gradients.primary}
                style={styles.avatarGradient}
              >
                <MaterialCommunityIcons
                  name="account"
                  size={48}
                  color={theme.colors.text.inverse}
                />
              </LinearGradient>
              <TouchableOpacity style={styles.editAvatarButton}>
                <MaterialCommunityIcons
                  name="camera"
                  size={16}
                  color={theme.colors.text.inverse}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>

            <View style={styles.levelBadge}>
              <MaterialCommunityIcons
                name="crown"
                size={16}
                color={theme.colors.accent.gold}
              />
              <Text style={styles.levelText}>{user.level}</Text>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>{user.points} pts</Text>
              </View>
            </View>
          </View>
        </ScrollReveal>

        {/* Stats Cards */}
        <ScrollReveal delay={100}>
          <View style={styles.statsRow}>
            <StatCard icon="shopping-outline" value="29" label="Orders" theme={theme} />
            <StatCard icon="heart-outline" value="12" label="Wishlist" theme={theme} />
            <StatCard icon="star-outline" value="4.8" label="Rating" theme={theme} />
          </View>
        </ScrollReveal>

        {/* Account Section */}
        <ScrollReveal delay={200}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuSection}>
            <MenuItem
              icon="account-edit-outline"
              label="Edit Profile"
              onPress={() => { }}
              theme={theme}
            />
            <MenuItem
              icon="file-document-outline"
              label="Order History"
              onPress={() => { }}
              theme={theme}
            />
            <MenuItem
              icon="map-marker-outline"
              label="Addresses"
              onPress={() => { }}
              theme={theme}
            />
            <MenuItem
              icon="credit-card-outline"
              label="Payment Methods"
              onPress={() => { }}
              theme={theme}
            />
          </View>
        </ScrollReveal>

        {/* Preferences Section */}
        <ScrollReveal delay={300}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuSection}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, {
                  backgroundColor: theme.colors.accent.emerald + '15'
                }]}>
                  <MaterialCommunityIcons
                    name="theme-light-dark"
                    size={20}
                    color={theme.colors.accent.emerald}
                  />
                </View>
                <Text style={styles.menuLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{
                  false: theme.colors.border.DEFAULT,
                  true: theme.colors.accent.emerald
                }}
                thumbColor={theme.colors.background.primary}
              />
            </View>
            <MenuItem
              icon="bell-outline"
              label="Notifications"
              onPress={() => { }}
              theme={theme}
            />
            <MenuItem
              icon="translate"
              label="Language"
              badge="English"
              onPress={() => { }}
              theme={theme}
            />
          </View>
        </ScrollReveal>

        {/* Support Section */}
        <ScrollReveal delay={400}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuSection}>
            <MenuItem
              icon="help-circle-outline"
              label="Help Center"
              onPress={() => { }}
              theme={theme}
            />
            <MenuItem
              icon="shield-check-outline"
              label="Privacy & Security"
              onPress={() => { }}
              theme={theme}
            />
            <MenuItem
              icon="information-outline"
              label="About"
              badge="v2.0.1"
              onPress={() => { }}
              theme={theme}
            />
          </View>
        </ScrollReveal>

        {/* Logout Button */}
        <ScrollReveal delay={500}>
          <TouchableOpacity style={styles.logoutButton}>
            <MaterialCommunityIcons
              name="logout"
              size={20}
              color={theme.colors.error}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollReveal>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, value, label, theme }: {
  icon: string;
  value: string;
  label: string;
  theme: any;
}) {
  return (
    <View style={[styles.statCard, {
      backgroundColor: theme.colors.background.elevated,
      borderColor: theme.colors.border.light,
    }]}>
      <MaterialCommunityIcons
        name={icon as any}
        size={24}
        color={theme.colors.accent.emerald}
      />
      <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
        {label}
      </Text>
    </View>
  );
}

function MenuItem({ icon, label, onPress, badge, theme }: {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: string;
  theme: any;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, {
          backgroundColor: theme.colors.accent.emerald + '15'
        }]}>
          <MaterialCommunityIcons
            name={icon as any}
            size={20}
            color={theme.colors.accent.emerald}
          />
        </View>
        <Text style={[styles.menuLabel, { color: theme.colors.text.primary }]}>
          {label}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {badge && (
          <Text style={[styles.badgeText, { color: theme.colors.text.tertiary }]}>
            {badge}
          </Text>
        )}
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={theme.colors.text.tertiary}
        />
      </View>
    </TouchableOpacity>
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
    profileHeader: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: theme.spacing.base,
    },
    avatarGradient: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.lg,
    },
    editAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.accent.blue,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: theme.colors.background.primary,
    },
    userName: {
      fontSize: theme.typography.sizes['2xl'],
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.md,
    },
    levelBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background.elevated,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.accent.gold + '40',
      gap: 6,
    },
    levelText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.accent.gold,
      fontWeight: theme.typography.weights.semibold,
    },
    pointsBadge: {
      marginLeft: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      backgroundColor: theme.colors.accent.emerald + '20',
      borderRadius: theme.radius.sm,
    },
    pointsText: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.accent.emerald,
      fontWeight: theme.typography.weights.semibold,
    },
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    statCard: {
      flex: 1,
      padding: theme.spacing.base,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      borderWidth: 1,
      ...theme.shadows.sm,
    },
    statValue: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.bold,
      marginTop: theme.spacing.xs,
    },
    statLabel: {
      fontSize: theme.typography.sizes.xs,
      marginTop: 2,
    },
    sectionTitle: {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.base,
    },
    menuSection: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.base,
      backgroundColor: theme.colors.background.elevated,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    menuIconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuLabel: {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.medium,
    },
    badgeText: {
      fontSize: theme.typography.sizes.sm,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.base,
      borderRadius: theme.radius.md,
      borderWidth: 2,
      borderColor: theme.colors.error + '40',
      backgroundColor: theme.colors.error + '10',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
    },
    logoutText: {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.error,
    },
  });

const styles = StyleSheet.create({});
