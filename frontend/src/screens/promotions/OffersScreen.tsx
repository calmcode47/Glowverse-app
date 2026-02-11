import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollReveal from '../../components/animations/ScrollReveal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const offers = [
    {
        id: '1',
        title: 'Summer Sale',
        description: 'Up to 50% off on sunglasses',
        discount: '50% OFF',
        code: 'SUMMER50',
        validUntil: '2024-03-31',
        icon: 'sunglasses',
      gradient: ['#F59E0B', '#EF4444'] as const,
    },
    {
        id: '2',
        title: 'First Purchase',
        description: 'Extra $25 off on your first order',
        discount: '$25 OFF',
        code: 'FIRST25',
        validUntil: '2024-12-31',
        icon: 'gift',
      gradient: ['#10B981', '#059669'] as const,
    },
    {
        id: '3',
        title: 'Weekend Deal',
        description: 'Buy 2 Get 1 Free on accessories',
        discount: 'BUY 2 GET 1',
        code: 'WEEKEND',
        validUntil: '2024-02-15',
        icon: 'tag-multiple',
      gradient: ['#3B82F6', '#2563EB'] as const,
    },
    {
        id: '4',
        title: 'Free Shipping',
        description: 'Free delivery on orders above $50',
        discount: 'FREE SHIP',
        code: 'FREESHIP50',
        validUntil: '2024-04-30',
        icon: 'truck-delivery',
      gradient: ['#8B5CF6', '#7C3AED'] as const,
    },
];

const categories = [
    { id: 'all', label: 'All Offers', icon: 'tag-multiple' },
    { id: 'newuser', label: 'New User', icon: 'account-plus' },
    { id: 'seasonal', label: 'Seasonal', icon: 'weather-sunny' },
    { id: 'flash', label: 'Flash Deals', icon: 'lightning-bolt' },
];

export default function OffersScreen({ navigation }: any) {
    const { theme, isDark } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState('all');

    const styles = createStyles(theme, isDark);

    function InfoItem({ icon, text }: { icon: string; text: string }) {
        return (
            <View style={styles.infoItem}>
                <MaterialCommunityIcons
                    name={icon as any}
                    size={24}
                    color={theme.colors.accent.emerald}
                />
                <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
                    {text}
                </Text>
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
                        <Text style={styles.headerTitle}>Offers & Promotions</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </ScrollReveal>

                {/* Banner */}
                <ScrollReveal delay={100}>
                    <View style={styles.banner}>
                        <LinearGradient
                            colors={theme.colors.gradients.primary}
                            style={styles.bannerGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <MaterialCommunityIcons
                                name="sale"
                                size={56}
                                color={theme.colors.text.inverse}
                            />
                            <Text style={styles.bannerTitle}>Special Deals</Text>
                            <Text style={styles.bannerSubtitle}>
                                Save big with our exclusive offers
                            </Text>
                        </LinearGradient>
                    </View>
                </ScrollReveal>

                {/* Categories */}
                <ScrollReveal delay={200}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesContainer}
                    >
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryChip,
                                    selectedCategory === category.id && styles.categoryChipActive,
                                ]}
                                onPress={() => setSelectedCategory(category.id)}
                            >
                                <MaterialCommunityIcons
                                    name={category.icon as any}
                                    size={20}
                                    color={
                                        selectedCategory === category.id
                                            ? theme.colors.accent.emerald
                                            : theme.colors.text.secondary
                                    }
                                />
                                <Text
                                    style={[
                                        styles.categoryText,
                                        selectedCategory === category.id && styles.categoryTextActive,
                                    ]}
                                >
                                    {category.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </ScrollReveal>

                {/* Offers Grid */}
                <View style={styles.offersGrid}>
                    {offers.map((offer, index) => (
                        <ScrollReveal key={offer.id} delay={300 + index * 50}>
                            <View style={styles.offerCard}>
                                <LinearGradient
                                    colors={offer.gradient}
                                    style={styles.offerGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.offerIconContainer}>
                                        <MaterialCommunityIcons
                                            name={offer.icon as any}
                                            size={40}
                                            color={theme.colors.text.inverse}
                                        />
                                    </View>
                                    <View style={styles.discountBadge}>
                                        <Text style={styles.discountText}>{offer.discount}</Text>
                                    </View>
                                </LinearGradient>

                                <View style={styles.offerContent}>
                                    <Text style={styles.offerTitle}>{offer.title}</Text>
                                    <Text style={styles.offerDescription}>{offer.description}</Text>

                                    <View style={styles.codeContainer}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.codeLabel}>Code</Text>
                                            <Text style={styles.codeText}>{offer.code}</Text>
                                        </View>
                                        <TouchableOpacity style={styles.copyIconButton}>
                                            <MaterialCommunityIcons
                                                name="content-copy"
                                                size={18}
                                                color={theme.colors.accent.emerald}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.validityContainer}>
                                        <MaterialCommunityIcons
                                            name="clock-outline"
                                            size={14}
                                            color={theme.colors.text.tertiary}
                                        />
                                        <Text style={styles.validityText}>
                                            Valid until {offer.validUntil}
                                        </Text>
                                    </View>

                                    <TouchableOpacity style={styles.applyButton}>
                                        <LinearGradient
                                            colors={offer.gradient}
                                            style={styles.applyGradient}
                                        >
                                            <Text style={styles.applyButtonText}>Apply Now</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollReveal>
                    ))}
                </View>

                {/* Info Section */}
                <ScrollReveal delay={600}>
                    <View style={styles.infoSection}>
                        <Text style={styles.infoTitle}>How to Use Offers</Text>
                        <View style={styles.infoList}>
                            <InfoItem
                                icon="numeric-1-circle"
                                text="Select an offer that suits your purchase"
                            />
                            <InfoItem
                                icon="numeric-2-circle"
                                text="Copy the promo code from the offer card"
                            />
                            <InfoItem
                                icon="numeric-3-circle"
                                text="Apply the code at checkout to get discount"
                            />
                        </View>
                    </View>
                </ScrollReveal>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

