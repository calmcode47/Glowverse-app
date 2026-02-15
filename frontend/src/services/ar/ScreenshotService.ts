/**
 * Screenshot Service
 * 
 * Handles capturing screenshots of AR view with optional watermark,
 * saving to gallery, and uploading to backend.
 * 
 * @module ScreenshotService
 */

import { Platform, PermissionsAndroid } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { ARSDKModule } from '../../modules/ar-sdk';
import type { ScreenshotOptions, ScreenshotResult } from '../../modules/ar-sdk/types';
import * as TryOnAPI from '../api/tryon.api';

/**
 * Screenshot Service class
 */
export class ScreenshotService {
    /**
     * Capture screenshot
     * @param options Screenshot options
     * @returns Screenshot result
     */
    static async capture(options: ScreenshotOptions = {}): Promise<ScreenshotResult> {
        const defaultOptions: ScreenshotOptions = {
            quality: 90,
            format: 'jpeg',
            watermark: false,
            saveToGallery: true,
            ...options,
        };

        try {
            console.log('[Screenshot] Capturing with options:', defaultOptions);

            // Capture via AR SDK
            const result = await ARSDKModule.captureScreenshot(defaultOptions);

            // Save to gallery if requested
            if (defaultOptions.saveToGallery) {
                await this.saveToGallery(result.uri);
            }

            console.log('[Screenshot] Captured successfully:', result.uri);

            return result;
        } catch (error) {
            console.error('[Screenshot] Capture failed:', error);
            throw error;
        }
    }

    /**
     * Save screenshot to device gallery
     * @param uri Image URI
     */
    static async saveToGallery(uri: string): Promise<void> {
        try {
            // Request permissions
            const hasPermission = await this.requestGalleryPermissions();
            if (!hasPermission) {
                throw new Error('Gallery permission denied');
            }

            // Save to media library
            const asset = await MediaLibrary.createAssetAsync(uri);
            console.log('[Screenshot] Saved to gallery:', asset.id);
        } catch (error) {
            console.error('[Screenshot] Failed to save to gallery:', error);
            throw error;
        }
    }

    /**
     * Upload screenshot to backend
     * @param uri Image URI
     * @param productId Product ID for try-on
     * @param metadata Additional metadata
     */
    static async uploadToBackend(
        uri: string,
        productId?: string,
        metadata?: Record<string, any>
    ): Promise<{ tryOn: any }> {
        try {
            console.log('[Screenshot] Uploading to backend');

            // Prepare file object
            const filename = uri.split('/').pop() || 'screenshot.jpg';
            const file = {
                uri,
                name: filename,
                type: 'image/jpeg',
            };

            // Create try-on record
            const result = await TryOnAPI.createTryOn(file, {
                type: 'FULL_MAKEUP',
                productId,
                productName: metadata?.productName,
                productBrand: metadata?.productBrand,
                intensity: metadata?.intensity || 80,
            });

            console.log('[Screenshot] Uploaded successfully:', result.tryOn.id);

            return result;
        } catch (error) {
            console.error('[Screenshot] Upload failed:', error);
            throw error;
        }
    }

    /**
     * Request gallery permissions
     */
    private static async requestGalleryPermissions(): Promise<boolean> {
        if (Platform.OS === 'ios') {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            return status === 'granted';
        }

        if (Platform.OS === 'android') {
            // Android 13+ requires READ_MEDIA_IMAGES
            if (Platform.Version >= 33) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }

            // Older Android versions
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }

        return false;
    }

    /**
     * Delete screenshot
     * @param uri Image URI
     */
    static async deleteScreenshot(uri: string): Promise<void> {
        try {
            await FileSystem.deleteAsync(uri, { idempotent: true });
            console.log('[Screenshot] Deleted:', uri);
        } catch (error) {
            console.error('[Screenshot] Failed to delete:', error);
            throw error;
        }
    }
}
