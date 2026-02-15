/**
 * Offline Search Service
 * 
 * Provides client-side search using Fuse.js when offline or for cached products.
 */

import Fuse, { IFuseOptions } from 'fuse.js';
import type { Product } from '../../data/products';
import { queryClient } from '../../lib/queryClient';
import { productKeys } from '../../hooks/queries/useProducts';

class OfflineSearchService {
    private searchIndex: Fuse<Product> | null = null;
    private indexedProducts: Product[] = [];

    /**
     * Fuse.js configuration for fuzzy search
     */
    private readonly fuseOptions: IFuseOptions<Product> = {
        keys: [
            { name: 'name', weight: 0.4 },
            { name: 'brand', weight: 0.3 },
            { name: 'category', weight: 0.2 },
            { name: 'description', weight: 0.1 },
        ],
        threshold: 0.4, // 0 = perfect match, 1 = match anything
        minMatchCharLength: 2,
        includeScore: true,
        useExtendedSearch: true,
    };

    /**
     * Build search index from cached products
     */
    buildIndex(): void {
        const products = this.getAllCachedProducts();

        if (products.length === 0) {
            console.log('[OfflineSearch] No cached products to index');
            return;
        }

        this.indexedProducts = products;
        this.searchIndex = new Fuse(products, this.fuseOptions);

        console.log(`[OfflineSearch] Indexed ${products.length} products`);
    }

    /**
     * Search cached products
     * @param query Search query
     * @param limit Maximum results (default: 20)
     */
    search(query: string, limit: number = 20): Product[] {
        if (!this.searchIndex) {
            this.buildIndex();
        }

        if (!this.searchIndex || !query.trim()) {
            return [];
        }

        const results = this.searchIndex.search(query, { limit });

        return results.map(result => result.item);
    }

    /**
     * Filter products by criteria
     */
    filter(criteria: {
        category?: string;
        brand?: string;
        minPrice?: number;
        maxPrice?: number;
        inStockOnly?: boolean;
    }): Product[] {
        let products = this.indexedProducts.length > 0
            ? this.indexedProducts
            : this.getAllCachedProducts();

        if (criteria.category) {
            products = products.filter(p =>
                p.category.toLowerCase() === criteria.category?.toLowerCase()
            );
        }

        if (criteria.brand) {
            products = products.filter(p =>
                p.brand.toLowerCase() === criteria.brand?.toLowerCase()
            );
        }

        if (criteria.minPrice !== undefined) {
            products = products.filter(p => p.price >= criteria.minPrice!);
        }

        if (criteria.maxPrice !== undefined) {
            products = products.filter(p => p.price <= criteria.maxPrice!);
        }

        if (criteria.inStockOnly) {
            products = products.filter(p => p.inStock);
        }

        return products;
    }

    /**
     * Sort products
     */
    sort(
        products: Product[],
        sortBy: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'name'
    ): Product[] {
        const sorted = [...products];

        switch (sortBy) {
            case 'price_asc':
                return sorted.sort((a, b) => a.price - b.price);

            case 'price_desc':
                return sorted.sort((a, b) => b.price - a.price);

            case 'rating':
                return sorted.sort((a, b) => b.rating - a.rating);

            case 'newest':
                return sorted.sort((a, b) => {
                    // If both have isNew flag, they're equally new
                    if (a.isNew && b.isNew) return 0;
                    if (a.isNew) return -1;
                    if (b.isNew) return 1;
                    return 0;
                });

            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));

            default:
                return sorted;
        }
    }

    /**
     * Search and filter combined
     */
    searchAndFilter(
        query: string,
        criteria: {
            category?: string;
            brand?: string;
            minPrice?: number;
            maxPrice?: number;
            inStockOnly?: boolean;
            sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'name';
            limit?: number;
        }
    ): Product[] {
        let results: Product[];

        // If query is provided, search first
        if (query.trim().length > 0) {
            results = this.search(query, criteria.limit || 100);
        } else {
            // Otherwise, get all cached products
            results = this.indexedProducts.length > 0
                ? this.indexedProducts
                : this.getAllCachedProducts();
        }

        // Apply filters
        results = this.filterProducts(results, criteria);

        // Apply sorting
        if (criteria.sortBy) {
            results = this.sort(results, criteria.sortBy);
        }

        // Apply limit
        if (criteria.limit && results.length > criteria.limit) {
            results = results.slice(0, criteria.limit);
        }

        return results;
    }

    /**
     * Helper to filter products array
     */
    private filterProducts(
        products: Product[],
        criteria: {
            category?: string;
            brand?: string;
            minPrice?: number;
            maxPrice?: number;
            inStockOnly?: boolean;
        }
    ): Product[] {
        let filtered = products;

        if (criteria.category) {
            filtered = filtered.filter(p =>
                p.category.toLowerCase() === criteria.category?.toLowerCase()
            );
        }

        if (criteria.brand) {
            filtered = filtered.filter(p =>
                p.brand.toLowerCase() === criteria.brand?.toLowerCase()
            );
        }

        if (criteria.minPrice !== undefined) {
            filtered = filtered.filter(p => p.price >= criteria.minPrice!);
        }

        if (criteria.maxPrice !== undefined) {
            filtered = filtered.filter(p => p.price <= criteria.maxPrice!);
        }

        if (criteria.inStockOnly) {
            filtered = filtered.filter(p => p.inStock);
        }

        return filtered;
    }

    /**
     * Get all products from React Query cache
     */
    private getAllCachedProducts(): Product[] {
        const cache = queryClient.getQueryCache();
        const allQueries = cache.getAll();

        const products: Product[] = [];

        // Extract products from all product queries
        allQueries.forEach(query => {
            const queryKey = query.queryKey;

            // Skip non-product queries
            if (!Array.isArray(queryKey) || queryKey[0] !== 'products') {
                return;
            }

            const data: any = query.state.data;

            if (!data) return;

            // Handle different query result shapes
            if (Array.isArray(data)) {
                // Featured, new arrivals, bestsellers
                products.push(...data);
            } else if (data.products && Array.isArray(data.products)) {
                // Product list response
                products.push(...data.products);
            } else if (data.id) {
                // Single product
                products.push(data);
            }
        });

        // Remove duplicates by ID
        const uniqueProducts = Array.from(
            new Map(products.map(p => [p.id, p])).values()
        );

        return uniqueProducts;
    }

    /**
     * Get index statistics
     */
    getIndexStats() {
        return {
            indexed: this.indexedProducts.length,
            cached: this.getAllCachedProducts().length,
            hasIndex: this.searchIndex !== null,
        };
    }

    /**
     * Rebuild index (for manual refresh)
     */
    rebuild(): void {
        this.searchIndex = null;
        this.indexedProducts = [];
        this.buildIndex();
    }
}

/**
 * Singleton instance
 */
export const offlineSearchService = new OfflineSearchService();
