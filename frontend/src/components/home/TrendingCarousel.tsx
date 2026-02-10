import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInRight,
    Layout,
    RotateInUpLeft
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Product } from '../../data/products';
import { useTheme } from '../../theme/themeContext';
import PriceTrendGraph from './PriceTrendGraph';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;

interface TrendingCarouselProps {
    products: Product[];
}

export default function TrendingCarousel({ products }: TrendingCarouselProps) {
    const { theme } = useTheme();
    const navigation = useNavigation<any>();

    const renderItem = ({ item, index }: { item: Product; index: number }) => (
        <Animated.View
            entering={FadeInRight.delay(index * 100).springify()}
            style={[styles.cardContainer, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id, product: item })}
                style={styles.card}
            >
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                />

                <View style={styles.content}>
                    <View style={styles.tag}>
                        <MaterialCommunityIcons name="fire" size={14} color="#FF4500" />
                        <Text style={styles.tagText}>TRENDING</Text>
                    </View>

                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.brand}>{item.brand}</Text>

                    <View style={styles.footer}>
                        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                        {item.priceHistory && (
                            <PriceTrendGraph
                                data={item.priceHistory}
                                width={80}
                                height={30}
                                color={theme.colors.accent.emerald}
                            />
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.favButton, { backgroundColor: theme.colors.background.primary + '80' }]}
                >
                    <MaterialCommunityIcons name="heart-outline" size={20} color={theme.colors.text.primary} />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 20}
                decelerationRate="fast"
                contentContainerStyle={styles.listContent}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    listContent: {
        paddingHorizontal: 20,
        gap: 20,
        paddingBottom: 10,
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: 220,
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    card: {
        flex: 1,
    },
    image: {
        ...StyleSheet.absoluteFillObject,
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70%',
    },
    content: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 8,
    },
    tagText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    name: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    brand: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    price: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    favButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
