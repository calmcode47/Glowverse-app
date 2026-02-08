import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollReveal from '../../components/animations/ScrollReveal';

export default function AboutScreen({ navigation }: any) {
    const { theme, isDark } = useTheme();

    const handleLink = (url: string) => {
        Linking.openURL(url);
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
                        <Text style={styles.headerTitle}>About</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </ScrollReveal>

                {/* App Logo/Icon */}
                <ScrollReveal delay={100}>
                    <View style={styles.logoContainer}>
                        <LinearGradient
                            colors={theme.colors.gradients.primary}
                            style={styles.logoGradient}
                        >
                            <MaterialCommunityIcons
                                name="shopping"
                                size={60}
                                color={theme.colors.text.inverse}
                            />
                        </LinearGradient>
                        <Text style={styles.appName}>Glowverse</Text>
                        <Text style={styles.version}>Version 2.0.1</Text>
                    </View>
                </ScrollReveal>

                {/* Description */}
                <ScrollReveal delay={200}>
                    <View style={styles.section}>
                        <Text style={styles.description}>
                            Glowverse is your premium destination for fashion, accessories, and lifestyle
                            products. We bring you curated collections from top brands with a seamless
                            shopping experience.
                        </Text>
                    </View>
                </ScrollReveal>

                {/* Features */}
                <ScrollReveal delay={300}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Features</Text>
                        <View style={styles.featuresList}>
                            <FeatureItem
                                icon="shopping-outline"
                                title="Easy Shopping"
                                description="Browse and buy with just a few taps"
                                theme={theme}
                            />
                            <FeatureItem
                                icon="camera-outline"
                                title="AR Try-On"
                                description="Try products virtually before buying"
                                theme={theme}
                            />
                            <FeatureItem
                                icon="heart-outline"
                                title="Wishlist"
                                description="Save your favorite items for later"
                                theme={theme}
                            />
                            <FeatureItem
                                icon="shield-check-outline"
                                title="Secure Payments"
                                description="Shop safely with encrypted transactions"
                                theme={theme}
                            />
                        </View>
                    </View>
                </ScrollReveal>

                {/* Contact */}
                <ScrollReveal delay={400}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Get in Touch</Text>
                        <View style={styles.contactList}>
                            <TouchableOpacity
                                style={styles.contactItem}
                                onPress={() => handleLink('mailto:support@glowverse.com')}
                            >
                                <MaterialCommunityIcons
                                    name="email-outline"
                                    size={24}
                                    color={theme.colors.accent.emerald}
                                />
                                <Text style={styles.contactText}>support@glowverse.com</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.contactItem}
                                onPress={() => handleLink('https://glowverse.com')}
                            >
                                <MaterialCommunityIcons
                                    name="web"
                                    size={24}
                                    color={theme.colors.accent.emerald}
                                />
                                <Text style={styles.contactText}>www.glowverse.com</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.contactItem}
                                onPress={() => handleLink('tel:+1234567890')}
                            >
                                <MaterialCommunityIcons
                                    name="phone-outline"
                                    size={24}
                                    color={theme.colors.accent.emerald}
                                />
                                <Text style={styles.contactText}>+1 (234) 567-8900</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollReveal>

                {/* Social Media */}
                <ScrollReveal delay={500}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Follow Us</Text>
                        <View style={styles.socialContainer}>
                            <TouchableOpacity style={styles.socialButton}>
                                <MaterialCommunityIcons
                                    name="facebook"
                                    size={28}
                                    color={theme.colors.text.primary}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <MaterialCommunityIcons
                                    name="instagram"
                                    size={28}
                                    color={theme.colors.text.primary}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <MaterialCommunityIcons
                                    name="twitter"
                                    size={28}
                                    color={theme.colors.text.primary}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <MaterialCommunityIcons
                                    name="linkedin"
                                    size={28}
                                    color={theme.colors.text.primary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollReveal>

                {/* Legal */}
                <ScrollReveal delay={600}>
                    <View style={styles.legalSection}>
                        <TouchableOpacity style={styles.legalLink}>
                            <Text style={styles.legalText}>Terms of Service</Text>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={20}
                                color={theme.colors.text.tertiary}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.legalLink}>
                            <Text style={styles.legalText}>Privacy Policy</Text>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={20}
                                color={theme.colors.text.tertiary}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.legalLink}>
                            <Text style={styles.legalText}>Licenses</Text>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={20}
                                color={theme.colors.text.tertiary}
                            />
                        </TouchableOpacity>
                    </View>
                </ScrollReveal>

                {/* Copyright */}
                <ScrollReveal delay={700}>
                    <Text style={styles.copyright}>
                        © 2024 Glowverse. All rights reserved.
                    </Text>
                </ScrollReveal>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

function FeatureItem({ icon, title, description, theme }: any) {
    return (
        <View style={styles.featureItem}>
            <View
                style={[
                    styles.featureIcon,
                    { backgroundColor: theme.colors.accent.emerald + '15' },
                ]}
            >
                <MaterialCommunityIcons
                    name={icon}
                    size={24}
                    color={theme.colors.accent.emerald}
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: theme.colors.text.primary }]}>
                    {title}
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.text.secondary }]}>
                    {description}
                </Text>
            </View>
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
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.xl,
            marginBottom: theme.spacing.xl,
        },
        backButton: {
            width: 40,
            height: 40,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.background.elevated,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerTitle: {
            fontSize: theme.typography.sizes['2xl'],
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text.primary,
        },
        logoContainer: {
            alignItems: 'center',
            marginBottom: theme.spacing.xl,
        },
        logoGradient: {
            width: 120,
            height: 120,
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.base,
            ...theme.shadows.lg,
        },
        appName: {
            fontSize: theme.typography.sizes['3xl'],
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text.primary,
            marginBottom: 4,
        },
        version: {
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.text.tertiary,
        },
        section: {
            paddingHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.xl,
        },
        description: {
            fontSize: theme.typography.sizes.base,
            color: theme.colors.text.secondary,
            lineHeight: 24,
            textAlign: 'center',
        },
        sectionTitle: {
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.md,
        },
        featuresList: {
            gap: theme.spacing.md,
        },
        featureItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
        },
        featureIcon: {
            width: 56,
            height: 56,
            borderRadius: theme.radius.md,
            alignItems: 'center',
            justifyContent: 'center',
        },
        featureTitle: {
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.semibold,
            marginBottom: 2,
        },
        featureDescription: {
            fontSize: theme.typography.sizes.sm,
            lineHeight: 18,
        },
        contactList: {
            gap: theme.spacing.md,
        },
        contactItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.base,
            backgroundColor: theme.colors.background.elevated,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
            gap: theme.spacing.md,
        },
        contactText: {
            fontSize: theme.typography.sizes.base,
            color: theme.colors.text.primary,
            fontWeight: theme.typography.weights.medium,
        },
        socialContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: theme.spacing.lg,
        },
        socialButton: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.colors.background.elevated,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
            alignItems: 'center',
            justifyContent: 'center',
            ...theme.shadows.sm,
        },
        legalSection: {
            paddingHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            gap: theme.spacing.sm,
        },
        legalLink: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.base,
            backgroundColor: theme.colors.background.elevated,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
        },
        legalText: {
            fontSize: theme.typography.sizes.base,
            color: theme.colors.text.primary,
            fontWeight: theme.typography.weights.medium,
        },
        copyright: {
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.text.tertiary,
            textAlign: 'center',
            paddingHorizontal: theme.spacing.lg,
        },
    });

const styles = StyleSheet.create({});
