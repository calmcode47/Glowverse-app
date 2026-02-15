/**
 * Sharing Service
 * 
 * Handles sharing AR screenshots to social media and other platforms.
 * 
 * @module SharingService
 */

import Share from 'react-native-share';
import type { MakeupProduct } from '../../modules/ar-sdk/types';

/**
 * Share options
 */
interface ShareOptions {
    /** Image URI to share */
    imageUri: string;

    /** Products used in the look */
    products?: MakeupProduct[];

    /** Custom message */
    message?: string;

    /** Deep link URL */
    url?: string;

    /** Social platform (optional, for direct sharing) */
    social?: 'instagram' | 'facebook' | 'twitter' | 'whatsapp';
}

/**
 * Sharing Service class
 */
export class SharingService {
    /**
     * Share screenshot
     * @param options Share options
     */
    static async shareScreenshot(options: ShareOptions): Promise<void> {
        try {
            const message = options.message || this.generateMessage(options.products);
            const url = options.url || 'https://glowverse.com/app';

            const shareOptions = {
                title: 'My Glowverse Try-On',
                message: `${message}\n\n${url}`,
                url: options.imageUri,
                type: 'image/jpeg',
                // Social platform specific
                ...(options.social && this.getSocialOptions(options.social)),
            };

            console.log('[Sharing] Sharing with options:', shareOptions);

            const result = await Share.open(shareOptions);

            console.log('[Sharing] Share result:', result);

            // TODO: Track share event in analytics
        } catch (error: any) {
            if (error?.message !== 'User did not share') {
                console.error('[Sharing] Share failed:', error);
                throw error;
            }
        }
    }

    /**
     * Share to Instagram Stories
     * @param imageUri Image URI
     */
    static async shareToInstagramStory(imageUri: string): Promise<void> {
        try {
            await Share.shareSingle({
                social: Share.Social.INSTAGRAM_STORIES as any,
                backgroundImage: imageUri,
                appId: 'YOUR_FACEBOOK_APP_ID', // TODO: Add to env
            });
        } catch (error) {
            console.error('[Sharing] Instagram share failed:', error);
            throw error;
        }
    }

    /**
     * Share to Facebook
     * @param imageUri Image URI
     * @param message Custom message
     */
    static async shareToFacebook(imageUri: string, message?: string): Promise<void> {
        try {
            await Share.shareSingle({
                social: Share.Social.FACEBOOK as any,
                url: imageUri,
                message: message || 'Check out my new look on Glowverse!',
            });
        } catch (error) {
            console.error('[Sharing] Facebook share failed:', error);
            throw error;
        }
    }

    /**
     * Generate share message from products
     */
    private static generateMessage(products?: MakeupProduct[]): string {
        if (!products || products.length === 0) {
            return 'Check out my virtual makeup try-on on Glowverse! 💄✨';
        }

        const productNames = products.map(p => `${p.brand ? p.brand + ' ' : ''}${p.name}`);
        const productList = productNames.join(', ');

        return `Trying on ${productList} with Glowverse! 💄✨`;
    }

    /**
     * Get social platform specific options
     */
    private static getSocialOptions(social: string): object {
        const socialMap: Record<string, any> = {
            instagram: { social: Share.Social.INSTAGRAM },
            facebook: { social: Share.Social.FACEBOOK },
            twitter: { social: Share.Social.TWITTER },
            whatsapp: { social: Share.Social.WHATSAPP },
        };

        return socialMap[social] || {};
    }
}
