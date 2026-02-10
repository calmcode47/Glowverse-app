import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ModernProductCard from '../../components/products/ModernProductCard';
import { products } from '../../data/products';
import type { Product } from '../../data/products';

export default function SearchScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [recentSearches, setRecentSearches] = useState(['Sunglasses', 'Summer', 'Watches']); // Mock data

    useEffect(() => {
        if (query.length > 0) {
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.brand.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filtered);
        } else {
            setResults([]);
        }
    }, [query]);

    return (
        <View style={styles.container}>
            <ProfessionalBackground variant="subtle" />

            {/* Search Header */}
            <View style={[styles.header, { paddingTop: 60 }]}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.secondary} />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text.primary }]}
                        placeholder="Search products..."
                        placeholderTextColor={theme.colors.text.tertiary}
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <MaterialCommunityIcons name="close" size={20} color={theme.colors.text.secondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Content */}
            {query.length === 0 ? (
                <View style={styles.recentContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>Recent Searches</Text>
                    <View style={styles.tags}>
                        {recentSearches.map((term, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.tag, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }]}
                                onPress={() => setQuery(term)}
                            >
                                <Text style={{ color: theme.colors.text.primary }}>{term}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.resultsList}
                    renderItem={({ item }) => (
                        <ModernProductCard
                            product={item}
                            onPress={() => navigation.navigate('ProductDetail' as any, { productId: item.id, product: item })}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={{ color: theme.colors.text.secondary }}>No results found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    recentContainer: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    resultsList: {
        paddingHorizontal: 10,
        paddingBottom: 40,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    }
});
