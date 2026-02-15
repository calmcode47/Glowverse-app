/**
 * Product Cache Manager
 * 
 * Manages product caching, prefetching, and cache eviction.
 */

import { queryClient, prefetchQuery } from '../../lib/queryClient';
import * as ProductsAPI from '../../services/api/products.api';
import { productKeys } from '../../hooks/queries/useProducts';
import { cacheMetadataStorage, setMMKVObject, getMMKVObject } from '../../lib/mmkvStorage';

interface CacheMetadata {
    totalProducts: number;
    categories: string[];
    lastPrefetchAt: number;
    prefetchedCategories: string[];
}

class ProductCacheManager {
    private readonly CACHE_KEY = 'product_cache_metadata';

    /**
     * Prefetch popular categories on app start
     */
    async prefetchCategories(categories: string[]): Promise<void> {
        console.log(`[ProductCache] Prefetching ${categories.length} categories`);

        const promises = categories.map(async (category) => {
            try {
                await prefetchQuery(
                    productKeys.category(category) as any,
                    () => ProductsAPI.getProductsByCategory(category, { limit: 20 }),
                    { staleTime: 1000 * 60 * 30 }
                );
            } catch (error) {
                console.error(`[ProductCache] Failed to prefetch category ${category}:`, error);
            }
        });

        await Promise.allSettled(promises);

        // Update metadata
        const metadata = this.getMetadata();
        setMMKVObject(cacheMetadataStorage, this.CACHE_KEY, {
            ...metadata,
            lastPrefetchAt: Date.now(),
            prefetchedCategories: categories,
        });

        console.log('[ProductCache] Prefetch complete');
    }

    /**
     * Prefetch featured products
     */
    async prefetchFeatured(): Promise<void> {
        try {
            await prefetchQuery(
                productKeys.featured() as any,
                () => ProductsAPI.getFeaturedProducts(),
                { staleTime: 1000 * 60 * 60 }
            );
        } catch (error) {
            console.error('[ProductCache] Failed to prefetch featured products:', error);
        }
    }

    /**
     * Prefetch new arrivals
     */
    async prefetchNewArrivals(): Promise<void> {
        try {
            await prefetchQuery(
                productKeys.newArrivals() as any,
                () => ProductsAPI.getNewArrivals(),
                { staleTime: 1000 * 60 * 60 }
            );
        } catch (error) {
            console.error('[ProductCache] Failed to prefetch new arrivals:', error);
        }
    }

    /**
     * Prefetch bestsellers
     */
    async prefetchBestsellers(): Promise<void> {
        try {
            await prefetchQuery(
                productKeys.bestsellers() as any,
                () => ProductsAPI.getBestsellers(),
                { staleTime: 1000 * 60 * 120 }
            );
        } catch (error) {
            console.error('[ProductCache] Failed to prefetch bestsellers:', error);
        }
    }

    /**
     * Prefetch all critical product data
     */
    async prefetchAll(): Promise<void> {
        console.log('[ProductCache] Starting full prefetch');

        await Promise.allSettled([
            this.prefetchFeatured(),
            this.prefetchNewArrivals(),
            this.prefetchBestsellers(),
            this.prefetchCategories(['makeup', 'skincare', 'haircare', 'fragrance']),
        ]);

        console.log('[ProductCache] Full prefetch complete');
    }

    /**
     * Get cache metadata
     */
    getMetadata(): CacheMetadata {
        const metadata = getMMKVObject<CacheMetadata>(cacheMetadataStorage, this.CACHE_KEY);

        if (!metadata) {
            return {
                totalProducts: 0,
                categories: [],
                lastPrefetchAt: 0,
                prefetchedCategories: [],
            };
        }

        return metadata;
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        const cache = queryClient.getQueryCache();
        const allQueries = cache.getAll();
        const productQueries = allQueries.filter((q: any) =>
            Array.isArray(q.queryKey) && q.queryKey[0] === 'products'
        );

        return {
            totalQueries: allQueries.length,
            productQueries: productQueries.length,
            activeQueries: productQueries.filter(q => q.getObserversCount() > 0).length,
            staleQueries: productQueries.filter(q => q.isStale()).length,
            fetchingQueries: productQueries.filter(q => q.state.fetchStatus === 'fetching').length,
            metadata: this.getMetadata(),
        };
    }

    /**
     * Manually refresh cache for a category
     */
    async refreshCategory(category: string): Promise<void> {
        console.log(`[ProductCache] Refreshing category: ${category}`);

        await queryClient.invalidateQueries({
            queryKey: productKeys.category(category),
        });

        // Prefetch fresh data
        await this.prefetchCategories([category]);
    }

    /**
     * Clear all product cache
     */
    async clearCache(): Promise<void> {
        console.log('[ProductCache] Clearing all product cache');

        await queryClient.invalidateQueries({
            queryKey: productKeys.all,
        });

        // Clear metadata
        cacheMetadataStorage.delete(this.CACHE_KEY);
    }

    /**
     * LRU eviction - remove least recently used products
     * (Handled automatically by React Query's gcTime)
     */
    async evictLRU(): Promise<void> {
        // React Query handles this automatically with gcTime
        // We can manually remove stale queries if needed
        const cache = queryClient.getQueryCache();
        const allQueries = cache.getAll();
        const staleQueries = allQueries.filter(q => q.isStale());

        console.log(`[ProductCache] Evicting ${staleQueries.length} stale queries`);

        staleQueries.forEach((query: any) => {
            cache.remove(query);
        });
    }
}

/**
 * Singleton instance
 */
export const productCacheManager = new ProductCacheManager();
