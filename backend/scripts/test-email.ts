
import { EmailService } from '../src/services/email.service';
import { config } from '../src/config';

async function main() {
    console.log('🧪 Starting Email Service Test...');

    // Check config
    if (!config.sendgrid.apiKey) {
        console.error('❌ SENDGRID_API_KEY is missing in environment variables');
        process.exit(1);
    }

    console.log('Configuration loaded:', {
        enabled: config.sendgrid.enabled,
        fromEmail: config.sendgrid.fromEmail,
        templates: config.sendgrid.templates
    });

    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    console.log(`Sending test emails to: ${testEmail}`);

    try {
        // 1. Test Welcome Email
        console.log('\n1️⃣ Testing Welcome Email...');
        await EmailService.sendWelcome(testEmail, {
            name: 'Test Tester',
            verificationUrl: 'https://example.com/verify'
        });

        // 2. Test Order Confirmation
        console.log('\n2️⃣ Testing Order Confirmation...');
        await EmailService.sendOrderConfirmation(testEmail, {
            orderId: 'test-order-id',
            orderNumber: 'ORD-TEST-123',
            customerName: 'Test Tester',
            orderDate: new Date().toISOString(),
            items: [
                { name: 'Glow Serum', quantity: 1, price: 29.99 },
                { name: 'Face Mask', quantity: 2, price: 15.00 }
            ],
            subtotal: 59.99,
            shipping: 5.99,
            tax: 6.00,
            total: 71.98,
            shippingAddress: {
                street: '123 Glow St',
                city: 'Beauty City',
                state: 'CA',
                zipCode: '90210'
            }
        });

        // 3. Test Password Reset
        console.log('\n3️⃣ Testing Password Reset...');
        await EmailService.sendPasswordReset(testEmail, {
            name: 'Test Tester',
            resetToken: 'test-reset-token-123',
            expiresIn: '1 hour'
        });

        console.log('\n✅ Test execution completed. Check your logs and inbox!');

    } catch (error) {
        console.error('\n❌ Test failed:', error);
    }
}

main();
