import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import { adminApi, AdminProduct } from '../../services/api/admin.api';
import { SearchBar, PillButton } from '../../components/ui';
import { useTheme } from '../../theme/themeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ProductsManagementScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const data = await adminApi.getProducts();
            setProducts(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteProduct = async (productId: string) => {
        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this product?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await adminApi.deleteProduct(productId);
                            setProducts(products.filter(p => p.id !== productId));
                            Alert.alert('Success', 'Product deleted');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete product');
                        }
                    },
                },
            ]
        );
    };

    const renderProduct = ({ item }: { item: AdminProduct }) => (
        <View style={[styles.productCard, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }]}>
            <Image source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }} style={styles.productImage} />

            <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: theme.colors.text.primary }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.productCategory, { color: theme.colors.text.tertiary }]}>{item.category}</Text>
                <Text style={[styles.productPrice, { color: theme.colors.accent.blue }]}>${item.price.toFixed(2)}</Text>

                <View style={styles.productStats}>
                    <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>Stock: {item.stock || 0}</Text>
                    <Text style={[styles.statText, { color: item.inStock ? theme.colors.accent.emerald : theme.colors.error }]}>
                        {item.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                    </Text>
                </View>
            </View>

            <View style={styles.productActions}>
                <TouchableOpacity
                    onPress={() => Alert.alert("Coming Soon", "Edit functionality is under development.")}
                    style={styles.actionButton}
                >
                    <MaterialCommunityIcons name="pencil-outline" size={24} color={theme.colors.accent.blue} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => deleteProduct(item.id)}
                    style={styles.actionButton}
                >
                    <MaterialCommunityIcons name="trash-can-outline" size={24} color={theme.colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            {/* Header with Search and Add Button */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated }]}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search products..."
                    // @ts-ignore
                    style={styles.searchBar}
                />
                <PillButton
                    label="Add Product"
                    onPress={() => Alert.alert("Coming Soon", "Add functionality is under development.")}
                    icon="plus"
                    style={styles.addButton}
                />
            </View>

            {/* Products List */}
            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.accent.blue} />
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="package-variant" size={64} color={theme.colors.border.main} />
                            <Text style={[styles.emptyText, { color: theme.colors.text.tertiary }]}>No products found</Text>
                        </View>
                    }
                    onRefresh={loadProducts}
                    refreshing={isLoading}
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
        padding: 16,
        borderBottomWidth: 1,
        paddingTop: 10,
    },
    searchBar: {
        marginBottom: 12,
    },
    addButton: {
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    list: {
        padding: 16,
        paddingBottom: 40,
    },
    productCard: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    productImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
    },
    productInfo: {
        flex: 1,
        marginLeft: 15,
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    productCategory: {
        fontSize: 12,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 6,
    },
    productStats: {
        flexDirection: 'row',
        gap: 12,
    },
    statText: {
        fontSize: 11,
        fontWeight: '500',
    },
    productActions: {
        justifyContent: 'center',
        gap: 15,
        paddingLeft: 10,
    },
    actionButton: {
        padding: 5,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        padding: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        marginTop: 12,
    },
});
