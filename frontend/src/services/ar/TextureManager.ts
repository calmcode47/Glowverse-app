/**
 * Texture Manager
 * 
 * Manages makeup texture loading, caching, and optimization.
 * Implements LRU cache for efficient memory usage.
 * 
 * @module TextureManager
 */

import { Image } from 'react-native';

/**
 * Texture cache entry
 */
interface TextureCacheEntry {
    uri: string;
    width: number;
    height: number;
    sizeBytes: number;
    lastAccessed: number;
}

/**
 * Texture Manager class
 */
export class TextureManager {
    private cache: Map<string, TextureCacheEntry> = new Map();
    private maxCacheSizeMb: number;
    private currentCacheSizeBytes: number = 0;

    constructor(maxCacheSizeMb: number = 100) {
        this.maxCacheSizeMb = maxCacheSizeMb;
    }

    /**
     * Preload texture
     * @param uri Image URI
     * @returns Promise that resolves with image dimensions
     */
    async preloadTexture(uri: string): Promise<{ width: number; height: number }> {
        // Check cache first
        const cached = this.cache.get(uri);
        if (cached) {
            cached.lastAccessed = Date.now();
            return { width: cached.width, height: cached.height };
        }

        try {
            // Get image size
            const size = await this.getImageSize(uri);

            // Estimate size (rough approximation: width * height * 4 bytes for RGBA)
            const estimatedBytes = size.width * size.height * 4;

            // Ensure cache has space
            await this.ensureCacheSpace(estimatedBytes);

            // Add to cache
            this.cache.set(uri, {
                uri,
                width: size.width,
                height: size.height,
                sizeBytes: estimatedBytes,
                lastAccessed: Date.now(),
            });

            this.currentCacheSizeBytes += estimatedBytes;

            console.log(`[TextureManager] Cached ${uri} (${this.formatBytes(estimatedBytes)})`);

            return size;
        } catch (error) {
            console.error('[TextureManager] Failed to preload texture:', error);
            throw error;
        }
    }

    /**
     * Preload multiple textures
     * @param uris Array of image URIs
     */
    async preloadBatch(uris: string[]): Promise<void> {
        const promises = uris.map(uri => this.preloadTexture(uri).catch(err => {
            console.warn(`[TextureManager] Failed to preload ${uri}:`, err);
        }));

        await Promise.all(promises);
    }

    /**
     * Clear texture from cache
     * @param uri Image URI
     */
    clearTexture(uri: string): void {
        const entry = this.cache.get(uri);
        if (!entry) return;

        this.cache.delete(uri);
        this.currentCacheSizeBytes -= entry.sizeBytes;

        console.log(`[TextureManager] Cleared ${uri}`);
    }

    /**
     * Clear all textures
     */
    clearAll(): void {
        this.cache.clear();
        this.currentCacheSizeBytes = 0;
        console.log('[TextureManager] Cleared all textures');
    }

    /**
     * Get texture info
     * @param uri Image URI
     */
    getTextureInfo(uri: string): TextureCacheEntry | null {
        return this.cache.get(uri) || null;
    }

    /**
     * Check if texture is cached
     */
    isCached(uri: string): boolean {
        return this.cache.has(uri);
    }

    /**
     * Get current cache size in MB
     */
    getCacheSizeMb(): number {
        return this.currentCacheSizeBytes / (1024 * 1024);
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        count: number;
        sizeMb: number;
        maxSizeMb: number;
        utilizationPercent: number;
    } {
        const sizeMb = this.getCacheSizeMb();

        return {
            count: this.cache.size,
            sizeMb,
            maxSizeMb: this.maxCacheSizeMb,
            utilizationPercent: (sizeMb / this.maxCacheSizeMb) * 100,
        };
    }

    /**
     * Ensure cache has space (LRU eviction)
     */
    private async ensureCacheSpace(requiredBytes: number): Promise<void> {
        const maxBytes = this.maxCacheSizeMb * 1024 * 1024;

        // Check if we need to free space
        while (this.currentCacheSizeBytes + requiredBytes > maxBytes && this.cache.size > 0) {
            // Find least recently used texture
            let lruUri: string | null = null;
            let oldestAccess = Infinity;

            this.cache.forEach((entry, uri) => {
                if (entry.lastAccessed < oldestAccess) {
                    oldestAccess = entry.lastAccessed;
                    lruUri = uri;
                }
            });

            // Remove LRU texture
            if (lruUri) {
                console.log(`[TextureManager] Evicting LRU texture: ${lruUri}`);
                this.clearTexture(lruUri);
            }
        }
    }

    /**
     * Get image size
     */
    private getImageSize(uri: string): Promise<{ width: number; height: number }> {
        return new Promise((resolve, reject) => {
            Image.getSize(
                uri,
                (width, height) => resolve({ width, height }),
                (error) => reject(error)
            );
        });
    }

    /**
     * Format bytes to human-readable string
     */
    private formatBytes(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
}
