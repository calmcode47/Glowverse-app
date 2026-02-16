/**
 * AR Error Handler
 * 
 * Centralized error handling for AR SDK with user-friendly messages
 * and recovery actions.
 * 
 * @module ErrorHandler
 */

import { Alert, Linking, Platform } from 'react-native';
import type { ARError, ARErrorType } from '../../modules/ar-sdk/types';

/**
 * Error recovery action
 */
interface RecoveryAction {
    label: string;
    action: () => void | Promise<void>;
}

/**
 * AR Error Handler class
 */
export class ARErrorHandler {
    /**
     * Handle AR error with user-friendly message
     * @param error AR error object
     * @param customActions Optional custom recovery actions
     */
    static handle(error: ARError, customActions?: RecoveryAction[]): void {
        console.error('[AR Error]', error);

        const message = this.getUserMessage(error);
        const actions = customActions || this.getDefaultActions(error);

        this.showErrorAlert(error.type, message, actions);
    }

    /**
     * Get user-friendly error message
     */
    private static getUserMessage(error: ARError): string {
        // Use provided message or generate from type
        if (error.message && error.message !== error.type) {
            return error.message;
        }

        return this.getMessageForErrorType(error.type);
    }

    /**
     * Get message for error type
     */
    private static getMessageForErrorType(type: ARErrorType): string {
        const messages: Record<ARErrorType, string> = {
            INITIALIZATION_FAILED:
                'Failed to initialize AR features. Please restart the app and try again.',

            PERMISSION_DENIED:
                'Camera access is required for virtual try-on. Please enable camera permissions in your device settings.',

            UNSUPPORTED_DEVICE:
                'Your device does not support AR features required for virtual try-on. You can still browse products and view static photos.',

            INVALID_LICENSE:
                'AR service is temporarily unavailable. Please try again later.',

            DETECTION_TIMEOUT:
                'Unable to detect your face. Please ensure your face is visible and well-lit.',

            LOW_PERFORMANCE:
                'Performance issues detected. Reducing visual quality for smoother experience.',

            PRODUCT_APPLICATION_FAILED:
                'Failed to apply makeup. Please try selecting the product again.',

            SCREENSHOT_FAILED:
                'Failed to capture photo. Please try again.',

            NETWORK_ERROR:
                'Network connectionissue. Please check your internet connection and try again.',

            UNKNOWN:
                'An unexpected error occurred. Please try again.',
        };

        return messages[type] || messages.UNKNOWN;
    }

    /**
     * Get default recovery actions
     */
    private static getDefaultActions(error: ARError): RecoveryAction[] {
        switch (error.type) {
            case 'PERMISSION_DENIED':
                return [
                    {
                        label: 'Open Settings',
                        action: () => Linking.openSettings(),
                    },
                ];

            case 'UNSUPPORTED_DEVICE':
                return []; // No action needed, just informational

            case 'DETECTION_TIMEOUT':
                return [
                    {
                        label: 'Tips',
                        action: () => this.showDetectionTips(),
                    },
                ];

            case 'LOW_PERFORMANCE':
                return []; // Auto-handled by performance monitor

            case 'NETWORK_ERROR':
                return [
                    {
                        label: 'Retry',
                        action: () => {
                            // Retry logic should be in calling context
                        },
                    },
                ];

            default:
                return [];
        }
    }

    /**
     * Show error alert
     */
    private static showErrorAlert(
        type: ARErrorType,
        message: string,
        actions: RecoveryAction[]
    ): void {
        const buttons = [
            ...actions.map(action => ({
                text: action.label,
                onPress: action.action,
            })),
            {
                text: 'OK',
                style: 'cancel' as const,
            },
        ];

        Alert.alert(
            this.getErrorTitle(type),
            message,
            buttons
        );
    }

    /**
     * Get error alert title
     */
    private static getErrorTitle(type: ARErrorType): string {
        const titles: Record<ARErrorType, string> = {
            INITIALIZATION_FAILED: 'Initialization Error',
            PERMISSION_DENIED: 'Camera Permission Required',
            UNSUPPORTED_DEVICE: 'AR Not Supported',
            INVALID_LICENSE: 'Service Unavailable',
            DETECTION_TIMEOUT: 'Face Not Detected',
            LOW_PERFORMANCE: 'Performance Notice',
            PRODUCT_APPLICATION_FAILED: 'Application Error',
            SCREENSHOT_FAILED: 'Capture Error',
            NETWORK_ERROR: 'Connection Error',
            UNKNOWN: 'Error',
        };

        return titles[type] || 'Error';
    }

    /**
     * Show face detection tips
     */
    private static showDetectionTips(): void {
        Alert.alert(
            'Face Detection Tips',
            '• Position your face in the center of the screen\n' +
            '• Ensure good lighting (avoid backlighting)\n' +
            '• Remove sunglasses or face coverings\n' +
            '• Hold your device at arms length\n' +
            '• Keep your head still for a moment',
            [{ text: 'Got it', style: 'cancel' }]
        );
    }

    /**
     * Create AR error object
     */
    static createError(
        type: ARErrorType,
        message?: string,
        details?: string
    ): ARError {
        return {
            type,
            message: message || this.getMessageForErrorType(type),
            details,
            recoveryAction: this.getRecoveryAction(type),
        };
    }

    /**
     * Get recovery action text
     */
    private static getRecoveryAction(type: ARErrorType): string | undefined {
        const actions: Partial<Record<ARErrorType, string>> = {
            PERMISSION_DENIED: 'Enable camera access in Settings',
            DETECTION_TIMEOUT: 'Adjust lighting and face position',
            NETWORK_ERROR: 'Check internet connection',
            INITIALIZATION_FAILED: 'Restart the app',
            PRODUCT_APPLICATION_FAILED: 'Try selecting the product again',
        };

        return actions[type];
    }

    /**
     * Log error for analytics
     */
    static logError(error: ARError, context?: Record<string, any>): void {
        // TODO: Send to analytics service
        const payload = {
            type: error.type,
            message: error.message,
            details: error.details,
            code: error.code,
            platform: Platform.OS,
            ...context,
        };
        try {
            const { logger } = require('../../utils/logger');
            logger.error('[AR Error Log]', new Error(payload.message));
        } catch {}
    }
}
