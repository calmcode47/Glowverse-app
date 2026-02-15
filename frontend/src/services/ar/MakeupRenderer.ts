/**
 * Makeup Renderer
 * 
 * Core rendering engine that manages makeup product application,
 * layer management, and intensity control.
 * 
 * @module MakeupRenderer
 */

import { ARSDKModule } from '../../modules/ar-sdk';
import type {
    MakeupProduct,
    MakeupCategory,
    MakeupApplicationSettings,
} from '../../modules/ar-sdk/types';

/**
 * Active makeup layer
 */
interface MakeupLayer {
    product: MakeupProduct;
    intensity: number;
    appliedAt: number;
}

/**
 * Makeup Renderer class
 */
export class MakeupRenderer {
    private activeLayers: Map<MakeupCategory, MakeupLayer> = new Map();
    private isRendering = false;

    /**
     * Start rendering engine
     */
    async start(): Promise<void> {
        if (this.isRendering) return;

        this.isRendering = true;
        console.log('[MakeupRenderer] Started');
    }

    /**
     * Stop rendering engine
     */
    async stop(): Promise<void> {
        if (!this.isRendering) return;

        await this.clearAll();
        this.isRendering = false;
        console.log('[MakeupRenderer] Stopped');
    }

    /**
     * Apply makeup product
     * @param product Makeup product to apply
     * @param intensity Intensity (0-1)
     */
    async applyProduct(product: MakeupProduct, intensity: number = 0.8): Promise<void> {
        if (!this.isRendering) {
            throw new Error('Renderer not started');
        }

        console.log(`[MakeupRenderer] Applying ${product.category}: ${product.name} at ${intensity * 100}%`);

        try {
            // Apply through AR SDK
            await ARSDKModule.applyMakeup(product, intensity);

            // Track active layer
            this.activeLayers.set(product.category, {
                product,
                intensity,
                appliedAt: Date.now(),
            });
        } catch (error) {
            console.error('[MakeupRenderer] Failed to apply product:', error);
            throw error;
        }
    }

    /**
     * Remove makeup for a category
     * @param category Makeup category to remove
     */
    async removeProduct(category: MakeupCategory): Promise<void> {
        if (!this.activeLayers.has(category)) {
            return; // Nothing to remove
        }

        console.log(`[MakeupRenderer] Removing ${category}`);

        try {
            await ARSDKModule.removeMakeup(category);
            this.activeLayers.delete(category);
        } catch (error) {
            console.error(`[MakeupRenderer] Failed to remove ${category}:`, error);
            throw error;
        }
    }

    /**
     * Update intensity for a category
     * @param category Makeup category
     * @param intensity New intensity (0-1)
     */
    async updateIntensity(category: MakeupCategory, intensity: number): Promise<void> {
        const layer = this.activeLayers.get(category);
        if (!layer) {
            console.warn(`[MakeupRenderer] No ${category} applied to update intensity`);
            return;
        }

        console.log(`[MakeupRenderer] Updating ${category} intensity to ${intensity * 100}%`);

        try {
            await ARSDKModule.updateIntensity(category, intensity);

            // Update layer
            layer.intensity = intensity;
            this.activeLayers.set(category, layer);
        } catch (error) {
            console.error(`[MakeupRenderer] Failed to update ${category} intensity:`, error);
            throw error;
        }
    }

    /**
     * Clear all makeup
     */
    async clearAll(): Promise<void> {
        console.log('[MakeupRenderer] Clearing all makeup');

        try {
            await ARSDKModule.clearAll();
            this.activeLayers.clear();
        } catch (error) {
            console.error('[MakeupRenderer] Failed to clear makeup:', error);
            throw error;
        }
    }

    /**
     * Get active product for category
     * @param category Makeup category
     * @returns Active product or null
     */
    getActiveProduct(category: MakeupCategory): MakeupProduct | null {
        return this.activeLayers.get(category)?.product || null;
    }

    /**
     * Get intensity for category
     * @param category Makeup category
     * @returns Current intensity or 0
     */
    getIntensity(category: MakeupCategory): number {
        return this.activeLayers.get(category)?.intensity || 0;
    }

    /**
     * Check if category has active makeup
     * @param category Makeup category
     */
    hasActiveProduct(category: MakeupCategory): boolean {
        return this.activeLayers.has(category);
    }

    /**
     * Get all active products
     */
    getActiveProducts(): Map<MakeupCategory, MakeupProduct> {
        const products = new Map<MakeupCategory, MakeupProduct>();

        this.activeLayers.forEach((layer, category) => {
            products.set(category, layer.product);
        });

        return products;
    }

    /**
     * Get total number of active layers
     */
    getActiveLayerCount(): number {
        return this.activeLayers.size;
    }

    /**
     * Get active categories
     */
    getActiveCategories(): MakeupCategory[] {
        return Array.from(this.activeLayers.keys());
    }

    /**
     * Check if rendering
     */
    get isActive(): boolean {
        return this.isRendering;
    }
}