// moved inside component to access local styles

const createStyles = (theme: any, isDark: boolean) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background.primary },
        scroll: { flex: 1 },
        content: { paddingBottom: 100 },
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xl, marginBottom: theme.spacing.xl },
        backButton: { width: 40, height: 40, borderRadius: theme.radius.md, backgroundColor: theme.colors.background.elevated, borderWidth: 1, borderColor: theme.colors.border.light, alignItems: 'center', justifyContent: 'center' },
        headerTitle: { fontSize: theme.typography.sizes['2xl'], fontWeight: theme.typography.weights.bold, color: theme.colors.text.primary },
        banner: { marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.xl, borderRadius: theme.radius['2xl'], overflow: 'hidden', ...theme.shadows.lg },
        bannerGradient: { padding: theme.spacing.xl, alignItems: 'center' },
        bannerTitle: { fontSize: theme.typography.sizes['2xl'], fontWeight: theme.typography.weights.bold, color: theme.colors.text.inverse, marginTop: theme.spacing.base },
        bannerSubtitle: { fontSize: theme.typography.sizes.base, color: theme.colors.text.inverse, opacity: 0.9, marginTop: 4 },
        categoriesContainer: { paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm, marginBottom: theme.spacing.xl },
        categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm, borderRadius: theme.radius.full, backgroundColor: theme.colors.background.elevated, borderWidth: 1, borderColor: theme.colors.border.light, gap: 6 },
        categoryChipActive: { backgroundColor: theme.colors.accent.emerald + '20', borderColor: theme.colors.accent.emerald },
        categoryText: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.medium, color: theme.colors.text.secondary },
        categoryTextActive: { color: theme.colors.accent.emerald, fontWeight: theme.typography.weights.semibold },
        offersGrid: { paddingHorizontal: theme.spacing.lg, gap: theme.spacing.lg },
        offerCard: { backgroundColor: theme.colors.background.elevated, borderRadius: theme.radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border.light, ...theme.shadows.md },
        offerGradient: { height: 140, justifyContent: 'center', alignItems: 'center', position: 'relative' },
        offerIconContainer: { marginBottom: theme.spacing.sm },
        discountBadge: { position: 'absolute', top: theme.spacing.base, right: theme.spacing.base, backgroundColor: theme.colors.text.inverse, paddingHorizontal: theme.spacing.base, paddingVertical: theme.spacing.xs, borderRadius: theme.radius.md, ...theme.shadows.sm },
        discountText: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: theme.colors.background.primary },
        offerContent: { padding: theme.spacing.lg },
        offerTitle: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.text.primary, marginBottom: 4 },
        offerDescription: { fontSize: theme.typography.sizes.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing.md, lineHeight: 18 },
        codeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.base, backgroundColor: theme.colors.background.tertiary, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border.DEFAULT, borderStyle: 'dashed', marginBottom: theme.spacing.sm },
        codeLabel: { fontSize: theme.typography.sizes.xs, color: theme.colors.text.tertiary, marginBottom: 2 },
        codeText: { fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold, color: theme.colors.text.primary, letterSpacing: 1 },
        copyIconButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.accent.emerald + '20', alignItems: 'center', justifyContent: 'center' },
        validityContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: theme.spacing.md },
        validityText: { fontSize: theme.typography.sizes.xs, color: theme.colors.text.tertiary },
        applyButton: { borderRadius: theme.radius.md, overflow: 'hidden', ...theme.shadows.sm },
        applyGradient: { paddingVertical: theme.spacing.sm, alignItems: 'center' },
        applyButtonText: { fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.text.inverse },
        infoSection: { paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.xl },
        infoTitle: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.text.primary, marginBottom: theme.spacing.md },
        infoList: { gap: theme.spacing.md },
        infoItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
        infoText: { flex: 1, fontSize: theme.typography.sizes.sm, lineHeight: 20 },
    });

 
