/**
 * React Hook for Offline Search
 * 
 * Hook to search cached products offline.
 */

import { useState, useEffect, useMemo } from 'react';
import { offlineSearchService } from '../services/search/OfflineSearchService';
import type { Product } from '../data/products';

interface UseOfflineSearchOptions {
    query: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'name';
    limit?: number;
    enabled?: boolean;
}

/**
 * Hook for offline product search
 */
export function useOfflineSearch(options: UseOfflineSearchOptions) {
    const [results, setResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const {
        query,
        category,
        brand,
        minPrice,
        maxPrice,
        inStockOnly,
        sortBy,
        limit,
        enabled = true,
    } = options;

    useEffect(() => {
        if (!enabled) {
            setResults([]);
            return;
        }

        setIsSearching(true);

        // Debounce search
        const timeout = setTimeout(() => {
            try {
                const searchResults = offlineSearchService.searchAndFilter(query, {
                    category,
                    brand,
                    minPrice,
                    maxPrice,
                    inStockOnly,
                    sortBy,
                    limit,
                });

                setResults(searchResults);
            } catch (error) {
                console.error('[useOfflineSearch] Search error:', error);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeout);
    }, [query, category, brand, minPrice, maxPrice, inStockOnly, sortBy, limit, enabled]);

    // Get index stats
    const stats = useMemo(() => {
        return offlineSearchService.getIndexStats();
    }, []);

    return {
        results,
        isSearching,
        stats,
        rebuild: () => offlineSearchService.rebuild(),
    };
}
