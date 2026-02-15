/**
 * Unified Storage Service
 * 
 * Provides a single interface for all storage operations with automatic tier selection.
 * Uses MMKV for hot data, AsyncStorage for warm data, and file system for cold data.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    cartStorage,
    productStorage,
    userStorage,
    wishlistStorage,
    setMMKVObject,
    getMMKVObject,
    deleteMMKVKey,
} from '../../lib/mmkvStorage';

export interface StorageOptions {
    /** Force specific storage tier */
    tier?: 'hot' | 'warm' | 'cold';

    /** TTL in seconds (0 = no expiry) */
    ttl?: number;
}

interface StorageMetadata {
    expiresAt?: number;
    createdAt: number;
    tier: 'hot' | 'warm' | 'cold';
}

class UnifiedStorageService {
    /**
     * Set a value in storage
     * Automatically selects storage tier based on data size and options
     */
    async set<T = any>(
        key: string,
        value: T,
        options?: StorageOptions
    ): Promise<void> {
        const metadata: StorageMetadata = {
            createdAt: Date.now(),
            expiresAt: options?.ttl ? Date.now() + options.ttl * 1000 : undefined,
            tier: options?.tier || 'warm',
        };

        // Auto-select tier if not specified
        if (!options?.tier) {
            metadata.tier = this.selectTier(key, value);
        }

        const dataWithMeta = {
            value,
            metadata,
        };

        // Store in appropriate tier
        if (metadata.tier === 'hot') {
            await this.setHot(key, dataWithMeta);
        } else if (metadata.tier === 'warm') {
            await this.setWarm(key, dataWithMeta);
        } else {
            await this.setCold(key, dataWithMeta);
        }
    }

    /**
     * Get a value from storage
     * Checks all tiers and handles expiration
     */
    async get<T = any>(key: string): Promise<T | null> {
        // Try hot storage first
        let data = await this.getHot<T>(key);
        if (data) return data;

        // Try warm storage
        data = await this.getWarm<T>(key);
        if (data) return data;

        // Try cold storage
        data = await this.getCold<T>(key);
        return data;
    }

    /**
     * Remove a value from all storage tiers
     */
    async remove(key: string): Promise<void> {
        // Try to remove from all tiers
        await Promise.all([
            this.removeHot(key),
            this.removeWarm(key),
            this.removeCold(key),
        ]);
    }

    /**
     * Check if key exists in any tier
     */
    async has(key: string): Promise<boolean> {
        const value = await this.get(key);
        return value !== null;
    }

    /**
     * Set in hot storage (MMKV)
     */
    private async setHot(key: string, data: any): Promise<void> {
        const storage = this.getMMKVStorage(key);
        setMMKVObject(storage, key, data);
    }

    /**
     * Get from hot storage (MMKV)
     */
    private async getHot<T>(key: string): Promise<T | null> {
        const storage = this.getMMKVStorage(key);
        const data = getMMKVObject<any>(storage, key);

        if (!data) return null;

        // Check expiration
        if (data.metadata?.expiresAt && Date.now() > data.metadata.expiresAt) {
            deleteMMKVKey(storage, key);
            return null;
        }

        return data.value as T;
    }

    /**
     * Remove from hot storage (MMKV)
     */
    private async removeHot(key: string): Promise<void> {
        const storage = this.getMMKVStorage(key);
        deleteMMKVKey(storage, key);
    }

    /**
     * Set in warm storage (AsyncStorage)
     */
    private async setWarm(key: string, data: any): Promise<void> {
        await AsyncStorage.setItem(key, JSON.stringify(data));
    }

    /**
     * Get from warm storage (AsyncStorage)
     */
    private async getWarm<T>(key: string): Promise<T | null> {
        try {
            const raw = await AsyncStorage.getItem(key);
            if (!raw) return null;

            const data = JSON.parse(raw);

            // Check expiration
            if (data.metadata?.expiresAt && Date.now() > data.metadata.expiresAt) {
                await AsyncStorage.removeItem(key);
                return null;
            }

            return data.value as T;
        } catch (error) {
            console.error('[Storage] Error getting from warm storage:', error);
            return null;
        }
    }

    /**
     * Remove from warm storage (AsyncStorage)
     */
    private async removeWarm(key: string): Promise<void> {
        await AsyncStorage.removeItem(key);
    }

    /**
     * Set in cold storage (File System)
     * TODO: Implement file system storage for large data
     */
    private async setCold(key: string, data: any): Promise<void> {
        // For now, use AsyncStorage
        await this.setWarm(key, data);
    }

    /**
     * Get from cold storage (File System)
     */
    private async getCold<T>(key: string): Promise<T | null> {
        // For now, use AsyncStorage
        return this.getWarm<T>(key);
    }

    /**
     * Remove from cold storage (File System)
     */
    private async removeCold(key: string): Promise<void> {
        await this.removeWarm(key);
    }

    /**
     * Select appropriate storage tier based on key and value
     */
    private selectTier(key: string, value: any): 'hot' | 'warm' | 'cold' {
        // Cart and wishlist data = hot (MMKV)
        if (key.startsWith('cart_') || key.startsWith('wishlist_')) {
            return 'hot';
        }

        // User data = hot (MMKV)
        if (key.startsWith('user_')) {
            return 'hot';
        }

        // Product data = hot (MMKV) for better performance
        if (key.startsWith('product_')) {
            return 'hot';
        }

        // Check size - large data goes to warm/cold
        const size = JSON.stringify(value).length;
        if (size > 100 * 1024) { // > 100KB
            return 'cold';
        } else if (size > 10 * 1024) { // > 10KB
            return 'warm';
        }

        // Default to warm
        return 'warm';
    }

    /**
     * Get appropriate MMKV storage instance for key
     */
    private getMMKVStorage(key: string) {
        if (key.startsWith('cart_')) return cartStorage;
        if (key.startsWith('wishlist_')) return wishlistStorage;
        if (key.startsWith('user_')) return userStorage;
        if (key.startsWith('product_')) return productStorage;

        // Default to product storage
        return productStorage;
    }

    /**
     * Clear all storage (caution!)
     */
    async clearAll(): Promise<void> {
        await AsyncStorage.clear();
        cartStorage.clearAll();
        productStorage.clearAll();
        userStorage.clearAll();
        wishlistStorage.clearAll();
    }
}

/**
 * Singleton instance
 */
export const storage = new UnifiedStorageService();
