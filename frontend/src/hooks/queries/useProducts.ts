/**
 * Product Query Hooks
 * 
 * React Query hooks for product data with offline caching.
 * Products are cached for 24 hours and remain accessible offline.
 */

import { useQuery, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import * as ProductsAPI from '../../services/api/products.api';
import type { ProductQueryParams } from '../../services/api/products.api';
import type { Product } from '../../data/products';

/**
 * Query key factory for products
 * Ensures consistent cache keys across the app
 */
export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (params: ProductQueryParams) => [...productKeys.lists(), params] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
    search: (query: string, filters?: any) => [...productKeys.all, 'search', query, filters] as const,
    category: (category: string) => [...productKeys.all, 'category', category] as const,
    featured: () => [...productKeys.all, 'featured'] as const,
    newArrivals: () => [...productKeys.all, 'newArrivals'] as const,
    bestsellers: () => [...productKeys.all, 'bestsellers'] as const,
};

/**
 * Hook to fetch products with optional filters
 * @param params Query parameters for filtering/sorting
 */
export function useProducts(params: ProductQueryParams = {}) {
    return useQuery({
        queryKey: productKeys.list(params),
        queryFn: () => ProductsAPI.getProducts(params),

        // Cache for 24 hours
        gcTime: 1000 * 60 * 60 * 24,

        // Data is fresh for 30 minutes
        staleTime: 1000 * 60 * 30,

        // Keep previous data while fetching new data (no loading flicker)
        placeholderData: keepPreviousData,
    });
}

/**
 * Hook to fetch a single product by ID
 * @param id Product ID
 * @param enabled Whether to fetch (default: true if id is provided)
 */
export function useProduct(id: string, enabled: boolean = true) {
    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => ProductsAPI.getProductById(id),

        // Cache for 24 hours
        gcTime: 1000 * 60 * 60 * 24,

        // Data is fresh for 1 hour (product details change less frequently)
        staleTime: 1000 * 60 * 60,

        // Only fetch if id is provided and enabled is true
        enabled: !!id && enabled,
    });
}

/**
 * Hook for infinite scroll product list
 * @param params Query parameters
 */
export function useInfiniteProducts(params: ProductQueryParams = {}) {
    return useInfiniteQuery({
        queryKey: productKeys.list(params),
        queryFn: ({ pageParam = 1 }) =>
            ProductsAPI.getProducts({ ...params, page: pageParam }),

        // Get next page number
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage;
            return page < totalPages ? page + 1 : undefined;
        },

        // Get previous page number
        getPreviousPageParam: (firstPage) => {
            const { page } = firstPage;
            return page > 1 ? page - 1 : undefined;
        },

        initialPageParam: 1,

        // Cache for 24 hours
        gcTime: 1000 * 60 * 60 * 24,

        // Data is fresh for 15 minutes
        staleTime: 1000 * 60 * 15,
    });
}

/**
 * Hook to search products
 * @param query Search query
 * @param filters Optional filters
 * @param enabled Whether to fetch (default: true if query is not empty)
 */
export function useProductSearch(
    query: string,
    filters?: Omit<ProductQueryParams, 'page' | 'limit'>,
    enabled: boolean = true
) {
    return useQuery({
        queryKey: productKeys.search(query, filters),
        queryFn: () => ProductsAPI.searchProducts(query, filters),

        // Cache for 30 minutes (search results change quickly)
        gcTime: 1000 * 60 * 30,

        // Data is fresh for 5 minutes
        staleTime: 1000 * 60 * 5,

        // Only fetch if query is not empty and enabled is true
        enabled: query.trim().length > 0 && enabled,

        // Keep previous data during search
        placeholderData: keepPreviousData,
    });
}

/**
 * Hook to fetch products by category
 * @param category Category name
 * @param params Additional query parameters
 */
export function useProductsByCategory(
    category: string,
    params: Omit<ProductQueryParams, 'category'> = {}
) {
    return useQuery({
        queryKey: productKeys.category(category),
        queryFn: () => ProductsAPI.getProductsByCategory(category, params),

        // Cache for 24 hours
        gcTime: 1000 * 60 * 60 * 24,

        // Data is fresh for 30 minutes
        staleTime: 1000 * 60 * 30,

        // Only fetch if category is provided
        enabled: !!category,

        placeholderData: keepPreviousData,
    });
}

/**
 * Hook to fetch featured products
 */
export function useFeaturedProducts() {
    return useQuery({
        queryKey: productKeys.featured(),
        queryFn: () => ProductsAPI.getFeaturedProducts(),

        // Cache for 24 hours
        gcTime: 1000 * 60 * 60 * 24,

        // Data is fresh for 1 hour
        staleTime: 1000 * 60 * 60,
    });
}

/**
 * Hook to fetch new arrivals
 */
export function useNewArrivals() {
    return useQuery({
        queryKey: productKeys.newArrivals(),
        queryFn: () => ProductsAPI.getNewArrivals(),

        // Cache for 24 hours
        gcTime: 1000 * 60 * 60 * 24,

        // Data is fresh for 1 hour
        staleTime: 1000 * 60 * 60,
    });
}

/**
 * Hook to fetch bestsellers
 */
export function useBestsellers() {
    return useQuery({
        queryKey: productKeys.bestsellers(),
        queryFn: () => ProductsAPI.getBestsellers(),

        // Cache for 24 hours
        gcTime: 1000 * 60 * 60 * 24,

        // Data is fresh for 2 hours
        staleTime: 1000 * 60 * 120,
    });
}

/**
 * Hook to search suggestions
 * @param query Search query
 * @param enabled Whether to fetch
 */
export function useSearchSuggestions(query: string, enabled: boolean = true) {
    return useQuery({
        queryKey: ['searchSuggestions', query],
        queryFn: () => ProductsAPI.getSearchSuggestions(query),

        // Cache for 1 hour
        gcTime: 1000 * 60 * 60,

        // Data is fresh for 10 minutes
        staleTime: 1000 * 60 * 10,

        // Only fetch if query is at least 2 characters
        enabled: query.trim().length >= 2 && enabled,
    });
}

/**
 * Hook to get popular searches
 */
export function usePopularSearches() {
    return useQuery({
        queryKey: ['popularSearches'],
        queryFn: () => ProductsAPI.getPopularSearches(),

        // Cache for 24 hours
        gcTime: 1000 * 60 * 60 * 24,

        // Data is fresh for 6 hours
        staleTime: 1000 * 60 * 360,
    });
}
