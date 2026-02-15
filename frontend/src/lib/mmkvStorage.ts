/**
 * MMKV Storage Service
 * 
 * High-performance key-value storage using MMKV (10-100x faster than AsyncStorage).
 * Used for hot data that needs frequent read/write access.
 */

import type { MMKV as MMKVType } from 'react-native-mmkv';
const { MMKV } = require('react-native-mmkv');

// Create MMKV instances for different data domains
// Each instance has its own storage file for better organization and performance

/**
 * Cart storage - shopping cart data
 */
export const cartStorage = new MMKV({
    id: 'cart',
    encryptionKey: 'glowverse_cart_key_2024', // Optional encryption
});

/**
 * Product cache storage - cached product data
 */
export const productStorage = new MMKV({
    id: 'products',
});

/**
 * User data storage - user preferences, profile
 */
export const userStorage = new MMKV({
    id: 'user',
    encryptionKey: 'glowverse_user_key_2024',
});

/**
 * Cache metadata storage - tracks cache stats, LRU info
 */
export const cacheMetadataStorage = new MMKV({
    id: 'cache_metadata',
});

/**
 * Wishlist storage - favorited products
 */
export const wishlistStorage = new MMKV({
    id: 'wishlist',
});

/**
 * MMKV storage adapter for React Query persister
 * Can be used as an alternative to AsyncStorage for better performance
 */
export const mmkvStorageAdapter = {
    setItem: (key: string, value: string) => {
        productStorage.set(key, value);
    },
    getItem: (key: string) => {
        const value = productStorage.getString(key);
        return value ?? null;
    },
    removeItem: (key: string) => {
        productStorage.delete(key);
    },
};

/**
 * Helper to store JSON data in MMKV
 */
export function setMMKVObject<T = any>(
    storage: MMKVType,
    key: string,
    value: T
): void {
    const json = JSON.stringify(value);
    storage.set(key, json);
}

/**
 * Helper to retrieve JSON data from MMKV
 */
export function getMMKVObject<T = any>(
    storage: MMKVType,
    key: string
): T | null {
    const json = storage.getString(key);
    if (!json) return null;

    try {
        return JSON.parse(json) as T;
    } catch (error) {
        console.error(`[MMKV] Failed to parse JSON for key: ${key}`, error);
        return null;
    }
}

/**
 * Helper to check if key exists
 */
export function hasMMKVKey(storage: MMKVType, key: string): boolean {
    return (storage as any).contains(key);
}

/**
 * Helper to delete key
 */
export function deleteMMKVKey(storage: MMKVType, key: string): void {
    (storage as any).delete(key);
}

/**
 * Helper to clear all data in a storage instance
 */
export function clearMMKVStorage(storage: MMKVType): void {
    storage.clearAll();
}

/**
 * Get all keys in a storage instance
 */
export function getAllMMKVKeys(storage: MMKVType): string[] {
    return storage.getAllKeys();
}

/**
 * Get storage size statistics
 */
export function getMMKVStats() {
    return {
        cart: {
            keys: cartStorage.getAllKeys().length,
            // Size not directly available, but we can estimate
        },
        products: {
            keys: productStorage.getAllKeys().length,
        },
        user: {
            keys: userStorage.getAllKeys().length,
        },
        wishlist: {
            keys: wishlistStorage.getAllKeys().length,
        },
        cacheMetadata: {
            keys: cacheMetadataStorage.getAllKeys().length,
        },
    };
}

/**
 * Clear all MMKV storage (caution!)
 */
export function clearAllMMKVStorage(): void {
    cartStorage.clearAll();
    productStorage.clearAll();
    userStorage.clearAll();
    wishlistStorage.clearAll();
    cacheMetadataStorage.clearAll();
}
