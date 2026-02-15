import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Share,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { referralsApi, ReferralData, ReferralStats } from '../../services/api/referrals.api';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollReveal from '../../components/animations/ScrollReveal';
import { PillButton } from '../../components/ui';

export default function ReferralDashboardScreen() {
    const { theme, isDark } = useTheme();
    const [referralData, setReferralData] = useState<ReferralData | null>(null);
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        loadReferralData();
    }, []);

    const loadReferralData = async () => {
        try {
            setIsLoading(true);
            const [data, statsData] = await Promise.all([
                referralsApi.getMyReferral(),
                referralsApi.getStats(),
            ]);
            setReferralData(data);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load referral data', error);
            Alert.alert('Error', 'Failed to load referral data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const generateCode = async () => {
        try {
            setIsGenerating(true);
            const { code } = await referralsApi.generateReferralCode();
            await loadReferralData(); // Refresh data after generation
            Alert.alert('Success', `Your new referral code is: ${code}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to generate referral code');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyReferralCode = async () => {
        if (!referralData?.code) return;
        try {
            await Clipboard.setStringAsync(referralData.code);
            Alert.alert('Copied!', 'Referral code copied to clipboard');
        } catch (error) {
            console.error('Copy failed', error);
        }
    };

    const shareReferralCode = async () => {
        if (!referralData?.code) return;
        try {
            await Share.share({
                message: `Join Glowverse with my code "${referralData.code}" and get $10 off your first order! https://glowverse.com/ref/${referralData.code}`,
            });
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    const styles = createStyles(theme, isDark);

    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background.primary }]}>
                <ActivityIndicator size="large" color={theme.colors.accent.blue} />
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
                <ScrollReveal delay={0}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Referrals</Text>
                        <Text style={styles.subtitle}>Refer friends and earn rewards together!</Text>
                    </View>
                </ScrollReveal>

                {/* Hero Card / Code Display */}
                <ScrollReveal delay={100}>
                    <View style={styles.codeCardContainer}>
                        <LinearGradient
                            colors={theme.colors.gradients.primary}
                            style={styles.codeGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {referralData?.code ? (
                                <>
                                    <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
                                    <View style={styles.codeBox}>
                                        <Text style={styles.codeText}>{referralData.code}</Text>
                                    </View>
                                    <View style={styles.codeActions}>
                                        <TouchableOpacity style={styles.iconAction} onPress={copyReferralCode}>
                                            <MaterialCommunityIcons name="content-copy" size={24} color={theme.colors.text.inverse} />
                                            <Text style={styles.iconLabel}>Copy</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.iconAction} onPress={shareReferralCode}>
                                            <MaterialCommunityIcons name="share-variant" size={24} color={theme.colors.text.inverse} />
                                            <Text style={styles.iconLabel}>Share</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.generateContainer}>
                                    <Text style={styles.noCodeText}>You don't have a referral code yet.</Text>
                                    <PillButton
                                        label={isGenerating ? "Generating..." : "Generate Code"}
                                        onPress={generateCode}
                                        disabled={isGenerating}
                                        style={styles.generateButton}
                                    />
                                </View>
                            )}
                        </LinearGradient>
                    </View>
                </ScrollReveal>

                {/* Stats Row */}
                {stats && (
                    <ScrollReveal delay={200}>
                        <View style={styles.statsRow}>
                            <View style={[styles.statItem, { backgroundColor: theme.colors.background.elevated }]}>
                                <Text style={[styles.statValue, { color: theme.colors.accent.blue }]}>{stats.totalReferrals}</Text>
                                <Text style={[styles.statLabelText, { color: theme.colors.text.tertiary }]}>Total Referrals</Text>
                            </View>
                            <View style={[styles.statItem, { backgroundColor: theme.colors.background.elevated }]}>
                                <Text style={[styles.statValue, { color: theme.colors.accent.emerald }]}>${stats.totalEarnings}</Text>
                                <Text style={[styles.statLabelText, { color: theme.colors.text.tertiary }]}>Total Earned</Text>
                            </View>
                        </View>
                    </ScrollReveal>
                )}

                {/* Info Card - How it works */}
                <ScrollReveal delay={300}>
                    <View style={[styles.section, { backgroundColor: theme.colors.background.elevated }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>How It Works</Text>
                        <StepItem
                            number="1"
                            title="Invite Friends"
                            description="Share your unique code with your inner circle."
                            theme={theme}
                        />
                        <StepItem
                            number="2"
                            title="They Sign Up"
                            description="They get $10 off their first order using your code."
                            theme={theme}
                        />
                        <StepItem
                            number="3"
                            title="You Get Paid"
                            description="You earn $10 credit when they make a purchase."
                            theme={theme}
                        />
                    </View>
                </ScrollReveal>

                {/* Recent Referrals */}
                {stats?.recentReferrals && stats.recentReferrals.length > 0 && (
                    <ScrollReveal delay={400}>
                        <View style={[styles.section, { backgroundColor: theme.colors.background.elevated }]}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Recent Friends</Text>
                            {stats.recentReferrals.map((friend, idx) => (
                                <View key={friend.id} style={[styles.friendItem, idx !== stats.recentReferrals.length - 1 && styles.borderBottom]}>
                                    <View style={styles.friendInfo}>
                                        <Text style={[styles.friendName, { color: theme.colors.text.primary }]}>
                                            {friend.name || 'Glowverse User'}
                                        </Text>
                                        <Text style={[styles.friendDate, { color: theme.colors.text.tertiary }]}>
                                            {new Date(friend.joinedAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View style={styles.friendStatus}>
                                        <Text style={[
                                            styles.statusText,
                                            { color: friend.status === 'earned' ? theme.colors.accent.emerald : theme.colors.accent.gold }
                                        ]}>
                                            {friend.status === 'earned' ? `+$${friend.reward || 10}` : 'Pending'}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollReveal>
                )}

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

function StepItem({ number, title, description, theme }: any) {
    const localStyles = StyleSheet.create({
        stepRow: {
            flexDirection: 'row',
            gap: 16,
            marginBottom: 20,
        },
        stepNumber: {
            width: 32,
            height: 32,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        stepNumberText: {
            fontSize: 16,
            fontWeight: '900',
        },
        stepContent: {
            flex: 1,
        },
        stepTitle: {
            fontSize: 15,
            fontWeight: '700',
            marginBottom: 4,
        },
        stepDesc: {
            fontSize: 13,
            lineHeight: 18,
        },
    });

    return (
        <View style={localStyles.stepRow}>
            <View style={[localStyles.stepNumber, { backgroundColor: theme.colors.accent.blue + '20' }]}>
                <Text style={[localStyles.stepNumberText, { color: theme.colors.accent.blue }]}>{number}</Text>
            </View>
            <View style={localStyles.stepContent}>
                <Text style={[localStyles.stepTitle, { color: theme.colors.text.primary }]}>{title}</Text>
                <Text style={[localStyles.stepDesc, { color: theme.colors.text.secondary }]}>{description}</Text>
            </View>
        </View>
    );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingBottom: 40,
    },
    header: {
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: theme.colors.text.primary,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        marginTop: 8,
        lineHeight: 22,
    },
    codeCardContainer: {
        marginHorizontal: 20,
        marginBottom: 24,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
    },
    codeGradient: {
        padding: 30,
        alignItems: 'center',
    },
    codeLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: theme.colors.text.inverse,
        opacity: 0.8,
        letterSpacing: 2,
        marginBottom: 16,
    },
    codeBox: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        borderStyle: 'dashed',
        marginBottom: 24,
    },
    codeText: {
        fontSize: 36,
        fontWeight: '900',
        color: theme.colors.text.inverse,
        letterSpacing: 4,
    },
    codeActions: {
        flexDirection: 'row',
        gap: 40,
    },
    iconAction: {
        alignItems: 'center',
        gap: 6,
    },
    iconLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.text.inverse,
    },
    generateContainer: {
        alignItems: 'center',
    },
    noCodeText: {
        color: theme.colors.text.inverse,
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    generateButton: {
        width: 200,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 15,
        marginBottom: 24,
    },
    statItem: {
        flex: 1,
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 4,
    },
    statLabelText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    section: {
        marginHorizontal: 20,
        padding: 24,
        borderRadius: 24,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 20,
    },
    friendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    friendInfo: {
        flex: 1,
    },
    friendName: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    friendDate: {
        fontSize: 12,
    },
    friendStatus: {
        alignItems: 'flex-end',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '800',
    },
});

const styles = StyleSheet.create({
    stepRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumberText: {
        fontSize: 16,
        fontWeight: '900',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    stepDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
});
