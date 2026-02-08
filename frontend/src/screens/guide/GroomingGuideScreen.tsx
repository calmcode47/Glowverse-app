import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@constants/theme";
import GlassmorphicCard from "@components/ui/GlassmorphicCard";
import ScrollAnimatedView from "@components/animations/ScrollAnimatedView";

const groomingTips = [
    {
        id: "1",
        title: "Morning Skincare Routine",
        duration: "5 min",
        steps: 4,
        category: "Skincare",
        icon: "weather-sunny",
    },
    {
        id: "2",
        title: "Perfect Beard Grooming",
        duration: "10 min",
        steps: 6,
        category: "Beard Care",
        icon: "face-man",
    },
    {
        id: "3",
        title: "Hair Styling Guide",
        duration: "8 min",
        steps: 5,
        category: "Hair",
        icon: "hair-dryer",
    },
    {
        id: "4",
        title: "Evening Skincare",
        duration: "7 min",
        steps: 5,
        category: "Skincare",
        icon: "weather-night",
    },
];

const categories = ["All", "Skincare", "Hair", "Beard Care", "Style"];

export default function GroomingGuideScreen() {
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredTips =
        selectedCategory === "All"
            ? groomingTips
            : groomingTips.filter((tip) => tip.category === selectedCategory);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.background, theme.colors.surfaceLight]}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <ScrollAnimatedView variant="fade" delay={0}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Grooming Guide</Text>
                        <Text style={styles.headerSubtitle}>
                            Master your grooming routine
                        </Text>
                    </View>
                </ScrollAnimatedView>

                {/* Categories */}
                <ScrollAnimatedView variant="slideUp" delay={50}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesContainer}
                    >
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category}
                                onPress={() => setSelectedCategory(category)}
                                style={[
                                    styles.categoryChip,
                                    selectedCategory === category && styles.categoryChipActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.categoryText,
                                        selectedCategory === category && styles.categoryTextActive,
                                    ]}
                                >
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </ScrollAnimatedView>

                {/* Featured Tip */}
                <ScrollAnimatedView variant="slideUp" delay={100}>
                    <GlassmorphicCard gradient style={styles.featuredCard}>
                        <View style={styles.featuredBadge}>
                            <MaterialCommunityIcons
                                name="star"
                                size={24}
                                color={theme.colors.yellow}
                            />
                            <Text style={styles.featuredLabel}>Featured</Text>
                        </View>
                        <Text style={styles.featuredTitle}>The Ultimate Morning Routine</Text>
                        <Text style={styles.featuredSubtitle}>
                            Start your day right with our complete guide
                        </Text>
                        <View style={styles.featuredMeta}>
                            <View style={styles.metaItem}>
                                <MaterialCommunityIcons
                                    name="clock-outline"
                                    size={16}
                                    color={theme.colors.text.light}
                                />
                                <Text style={styles.metaText}>15 min</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <MaterialCommunityIcons
                                    name="book-open-variant"
                                    size={16}
                                    color={theme.colors.text.light}
                                />
                                <Text style={styles.metaText}>8 steps</Text>
                            </View>
                        </View>
                    </GlassmorphicCard>
                </ScrollAnimatedView>

                {/* Guide List */}
                <Text style={styles.sectionTitle}>All Guides</Text>
                {filteredTips.map((tip, index) => (
                    <ScrollAnimatedView key={tip.id} variant="slideUp" delay={150 + index * 50}>
                        <TouchableOpacity style={styles.tipCard}>
                            <View style={styles.tipIcon}>
                                <MaterialCommunityIcons
                                    name={tip.icon as any}
                                    size={32}
                                    color={theme.colors.orange}
                                />
                            </View>
                            <View style={styles.tipContent}>
                                <View style={styles.tipHeader}>
                                    <Text style={styles.tipTitle}>{tip.title}</Text>
                                    <View style={styles.categoryBadge}>
                                        <Text style={styles.categoryBadgeText}>{tip.category}</Text>
                                    </View>
                                </View>
                                <View style={styles.tipMeta}>
                                    <View style={styles.metaItem}>
                                        <MaterialCommunityIcons
                                            name="clock-outline"
                                            size={14}
                                            color={theme.colors.text.muted}
                                        />
                                        <Text style={styles.tipMetaText}>{tip.duration}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <MaterialCommunityIcons
                                            name="format-list-numbered"
                                            size={14}
                                            color={theme.colors.text.muted}
                                        />
                                        <Text style={styles.tipMetaText}>{tip.steps} steps</Text>
                                    </View>
                                </View>
                            </View>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={24}
                                color={theme.colors.text.muted}
                            />
                        </TouchableOpacity>
                    </ScrollAnimatedView>
                ))}

                <View style={styles.bottomPad} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingTop: Platform.OS === "ios" ? 60 : 50,
        paddingHorizontal: theme.spacing.scale[4],
        paddingBottom: 100,
    },
    header: {
        marginBottom: theme.spacing.scale[4],
    },
    headerTitle: {
        fontSize: theme.typography.fontSizes.xxl,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.text.primary,
    },
    headerSubtitle: {
        fontSize: theme.typography.fontSizes.md,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.scale[1],
    },
    categoriesContainer: {
        paddingVertical: theme.spacing.scale[3],
        gap: theme.spacing.scale[2],
    },
    categoryChip: {
        paddingHorizontal: theme.spacing.scale[4],
        paddingVertical: theme.spacing.scale[2],
        borderRadius: theme.radius.round,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        marginRight: theme.spacing.scale[2],
    },
    categoryChipActive: {
        backgroundColor: theme.colors.orange,
        borderColor: theme.colors.orange,
    },
    categoryText: {
        fontSize: theme.typography.fontSizes.sm,
        fontWeight: theme.typography.fontWeights.medium,
        color: theme.colors.text.secondary,
    },
    categoryTextActive: {
        color: theme.colors.text.inverse,
    },
    featuredCard: {
        marginVertical: theme.spacing.scale[4],
    },
    featuredBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.scale[1],
        marginBottom: theme.spacing.scale[2],
    },
    featuredLabel: {
        fontSize: theme.typography.fontSizes.sm,
        fontWeight: theme.typography.fontWeights.semibold,
        color: theme.colors.yellow,
    },
    featuredTitle: {
        fontSize: theme.typography.fontSizes.xl,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.scale[1],
    },
    featuredSubtitle: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.scale[3],
    },
    featuredMeta: {
        flexDirection: "row",
        gap: theme.spacing.scale[4],
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.scale[1],
    },
    metaText: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.text.light,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSizes.lg,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.scale[3],
        marginTop: theme.spacing.scale[2],
    },
    tipCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.scale[4],
        marginBottom: theme.spacing.scale[3],
        ...theme.shadow.level1,
    },
    tipIcon: {
        width: 56,
        height: 56,
        borderRadius: theme.radius.lg,
        backgroundColor: `${theme.colors.orange}15`,
        alignItems: "center",
        justifyContent: "center",
        marginRight: theme.spacing.scale[3],
    },
    tipContent: {
        flex: 1,
    },
    tipHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: theme.spacing.scale[1],
    },
    tipTitle: {
        fontSize: theme.typography.fontSizes.md,
        fontWeight: theme.typography.fontWeights.semibold,
        color: theme.colors.text.primary,
        flex: 1,
    },
    categoryBadge: {
        backgroundColor: theme.colors.orangeLight,
        paddingHorizontal: theme.spacing.scale[2],
        paddingVertical: 2,
        borderRadius: theme.radius.sm,
        marginLeft: theme.spacing.scale[2],
    },
    categoryBadgeText: {
        fontSize: theme.typography.fontSizes.xs,
        color: theme.colors.text.inverse,
        fontWeight: theme.typography.fontWeights.medium,
    },
    tipMeta: {
        flexDirection: "row",
        gap: theme.spacing.scale[3],
    },
    tipMetaText: {
        fontSize: theme.typography.fontSizes.xs,
        color: theme.colors.text.muted,
    },
    bottomPad: {
        height: 24,
    },
});
