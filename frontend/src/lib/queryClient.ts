/**
 * React Query Client Configuration
 * 
 * Configures React Query with persistence and offline-first behavior.
 * Caches are persisted to AsyncStorage for offline access.
 */

import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Query client with optimized defaults for offline-first behavior
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Cache data for 24 hours
            gcTime: 1000 * 60 * 60 * 24, // Previously called cacheTime

            // Data is fresh for 5 minutes
            staleTime: 1000 * 60 * 5,

            // Retry failed requests
            retry: (failureCount, error: any) => {
                // Don't retry on 4xx errors (client errors)
                if (error?.status >= 400 && error?.status < 500) {
                    return false;
                }
                // Retry up to 3 times for other errors
                return failureCount < 3;
            },

            // Exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Try cache first, then network (offline-first)
            networkMode: 'offlineFirst',

            // Refetch on window focus (when app comes to foreground)
            refetchOnWindowFocus: true,

            // Refetch on reconnect
            refetchOnReconnect: true,

            // Don't refetch on mount if data is fresh
            refetchOnMount: false,
        },
        mutations: {
            // Retry mutations fewer times
            retry: 2,

            // Only run mutations when online
            networkMode: 'online',

            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        },
    },
});

/**
 * AsyncStorage persister for React Query cache
 * Persists query cache to AsyncStorage for offline access
 */
export const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,

    // Throttle writes to avoid excessive AsyncStorage operations
    throttleTime: 1000,

    // Custom key for AsyncStorage
    key: 'REACT_QUERY_OFFLINE_CACHE',

    // Serialize/deserialize functions (optional, defaults to JSON)
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => JSON.parse(data),
});

/**
 * Helper to invalidate all queries
 */
export const invalidateAllQueries = () => {
    return queryClient.invalidateQueries();
};

/**
 * Helper to clear all cached data
 */
export const clearQueryCache = () => {
    queryClient.clear();
    return AsyncStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
};

/**
 * Helper to get cache statistics
 */
export const getQueryCacheStats = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    return {
        totalQueries: queries.length,
        activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
        staleQueries: queries.filter(q => q.isStale()).length,
        fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
    };
};

/**
 * Helper to prefetch query
 */
export const prefetchQuery = <TData = unknown>(
    queryKey: unknown[],
    queryFn: () => Promise<TData>,
    options?: { staleTime?: number }
) => {
    return queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: options?.staleTime,
    });
};

/**
 * Helper to manually set query data (for optimistic updates)
 */
export const setQueryData = <TData = unknown>(
    queryKey: unknown[],
    updater: TData | ((old: TData | undefined) => TData)
) => {
    return queryClient.setQueryData(queryKey, updater);
};

/**
 * Helper to get current query data
 */
export const getQueryData = <TData = unknown>(queryKey: unknown[]): TData | undefined => {
    return queryClient.getQueryData(queryKey);
};
