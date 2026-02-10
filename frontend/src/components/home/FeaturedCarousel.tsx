import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Dimensions,
    StyleSheet,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    useAnimatedScrollHandler,
    runOnJS,
    scrollTo,
    useAnimatedRef,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import ModernProductCard from '../products/ModernProductCard';
import type { Product } from '../../data/products';
import { useTheme } from '../../theme/themeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.6;
const SPACING = 10;
const ITEM_SIZE = CARD_WIDTH + SPACING * 2;
const SPACER_WIDTH = (SCREEN_WIDTH - ITEM_SIZE) / 2;

interface FeaturedCarouselProps {
    products: Product[];
}

export default function FeaturedCarousel({ products }: FeaturedCarouselProps) {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const scrollX = useSharedValue(0);
    const scrollViewRef = useAnimatedRef<Animated.ScrollView>();

    // Create a data array with 3 duplicates: [Original, Original, Original]
    // We start in the middle set. When we scroll to the end of the 2nd set, we snap back to the start of 2nd set.
    // When we scroll to start of 2nd set, we snap to end of 2nd set.
    const data = [...products, ...products, ...products, ...products];
    const originalLength = products.length;
    // Start at the second set
    const initialOffset = originalLength * ITEM_SIZE;

    // We use a state to ensure we scroll after layout
    const [ready, setReady] = useState(false);

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollX.value = event.contentOffset.x;
        const offsetX = event.contentOffset.x;
        const totalContentWidth = originalLength * ITEM_SIZE;

        // Boundaries for reset
        // If we scroll past the 3rd set (too far right), jump back to 2nd set
        if (offsetX >= totalContentWidth * 2) {
            scrollTo(scrollViewRef, offsetX - totalContentWidth, 0, false);
        }
        // If we scroll before the 2nd set (too far left), jump forward to 3rd set
        else if (offsetX <= totalContentWidth * 0.5) { // Threshold
            scrollTo(scrollViewRef, offsetX + totalContentWidth, 0, false);
        }
    });

    useEffect(() => {
        if (ready) {
            // Initial scroll to middle set
            // This might need runOnUI or simple ref interaction
            // For now, simpler approach: rely on contentOffset prop or scrollTo
        }
    }, [ready]);


    return (
        <View style={styles.container}>
            <Animated.ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={ITEM_SIZE}
                decelerationRate="fast"
                contentContainerStyle={{
                    paddingHorizontal: SPACER_WIDTH - SPACING,
                }}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                // Initial offset to start in the middle set
                contentOffset={{ x: initialOffset, y: 0 }}
            >
                {data.map((product, index) => {
                    // Generating unique keys is tricky with duplicates, utilizing index
                    const uniqueKey = `${product.id}-${index}`;

                    const inputRange = [
                        (index - 1) * ITEM_SIZE,
                        index * ITEM_SIZE,
                        (index + 1) * ITEM_SIZE,
                    ];

                    const animatedStyle = useAnimatedStyle(() => {
                        const scale = interpolate(
                            scrollX.value,
                            inputRange,
                            [0.85, 1, 0.85],
                            Extrapolate.CLAMP
                        );

                        const opacity = interpolate(
                            scrollX.value,
                            inputRange,
                            [0.6, 1, 0.6],
                            Extrapolate.CLAMP
                        );

                        const rotateY = interpolate(
                            scrollX.value,
                            inputRange,
                            [25, 0, -25],
                            Extrapolate.CLAMP
                        );

                        const translateX = interpolate(
                            scrollX.value,
                            inputRange,
                            [-20, 0, 20],
                            Extrapolate.CLAMP
                        );

                        return {
                            transform: [
                                { perspective: 800 },
                                { rotateY: `${rotateY}deg` },
                                { translateX },
                                { scale },
                            ],
                            opacity,
                            zIndex: index === 0 ? 1 : 0, // Simplified zIndex logic needs improvement for true overlay
                        };
                    });

                    return (
                        <Animated.View key={uniqueKey} style={[styles.cardContainer, animatedStyle]}>
                            <ModernProductCard
                                product={product}
                                width={CARD_WIDTH}
                                onPress={() => navigation.navigate('ProductDetail', { productId: product.id, product })}
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 12,
                                    elevation: 6,
                                }}
                            />
                        </Animated.View>
                    );
                })}
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
    },
    cardContainer: {
        width: ITEM_SIZE, // Use ITEM_SIZE to ensure correct spacing container
        justifyContent: 'center',
        alignItems: 'center',
    },
});
