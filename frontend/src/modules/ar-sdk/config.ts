/**
 * AR SDK Configuration Helper
 * 
 * Loads AR SDK configuration from environment variables and app constants
 */

import Constants from 'expo-constants';
import type { ARConfig, ARSDKVendor } from './types';

/**
 * Get AR SDK configuration from environment
 * @returns AR configuration object
 */
export function getARConfig(): ARConfig {
    const extra = Constants.expoConfig?.extra || {};
    const arSdk = extra.arSdk || {};

    // Parse vendor
    const vendor: ARSDKVendor = arSdk.vendor || 'mock';

    // Parse numeric values with defaults
    const targetFps = parseInt(arSdk.targetFps || '30', 10);
    const maxTextureCacheSizeMb = parseInt(arSdk.maxTextureCacheSizeMb || '100', 10);
    const enableGpuAcceleration = arSdk.enableGpuAcceleration === 'true' || arSdk.enableGpuAcceleration === true;

    const config: ARConfig = {
        vendor,
        apiKey: arSdk.apiKey,
        licenseKey: arSdk.licenseKey,
        apiUrl: arSdk.apiUrl,
        targetFps,
        enableGpuAcceleration,
        maxTextureCacheSizeMb,
    };

    // Log configuration (without sensitive keys)
    if (__DEV__) {
        console.log('[ARSDK Config]', {
            vendor: config.vendor,
            targetFps: config.targetFps,
            enableGpuAcceleration: config.enableGpuAcceleration,
            apiUrl: config.apiUrl,
            hasApiKey: !!config.apiKey,
            hasLicenseKey: !!config.licenseKey,
        });
    }

    return config;
}

/**
 * Check if AR SDK is enabled
 * @returns true if AR SDK is enabled in configuration
 */
export function isAREnabled(): boolean {
    const extra = Constants.expoConfig?.extra || {};
    const arSdk = extra.arSdk || {};
    return arSdk.enabled === 'true' || arSdk.enabled === true;
}

/**
 * Get vendor display name
 * @param vendor SDK vendor
 * @returns Human-readable vendor name
 */
export function getVendorName(vendor: ARSDKVendor): string {
    const vendorNames: Record<ARSDKVendor, string> = {
        perfectcorp: 'PerfectCorp YouCam',
        banuba: 'Banuba Face AR',
        deepar: 'DeepAR',
        modiface: 'ModiFace',
        mock: 'Mock SDK (Development)',
    };

    return vendorNames[vendor] || vendor;
}

/**
 * Validate AR configuration
 * @param config AR configuration
 * @returns Validation errors (empty array if valid)
 */
export function validateARConfig(config: ARConfig): string[] {
    const errors: string[] = [];

    if (!config.vendor) {
        errors.push('AR SDK vendor is not configured');
    }

    if (config.vendor !== 'mock') {
        if (!config.apiKey && !config.licenseKey) {
            errors.push('AR SDK requires either apiKey or licenseKey for production use');
        }
    }

    if (config.targetFps && (config.targetFps < 15 || config.targetFps > 60)) {
        errors.push('Target FPS must be between 15 and 60');
    }

    if (config.maxTextureCacheSizeMb && config.maxTextureCacheSizeMb < 10) {
        errors.push('Texture cache size must be at least 10MB');
    }

    return errors;
}
