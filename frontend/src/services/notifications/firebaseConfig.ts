import messaging from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import * as notificationsApi from '../api/notifications.api';
import { deepLinkingService } from '../deepLinking.service';

class NotificationService {
    /**
     * Initialize notification service
     * Call this when app starts
     */
    async initialize() {
        // Request permission to show notifications
        const permission = await this.requestPermission();

        if (permission) {
            // Get device token
            const token = await this.getDeviceToken();

            if (token) {
                // Send token to backend
                await this.registerDeviceToken(token);
            }

            // Listen for incoming notifications
            this.setupNotificationListeners();
        }
    }

    /**
     * Request permission from user
     */
    async requestPermission(): Promise<boolean> {
        const authStatus = await messaging().requestPermission();

        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Notification permission granted');
        } else {
            console.log('Notification permission denied');
        }

        return enabled;
    }

    /**
     * Get FCM device token
     */
    async getDeviceToken(): Promise<string | null> {
        try {
            const token = await messaging().getToken();
            console.log('Device token:', token);
            return token;
        } catch (error) {
            console.error('Failed to get device token:', error);
            return null;
        }
    }

    /**
     * Send device token to backend
     */
    async registerDeviceToken(token: string) {
        try {
            await notificationsApi.registerDevice({
                deviceToken: token,
                platform: Platform.OS,
            });
            console.log('Device registered successfully');
        } catch (error) {
            console.error('Failed to register device:', error);
        }
    }

    private messageListener?: () => void;

    /**
     * Setup listeners for notifications
     */
    setupNotificationListeners() {
        // Notification received while app is in FOREGROUND
        this.messageListener = messaging().onMessage(async (remoteMessage) => {
            console.log('Notification received (foreground):', remoteMessage);

            // Show in-app notification banner
            this.displayInAppNotification(remoteMessage);

            if (this.onMessageCallback) {
                this.onMessageCallback(remoteMessage);
            }
        });

        // Notification tapped while app is in BACKGROUND
        messaging().onNotificationOpenedApp((remoteMessage) => {
            console.log('Notification opened (background):', remoteMessage);

            // Navigate to relevant screen
            this.handleNotificationTap(remoteMessage);
        });

        // App was CLOSED and opened by tapping notification
        messaging()
            .getInitialNotification()
            .then((remoteMessage) => {
                if (remoteMessage) {
                    console.log('Notification opened (app was closed):', remoteMessage);
                    this.handleNotificationTap(remoteMessage);
                }
            });
    }

    private onMessageCallback?: (message: any) => void;
    private onNotificationTappedCallback?: (message: any) => void;

    handleNotificationReceived(callback: (message: any) => void) {
        this.onMessageCallback = callback;
    }

    handleNotificationTapped(callback: (message: any) => void) {
        this.onNotificationTappedCallback = callback;
    }

    async setBadgeCount(count: number) {
        // Note: FCM doesn't support setting badges directly on Android easily.
        // This is a placeholder or can be implemented with notifee/react-native-push-notification
        console.log('Setting badge count to:', count);
    }

    async clearBadge() {
        console.log('Clearing badge');
    }

    cleanup() {
        if (this.messageListener) {
            this.messageListener();
        }
    }

    /**
     * Display notification banner while app is open
     */
    displayInAppNotification(notification: any) {
        const title = notification.notification?.title || 'New Notification';
        const body = notification.notification?.body || '';

        Alert.alert(
            title,
            body,
            [
                {
                    text: 'View',
                    onPress: () => this.handleNotificationTap(notification),
                },
                {
                    text: 'Dismiss',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    }

    /**
     * Handle when user taps notification
     */
    handleNotificationTap(notification: any) {
        // Get notification type and data
        const data = notification.data || {};
        const { type, orderId, productId, deepLink } = data;

        if (deepLink) {
            deepLinkingService.navigate(deepLink);
            return;
        }

        // Navigate to appropriate screen
        switch (type) {
            case 'order_shipped':
            case 'order_delivered':
                if (orderId) {
                    deepLinkingService.navigate(`glowverse://order/${orderId}`);
                }
                break;

            case 'promo_available':
                deepLinkingService.navigate('glowverse://promo');
                break;

            case 'product_back_in_stock':
                if (productId) {
                    deepLinkingService.navigate(`glowverse://product/${productId}`);
                }
                break;

            default:
                deepLinkingService.navigate('glowverse://notifications');
        }
    }
}

export const notificationService = new NotificationService();
