/**
 * Deep Link Types and Interfaces
 */

export interface DeepLinkRoute {
    screen: string;
    params?: Record<string, any>;
}

export interface DeepLinkResult {
    success: boolean;
    action?: 'navigate' | 'login' | 'error';
    screen?: string;
    params?: Record<string, any>;
    error?: string;
}

export interface DeepLinkAnalytics {
    linkUrl: string;
    linkType: DeepLinkType;
    source?: DeepLinkSource;
    timestamp: number;
    userId?: string;
    conversionComplete?: boolean;
}

export type DeepLinkType =
    | 'product'
    | 'referral'
    | 'order'
    | 'reset_password'
    | 'ar_share'
    | 'shared_cart'
    | 'promotion'
    | 'notification'
    | 'unknown';

export type DeepLinkSource =
    | 'email'
    | 'sms'
    | 'social'
    | 'qr'
    | 'browser'
    | 'unknown';

export interface ParsedDeepLink {
    type: DeepLinkType;
    path: string;
    params: Record<string, any>;
    queryParams: Record<string, any>;
}
