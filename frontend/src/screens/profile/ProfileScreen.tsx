import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollReveal from '../../components/animations/ScrollReveal';
import ProfileHeader from '../../components/profile/ProfileHeader';
import * as UserAPI from '../../services/api/user.api';
import { useAuth } from '../../context/AuthContext';
import { TestIDs } from '../../constants/testIDs';
import { useTestID } from '../../hooks/useTestID';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation<any>();
  const { user: authUser } = useAuth();
  const [user, setUser] = React.useState<{ name?: string; email?: string; avatar?: string; createdAt?: string } | null>(null);
  const [stats, setStats] = React.useState<{ orders: number; wishlist: number; reviews: number }>({ orders: 0, wishlist: 0, reviews: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const me = await UserAPI.getCurrentUser();
        setUser(me.user as any);
        const s = await UserAPI.getStats();
        setStats({ orders: s.totals?.orders || 0, wishlist: s.favorites || 0, reviews: s.totals?.reviews || 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const styles = createStyles(theme, isDark);

  return (
    <View style={styles.container} {...useTestID(TestIDs.PROFILE.SCREEN)}>
      <ProfessionalBackground variant="subtle" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <ScrollReveal delay={0}>
          <ProfileHeader user={user ? { ...user, level: (user as any).level || "Bronze", points: (user as any).points || 0 } as any : { name: "", email: "", avatar: null, level: "Bronze", points: 0 }} onEditAvatar={() => navigation.navigate('EditProfile')} />
        </ScrollReveal>

        {/* Stats Row */}
        <ScrollReveal delay={100}>
          <View style={styles.statsRow}>
            <StatCard
              icon="package-variant-closed"
              value={String(stats.orders)}
              label="Orders"
              onPress={() => navigation.navigate('OrderHistory')}
              styles={styles}
            />
            <StatCard
              icon="heart"
              value={String(stats.wishlist)}
              label="Wishlist"
              onPress={() => navigation.navigate('WishlistTab')}
              styles={styles}
            />
            <StatCard
              icon="star"
              value={String(stats.reviews)}
              label="Reviews"
              onPress={() => { }}
              styles={styles}
            />
          </View>
        </ScrollReveal>

        {/* Account Section */}
        <ScrollReveal delay={200}>
          <Text style={styles.sectionTitle}>Account & Beauty Profile</Text>
          <View style={styles.menuSection}>
            <MenuItem icon="account-edit" label="Edit Personal Info" onPress={() => navigation.navigate('EditProfile')} styles={styles} />
            <MenuItem icon="home-city" label="Addresses" onPress={() => navigation.navigate('Addresses')} styles={styles} />
            <MenuItem icon="gift-outline" label="Refer & Earn" onPress={() => navigation.navigate('Referrals')} styles={styles} />
            <MenuItem
              icon="face-man-shimmer"
              label="Skin Analysis History"
              onPress={() => navigation.navigate('AnalysisHistory')}
              styles={styles}
            />
            <MenuItem
              icon="wallet-membership"
              label="Elite Rewards"
              badge="Active"
              onPress={() => { }}
              styles={styles}
            />
          </View>
        </ScrollReveal>

        {/* Settings & Preferences */}
        <ScrollReveal delay={300}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuSection}>
            <MenuItem
              icon="bell-ring-outline"
              label="Notification Preferences"
              onPress={() => navigation.navigate('NotificationPreferences')}
              styles={styles}
            />
            <MenuItem
              icon="cog"
              label="Settings"
              onPress={() => navigation.navigate('Settings')}
              styles={styles}
            />
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: theme.colors.accent.emerald + '15' }]}>
                  <MaterialCommunityIcons name="moon-waning-crescent" size={20} color={theme.colors.accent.emerald} />
                </View>
                <Text style={[styles.menuLabel, { color: theme.colors.text.primary }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border.DEFAULT, true: theme.colors.accent.emerald }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </ScrollReveal>

        {/* Support */}
        <ScrollReveal delay={400}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuSection}>
            <MenuItem
              icon="help-circle"
              label="Help Center"
              onPress={() => { }}
              styles={styles}
            />
            <MenuItem
              icon="information"
              label="About Glowverse"
              badge="v2.1.0"
              onPress={() => navigation.navigate('About')}
              styles={styles}
            />
          </View>
        </ScrollReveal>

        {/* Logout */}
        <ScrollReveal delay={500}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive' }
            ])}
            {...useTestID(TestIDs.PROFILE.LOGOUT_BUTTON)}
          >
            <MaterialCommunityIcons name="logout" size={20} color={theme.colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollReveal>

        <View style={{ height: 100 }} />
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
    badgeContainer: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    badgeText: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: '600',
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

function StatCard({ icon, value, label, onPress, styles }: {
  icon: string;
  value: string;
  label: string;
  onPress: () => void;
  styles: any;
}) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name={icon as any} size={24} color={theme.colors.accent.emerald} />
      <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function MenuItem({ icon, label, onPress, badge, styles }: {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: string;
  styles: any;
}) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, { backgroundColor: theme.colors.accent.emerald + '15' }]}>
          <MaterialCommunityIcons name={icon as any} size={20} color={theme.colors.accent.emerald} />
        </View>
        <Text style={[styles.menuLabel, { color: theme.colors.text.primary }]}>{label}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {badge && (
          <View style={[styles.badgeContainer, { backgroundColor: theme.colors.accent.blue + '15' }]}>
            <Text style={[styles.badgeText, { color: theme.colors.accent.blue }]}>{badge}</Text>
          </View>
        )}
        <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
      </View>
    </TouchableOpacity>
  );
}
