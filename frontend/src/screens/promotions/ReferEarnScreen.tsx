import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Share,
    Clipboard,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollReveal from '../../components/animations/ScrollReveal';

const referralCode = 'ALEX2024GLOW';

const rewards = [
    { id: '1', amount: 50, condition: 'First referral', icon: 'gift', unlocked: true },
    { id: '2', amount: 100, condition: '5 successful referrals', icon: 'star', unlocked: true },
    { id: '3', amount: 250, condition: '10 successful referrals', icon: 'trophy', unlocked: false },
    { id: '4', amount: 500, condition: '25 successful referrals', icon: 'crown', unlocked: false },
];

const referralHistory = [
    { id: '1', name: 'John Doe', status: 'completed', reward: 50, date: '2024-02-01' },
    { id: '2', name: 'Sarah Smith', status: 'pending', reward: 50, date: '2024-02-05' },
    { id: '3', name: 'Mike Johnson', status: 'completed', reward: 50, date: '2024-01-28' },
];

export default function ReferEarnScreen({ navigation }: any) {
    const { theme, isDark } = useTheme();
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        Clipboard.setString(referralCode);
        setCopied(true);
        Alert.alert('Copied!', 'Referral code copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Join Glowverse and get $50 off your first order! Use my referral code: ${referralCode}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const styles = createStyles(theme, isDark);

    function StepItem({ number, title, description }: { number: string; title: string; description: string }) {
        return (
            <View style={styles.stepItem}>
                <View
                    style={[
                        styles.stepNumber,
                        { backgroundColor: theme.colors.accent.emerald + '20' },
                    ]}
                >
                    <Text
                        style={[styles.stepNumberText, { color: theme.colors.accent.emerald }]}
                    >
                        {number}
                    </Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
                        {title}
                    </Text>
                    <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
                        {description}
                    </Text>
                </View>
            </View>
        );
    }

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
                        <Text style={styles.headerTitle}>Refer & Earn</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </ScrollReveal>

                {/* Hero Card */}
                <ScrollReveal delay={100}>
                    <View style={styles.heroCard}>
                        <LinearGradient
                            colors={theme.colors.gradients.primary}
                            style={styles.heroGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <MaterialCommunityIcons
                                name="gift-outline"
                                size={64}
                                color={theme.colors.text.inverse}
                            />
                            <Text style={styles.heroTitle}>Earn $50 Per Referral</Text>
                            <Text style={styles.heroSubtitle}>
                                Share with friends and earn rewards when they make their first purchase
                            </Text>
                        </LinearGradient>
                    </View>
                </ScrollReveal>

                {/* Stats */}
                <ScrollReveal delay={200}>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>8</Text>
                            <Text style={styles.statLabel}>Total Referrals</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>$400</Text>
                            <Text style={styles.statLabel}>Earned</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>2</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </View>
                    </View>
                </ScrollReveal>

                {/* Referral Code */}
                <ScrollReveal delay={300}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Your Referral Code</Text>
                        <View style={styles.codeCard}>
                            <View style={styles.codeContent}>
                                <Text style={styles.codeLabel}>Code</Text>
                                <Text style={styles.codeText}>{referralCode}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.copyButton}
                                onPress={handleCopyCode}
                            >
                                <MaterialCommunityIcons
                                    name={copied ? 'check' : 'content-copy'}
                                    size={22}
                                    color={theme.colors.text.inverse}
                                />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                            <LinearGradient
                                colors={[theme.colors.accent.blue, theme.colors.accent.emerald] as const}
                                style={styles.shareGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <MaterialCommunityIcons
                                    name="share-variant"
                                    size={22}
                                    color={theme.colors.text.inverse}
                                />
                                <Text style={styles.shareButtonText}>Share with Friends</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollReveal>

                {/* Rewards Milestones */}
                <ScrollReveal delay={400}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Rewards Milestones</Text>
                        <View style={styles.rewardsList}>
                            {rewards.map((reward) => (
                                <View
                                    key={reward.id}
                                    style={[
                                        styles.rewardCard,
                                        !reward.unlocked && styles.rewardCardLocked,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.rewardIcon,
                                            {
                                                backgroundColor: reward.unlocked
                                                    ? theme.colors.accent.emerald + '20'
                                                    : theme.colors.background.tertiary,
                                            },
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name={reward.icon as any}
                                            size={28}
                                            color={
                                                reward.unlocked
                                                    ? theme.colors.accent.emerald
                                                    : theme.colors.text.tertiary
                                            }
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={[
                                                styles.rewardAmount,
                                                !reward.unlocked && styles.rewardAmountLocked,
                                            ]}
                                        >
                                            ${reward.amount}
                                        </Text>
                                        <Text style={styles.rewardCondition}>{reward.condition}</Text>
                                    </View>
                                    {reward.unlocked && (
                                        <MaterialCommunityIcons
                                            name="check-circle"
                                            size={24}
                                            color={theme.colors.accent.emerald}
                                        />
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollReveal>

                {/* Referral History */}
                <ScrollReveal delay={500}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Referrals</Text>
                        <View style={styles.historyList}>
                            {referralHistory.map((ref) => (
                                <View key={ref.id} style={styles.historyCard}>
                                    <View style={styles.historyAvatar}>
                                        <MaterialCommunityIcons
                                            name="account"
                                            size={24}
                                            color={theme.colors.text.tertiary}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.historyName}>{ref.name}</Text>
                                        <Text style={styles.historyDate}>{ref.date}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text
                                            style={[
                                                styles.historyReward,
                                                ref.status === 'pending' && styles.historyRewardPending,
                                            ]}
                                        >
                                            ${ref.reward}
                                        </Text>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                {
                                                    backgroundColor:
                                                        ref.status === 'completed'
                                                            ? theme.colors.accent.emerald + '20'
                                                            : theme.colors.accent.gold + '20',
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    {
                                                        color:
                                                            ref.status === 'completed'
                                                                ? theme.colors.accent.emerald
                                                                : theme.colors.accent.gold,
                                                    },
                                                ]}
                                            >
                                                {ref.status}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollReveal>

                {/* How It Works */}
                <ScrollReveal delay={600}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>How It Works</Text>
                        <View style={styles.stepsList}>
                            <StepItem
                                number="1"
                                title="Share Your Code"
                                description="Send your unique referral code to friends"
                            />
                            <StepItem
                                number="2"
                                title="Friend Signs Up"
                                description="They create an account using your code"
                            />
                            <StepItem
                                number="3"
                                title="Earn Rewards"
                                description="Get $50 when they make their first purchase"
                            />
                        </View>
                    </View>
                </ScrollReveal>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

 

const createStyles = (theme: any, isDark: boolean) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background.primary },
        scroll: { flex: 1 },
        content: { paddingBottom: 100 },
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xl, marginBottom: theme.spacing.xl },
        backButton: { width: 40, height: 40, borderRadius: theme.radius.md, backgroundColor: theme.colors.background.elevated, borderWidth: 1, borderColor: theme.colors.border.light, alignItems: 'center', justifyContent: 'center' },
        headerTitle: { fontSize: theme.typography.sizes['2xl'], fontWeight: theme.typography.weights.bold, color: theme.colors.text.primary },
        heroCard: { marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.xl, borderRadius: theme.radius['2xl'], overflow: 'hidden', ...theme.shadows.lg },
        heroGradient: { padding: theme.spacing.xl, alignItems: 'center' },
        heroTitle: { fontSize: theme.typography.sizes['2xl'], fontWeight: theme.typography.weights.bold, color: theme.colors.text.inverse, marginTop: theme.spacing.base, marginBottom: theme.spacing.sm },
        heroSubtitle: { fontSize: theme.typography.sizes.base, color: theme.colors.text.inverse, opacity: 0.9, textAlign: 'center', lineHeight: 22 },
        statsRow: { flexDirection: 'row', paddingHorizontal: theme.spacing.lg, gap: theme.spacing.md, marginBottom: theme.spacing.xl },
        statCard: { flex: 1, padding: theme.spacing.base, backgroundColor: theme.colors.background.elevated, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border.light, alignItems: 'center', ...theme.shadows.sm },
        statValue: { fontSize: theme.typography.sizes['2xl'], fontWeight: theme.typography.weights.bold, color: theme.colors.text.primary, marginBottom: 4 },
        statLabel: { fontSize: theme.typography.sizes.xs, color: theme.colors.text.secondary },
        section: { paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.xl },
        sectionTitle: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.text.primary, marginBottom: theme.spacing.md },
        codeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.lg, backgroundColor: theme.colors.background.elevated, borderRadius: theme.radius.xl, borderWidth: 2, borderColor: theme.colors.accent.emerald + '40', borderStyle: 'dashed', marginBottom: theme.spacing.md },
        codeContent: { flex: 1 },
        codeLabel: { fontSize: theme.typography.sizes.sm, color: theme.colors.text.tertiary, marginBottom: 4 },
        codeText: { fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.text.primary, letterSpacing: 2 },
        copyButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.accent.emerald, alignItems: 'center', justifyContent: 'center', ...theme.shadows.md },
        shareButton: { borderRadius: theme.radius.md, overflow: 'hidden', ...theme.shadows.md },
        shareGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.base, gap: theme.spacing.sm },
        shareButtonText: { fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.text.inverse },
        rewardsList: { gap: theme.spacing.md },
        rewardCard: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.base, backgroundColor: theme.colors.background.elevated, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border.light, gap: theme.spacing.md },
        rewardCardLocked: { opacity: 0.6 },
        rewardIcon: { width: 56, height: 56, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center' },
        rewardAmount: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.text.primary, marginBottom: 2 },
        rewardAmountLocked: { color: theme.colors.text.tertiary },
        rewardCondition: { fontSize: theme.typography.sizes.sm, color: theme.colors.text.secondary },
        historyList: { gap: theme.spacing.md },
        historyCard: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.base, backgroundColor: theme.colors.background.elevated, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border.light, gap: theme.spacing.md },
        historyAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.background.tertiary, alignItems: 'center', justifyContent: 'center' },
        historyName: { fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.text.primary, marginBottom: 2 },
        historyDate: { fontSize: theme.typography.sizes.sm, color: theme.colors.text.tertiary },
        historyReward: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.accent.emerald, marginBottom: 4 },
        historyRewardPending: { color: theme.colors.text.tertiary },
        statusBadge: { paddingHorizontal: theme.spacing.sm, paddingVertical: 2, borderRadius: theme.radius.sm },
        statusText: { fontSize: theme.typography.sizes.xs, fontWeight: theme.typography.weights.semibold },
        stepsList: { gap: theme.spacing.lg },
        stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md },
        stepNumber: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
        stepNumberText: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold },
        stepTitle: { fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, marginBottom: 4 },
        stepDescription: { fontSize: theme.typography.sizes.sm, lineHeight: 18 },
    });

 
