import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useTheme } from '../../theme/themeContext';
import { Checkbox, PillButton } from '../../components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollReveal from '../../components/animations/ScrollReveal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AdvancedFiltersScreen({ route, navigation }: any) {
    const { theme, isDark } = useTheme();
    const { currentFilters = {} } = route.params || {};

    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        currentFilters.categories || (currentFilters.category ? [currentFilters.category] : [])
    );
    const [selectedBrands, setSelectedBrands] = useState<string[]>(
        currentFilters.brands || (currentFilters.brand ? [currentFilters.brand] : [])
    );
    const [priceRange, setPriceRange] = useState<number[]>(
        currentFilters.priceRange || [currentFilters.minPrice || 0, currentFilters.maxPrice || 200]
    );
    const [sortBy, setSortBy] = useState(currentFilters.sortBy || 'newest');
    const [inStockOnly, setInStockOnly] = useState(
        currentFilters.inStockOnly || false
    );

    const categories = ['Skincare', 'Makeup', 'Haircare', 'Fragrances', 'Tools'];
    const brands = ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E'];
    const sortOptions = [
        { value: 'newest', label: 'Newest First', icon: 'clock-outline' },
        { value: 'price_asc', label: 'Price: Low to High', icon: 'arrow-up' },
        { value: 'price_desc', label: 'Price: High to Low', icon: 'arrow-down' },
        { value: 'rating', label: 'Highest Rated', icon: 'star-outline' },
        { value: 'popular', label: 'Most Popular', icon: 'fire' },
    ];

    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const toggleBrand = (brand: string) => {
        if (selectedBrands.includes(brand)) {
            setSelectedBrands(selectedBrands.filter(b => b !== brand));
        } else {
            setSelectedBrands([...selectedBrands, brand]);
        }
    };

    const applyFilters = () => {
        const filters = {
            categories: selectedCategories,
            category: selectedCategories.length > 0 ? selectedCategories[0] : undefined, // Compatibility
            brands: selectedBrands,
            brand: selectedBrands.length > 0 ? selectedBrands[0] : undefined, // Compatibility
            priceRange,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            sortBy,
            inStockOnly,
        };
        navigation.navigate('MainTabs', {
            screen: 'ShopTab',
            params: { filters }
        });
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedBrands([]);
        setPriceRange([0, 200]);
        setSortBy('newest');
        setInStockOnly(false);
    };

    const styles = createStyles(theme, isDark);

    return (
        <View style={styles.container}>
            <ProfessionalBackground variant="subtle" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="close" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Filters</Text>
                <TouchableOpacity onPress={clearFilters}>
                    <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Sort By Section */}
                <ScrollReveal delay={0}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sort By</Text>
                        <View style={styles.sortGrid}>
                            {sortOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.sortOption,
                                        { backgroundColor: theme.colors.background.elevated },
                                        sortBy === option.value && { borderColor: theme.colors.accent.emerald, borderWidth: 2 },
                                    ]}
                                    onPress={() => setSortBy(option.value)}
                                >
                                    <MaterialCommunityIcons
                                        name={option.icon as any}
                                        size={20}
                                        color={sortBy === option.value ? theme.colors.accent.emerald : theme.colors.text.secondary}
                                    />
                                    <Text
                                        style={[
                                            styles.sortOptionText,
                                            { color: sortBy === option.value ? theme.colors.text.primary : theme.colors.text.secondary },
                                            sortBy === option.value && { fontWeight: '700' }
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollReveal>

                {/* Categories Section */}
                <ScrollReveal delay={100}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <View style={styles.checkboxGrid}>
                            {categories.map((category) => (
                                <Checkbox
                                    key={category}
                                    label={category}
                                    checked={selectedCategories.includes(category)}
                                    onPress={() => toggleCategory(category)}
                                    style={styles.checkboxItem}
                                />
                            ))}
                        </View>
                    </View>
                </ScrollReveal>

                {/* Price Range Section */}
                <ScrollReveal delay={200}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Price Range</Text>
                        <View style={styles.priceHeader}>
                            <Text style={[styles.priceValue, { color: theme.colors.accent.emerald }]}>
                                ${priceRange[0]} - ${priceRange[1]}
                            </Text>
                        </View>
                        <View style={styles.sliderContainer}>
                            <MultiSlider
                                values={priceRange}
                                min={0}
                                max={200}
                                step={5}
                                onValuesChange={setPriceRange}
                                sliderLength={SCREEN_WIDTH - 80}
                                selectedStyle={{ backgroundColor: theme.colors.accent.emerald }}
                                unselectedStyle={{ backgroundColor: theme.colors.border.light }}
                                markerStyle={styles.sliderMarker}
                                pressedMarkerStyle={styles.sliderMarkerPressed}
                                trackStyle={{ height: 4, borderRadius: 2 }}
                            />
                        </View>
                    </View>
                </ScrollReveal>

                {/* Brands Section */}
                <ScrollReveal delay={300}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Brands</Text>
                        <View style={styles.checkboxGrid}>
                            {brands.map((brand) => (
                                <Checkbox
                                    key={brand}
                                    label={brand}
                                    checked={selectedBrands.includes(brand)}
                                    onPress={() => toggleBrand(brand)}
                                    style={styles.checkboxItem}
                                />
                            ))}
                        </View>
                    </View>
                </ScrollReveal>

                {/* Options Section */}
                <ScrollReveal delay={400}>
                    <View style={[styles.section, styles.noBorder]}>
                        <Text style={styles.sectionTitle}>Availability</Text>
                        <Checkbox
                            label="Show only items in stock"
                            checked={inStockOnly}
                            onPress={() => setInStockOnly(!inStockOnly)}
                        />
                    </View>
                </ScrollReveal>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={[styles.footer, { paddingBottom: 40 }]}>
                <PillButton
                    label="Apply Filters"
                    onPress={applyFilters}
                    style={styles.applyButton}
                />
            </View>
        </View>
    );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
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
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text.primary,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.background.elevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resetText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.accent.emerald,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    section: {
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
    noBorder: {
        borderBottomWidth: 0,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.text.primary,
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sortGrid: {
        gap: 12,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    sortOptionText: {
        fontSize: 15,
        fontWeight: '600',
    },
    checkboxGrid: {
        gap: 16,
    },
    checkboxItem: {
        marginVertical: 4,
    },
    priceHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    priceValue: {
        fontSize: 24,
        fontWeight: '900',
    },
    sliderContainer: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    sliderMarker: {
        backgroundColor: theme.colors.accent.emerald,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 4,
        borderColor: '#FFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    sliderMarkerPressed: {
        width: 28,
        height: 28,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.light,
        backgroundColor: theme.colors.background.primary,
    },
    applyButton: {
        width: '100%',
        height: 56,
    },
});
