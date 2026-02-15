/**
 * Deep Link Test Data Generator
 * 
 * Utilities for generating test deep links.
 */

interface TestLink {
    name: string;
    url: string;
    type: string;
    expectedScreen: string;
    expectedParams: Record<string, any>;
    requiresAuth: boolean;
}

/**
 * Generate test deep links for all scenarios
 */
export function generateTestLinks(): TestLink[] {
    const baseUrl = 'https://glowverse.app';

    return [
        // Product Links
        {
            name: 'Valid Product',
            url: `${baseUrl}/products/prod_test_001`,
            type: 'product',
            expectedScreen: 'ProductDetail',
            expectedParams: { productId: 'prod_test_001' },
            requiresAuth: false,
        },
        {
            name: 'Invalid Product',
            url: `${baseUrl}/products/invalid_999`,
            type: 'product',
            expectedScreen: 'InvalidLink',
            expectedParams: { error: 'Product not found' },
            requiresAuth: false,
        },

        // Referral Links
        {
            name: 'Valid Referral',
            url: `${baseUrl}/refer/FRIEND2024`,
            type: 'referral',
            expectedScreen: 'ReferralSignup',
            expectedParams: { referralCode: 'FRIEND2024' },
            requiresAuth: false,
        },
        {
            name: 'Expired Referral',
            url: `${baseUrl}/refer/EXPIRED2023`,
            type: 'referral',
            expectedScreen: 'LinkExpired',
            expectedParams: { type: 'referral' },
            requiresAuth: false,
        },

        // Order Links
        {
            name: 'Valid Order (Authenticated)',
            url: `${baseUrl}/orders/order_test_001/track`,
            type: 'order',
            expectedScreen: 'OrderTracking',
            expectedParams: { orderId: 'order_test_001' },
            requiresAuth: true,
        },
        {
            name: 'Valid Order (Unauthenticated)',
            url: `${baseUrl}/orders/order_test_002/track`,
            type: 'order',
            expectedScreen: 'Login',
            expectedParams: { returnUrl: `${baseUrl}/orders/order_test_002/track` },
            requiresAuth: true,
        },

        // Password Reset Links
        {
            name: 'Valid Reset Token',
            url: `${baseUrl}/reset-password?token=reset_test_valid`,
            type: 'reset_password',
            expectedScreen: 'ResetPassword',
            expectedParams: { token: 'reset_test_valid' },
            requiresAuth: false,
        },
        {
            name: 'Expired Reset Token',
            url: `${baseUrl}/reset-password?token=reset_test_expired`,
            type: 'reset_password',
            expectedScreen: 'LinkExpired',
            expectedParams: { type: 'reset' },
            requiresAuth: false,
        },

        // AR Share Links
        {
            name: 'Valid AR Session',
            url: `${baseUrl}/ar-share/session_test_001`,
            type: 'ar_share',
            expectedScreen: 'ARShare',
            expectedParams: { sessionId: 'session_test_001' },
            requiresAuth: false,
        },

        // Shared Cart Links
        {
            name: 'Valid Shared Cart',
            url: `${baseUrl}/cart/shared/cart_test_001`,
            type: 'shared_cart',
            expectedScreen: 'SharedCart',
            expectedParams: { cartId: 'cart_test_001' },
            requiresAuth: true,
        },

        // Promotion Links
        {
            name: 'Valid Promotion',
            url: `${baseUrl}/promotions/SUMMER2024`,
            type: 'promotion',
            expectedScreen: 'Promotions',
            expectedParams: { code: 'SUMMER2024' },
            requiresAuth: false,
        },

        // Notification Links
        {
            name: 'Valid Notification',
            url: `${baseUrl}/notifications/notif_test_001`,
            type: 'notification',
            expectedScreen: 'Notifications',
            expectedParams: { notificationId: 'notif_test_001' },
            requiresAuth: true,
        },
    ];
}

/**
 * Generate QR codes for test links (conceptual)
 */
export function generateQRCodes(links: TestLink[]): void {
    console.log('=== QR Code Generation ===');
    console.log('Use https://www.qr-code-generator.com/ to create QR codes for testing:');
    console.log('');

    links.forEach(link => {
        console.log(`${link.name}:`);
        console.log(`  ${link.url}`);
        console.log('');
    });
}

/**
 * Generate email template with test links
 */
export function generateEmailTemplate(links: TestLink[]): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Deep Link Testing</title>
</head>
<body>
  <h1>Glowverse Deep Link Testing</h1>
  <p>Tap the links below to test deep linking:</p>
  
  <h2>Product Links</h2>
  ${links
            .filter(l => l.type === 'product')
            .map(l => `<p><a href="${l.url}">${l.name}</a></p>`)
            .join('')}
  
  <h2>Referral Links</h2>
  ${links
            .filter(l => l.type === 'referral')
            .map(l => `<p><a href="${l.url}">${l.name}</a></p>`)
            .join('')}
  
  <h2>Order Tracking</h2>
  ${links
            .filter(l => l.type === 'order')
            .map(l => `<p><a href="${l.url}">${l.name}</a></p>`)
            .join('')}
  
  <h2>Password Reset</h2>
  ${links
            .filter(l => l.type === 'reset_password')
            .map(l => `<p><a href="${l.url}">${l.name}</a></p>`)
            .join('')}
  
  <h2>Other</h2>
  ${links
            .filter(l => !['product', 'referral', 'order', 'reset_password'].includes(l.type))
            .map(l => `<p><a href="${l.url}">${l.name}</a></p>`)
            .join('')}
</body>
</html>
  `.trim();
}

/**
 * Print test links to console
 */
export function printTestLinks(): void {
    const links = generateTestLinks();

    console.log('=== Deep Link Test Cases ===\n');

    links.forEach((link, index) => {
        console.log(`[${index + 1}] ${link.name}`);
        console.log(`    URL: ${link.url}`);
        console.log(`    Type: ${link.type}`);
        console.log(`    Expected Screen: ${link.expectedScreen}`);
        console.log(`    Requires Auth: ${link.requiresAuth}`);
        console.log('');
    });

    console.log('=== Email Template ===\n');
    console.log(generateEmailTemplate(links));
}
