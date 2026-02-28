
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { config } from '../config';
import logger from '../utils/logger';

export interface EmailTemplate {
    to: string | string[];
    subject: string;
    templateId?: string;
    dynamicData?: Record<string, any>;
    html?: string;
    text?: string;
    attachments?: Array<{
        content: string;
        filename: string;
        type?: string;
        disposition?: string;
    }>;
}

export class EmailService {
    private static isConfigured = false;

    /**
     * Initialize SendGrid
     */
    static initialize() {
        if (this.isConfigured) return;

        if (!config.sendgrid.enabled) {
            logger.warn('SendGrid is disabled. Emails will be logged only.');
            return;
        }

        if (!config.sendgrid.apiKey) {
            logger.error('SendGrid API key not configured');
            throw new Error('SendGrid API key is required');
        }

        sgMail.setApiKey(config.sendgrid.apiKey);
        this.isConfigured = true;
        logger.info('✅ SendGrid initialized successfully');
    }

    /**
     * Send email using SendGrid
     */
    static async send(template: EmailTemplate): Promise<boolean> {
        try {
            // Initialize if not already done
            this.initialize();

            // If SendGrid is disabled, log and return
            if (!config.sendgrid.enabled) {
                logger.info('📧 [MOCK] Email would be sent:', {
                    to: template.to,
                    subject: template.subject,
                });
                return true;
            }

            // Prepare email data
            const msg: MailDataRequired = {
                to: template.to,
                from: {
                    email: config.sendgrid.fromEmail,
                    name: config.sendgrid.fromName,
                },
                subject: template.subject,
                ...(template.templateId && {
                    templateId: template.templateId,
                    dynamicTemplateData: template.dynamicData || {},
                }),
                ...(template.html && { html: template.html }),
                ...(template.text && { text: template.text }),
                ...(template.attachments && { attachments: template.attachments }),
            };

            // Send email
            const response = await sgMail.send(msg);

            logger.info('✅ Email sent successfully', {
                to: template.to,
                subject: template.subject,
                messageId: response[0]?.headers?.['x-message-id'],
            });

            return true;
        } catch (error: any) {
            logger.error('❌ Failed to send email', {
                to: template.to,
                subject: template.subject,
                error: error.message,
                code: error.code,
                response: error.response?.body,
            });

            // Don't throw - log and continue
            // This prevents email failures from breaking critical flows
            return false;
        }
    }

    /**
     * Send order confirmation email
     */
    static async sendOrderConfirmation(
        email: string,
        orderData: {
            orderId: string;
            orderNumber: string;
            customerName: string;
            orderDate: string;
            items: Array<{
                name: string;
                quantity: number;
                price: number;
            }>;
            subtotal: number;
            shipping: number;
            tax: number;
            total: number;
            shippingAddress: {
                street: string;
                city: string;
                state: string;
                zipCode: string;
            };
        }
    ): Promise<boolean> {
        return this.send({
            to: email,
            subject: `Order Confirmation - #${orderData.orderNumber}`,
            templateId: config.sendgrid.templates.orderConfirmation,
            dynamicData: {
                customer_name: orderData.customerName,
                order_number: orderData.orderNumber,
                order_date: orderData.orderDate,
                items: orderData.items,
                subtotal: orderData.subtotal.toFixed(2),
                shipping: orderData.shipping.toFixed(2),
                tax: orderData.tax.toFixed(2),
                total: orderData.total.toFixed(2),
                shipping_address: orderData.shippingAddress,
            },
        });
    }

    /**
     * Send order shipped notification
     */
    static async sendOrderShipped(
        email: string,
        orderData: {
            orderNumber: string;
            customerName: string;
            trackingNumber?: string;
            carrier?: string;
            estimatedDelivery?: string;
        }
    ): Promise<boolean> {
        return this.send({
            to: email,
            subject: `Your Order Has Shipped - #${orderData.orderNumber}`,
            templateId: config.sendgrid.templates.orderShipped,
            dynamicData: {
                customer_name: orderData.customerName,
                order_number: orderData.orderNumber,
                tracking_number: orderData.trackingNumber,
                carrier: orderData.carrier,
                estimated_delivery: orderData.estimatedDelivery,
                tracking_url: orderData.trackingNumber
                    ? `https://www.trackingmore.com/${orderData.trackingNumber}`
                    : undefined,
            },
        });
    }

    /**
     * Send password reset email
     */
    static async sendPasswordReset(
        email: string,
        data: {
            name: string;
            resetToken: string;
            expiresIn: string;
        }
    ): Promise<boolean> {
        const resetUrl = `${config.app.frontendUrl}/reset-password?token=${data.resetToken}`;

        return this.send({
            to: email,
            subject: 'Reset Your Glowverse Password',
            templateId: config.sendgrid.templates.passwordReset,
            dynamicData: {
                name: data.name,
                reset_url: resetUrl,
                expires_in: data.expiresIn,
            },
        });
    }

    /**
     * Send welcome email
     */
    static async sendWelcome(
        email: string,
        data: {
            name: string;
            verificationUrl?: string;
        }
    ): Promise<boolean> {
        return this.send({
            to: email,
            subject: 'Welcome to Glowverse! 💄',
            templateId: config.sendgrid.templates.welcome,
            dynamicData: {
                name: data.name,
                verification_url: data.verificationUrl,
                app_download_url: config.app.frontendUrl,
            },
        });
    }

    /**
     * Send promotional email
     */
    static async sendPromotion(
        email: string | string[],
        data: {
            title: string;
            description: string;
            ctaText: string;
            ctaUrl: string;
            imageUrl?: string;
            expiresAt?: string;
        }
    ): Promise<boolean> {
        return this.send({
            to: email,
            subject: data.title,
            templateId: config.sendgrid.templates.promotion,
            dynamicData: {
                title: data.title,
                description: data.description,
                cta_text: data.ctaText,
                cta_url: data.ctaUrl,
                image_url: data.imageUrl,
                expires_at: data.expiresAt,
            },
        });
    }

    /**
     * Send custom email with HTML
     */
    static async sendCustom(
        email: string | string[],
        subject: string,
        html: string,
        text?: string
    ): Promise<boolean> {
        return this.send({
            to: email,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''),
        });
    }

    /**
     * Send bulk emails (with rate limiting)
     */
    static async sendBulk(
        emails: string[],
        template: Omit<EmailTemplate, 'to'>
    ): Promise<{ sent: number; failed: number }> {
        let sent = 0;
        let failed = 0;

        // SendGrid allows 1000 emails per batch
        const BATCH_SIZE = 1000;

        for (let i = 0; i < emails.length; i += BATCH_SIZE) {
            const batch = emails.slice(i, i + BATCH_SIZE);

            try {
                const success = await this.send({
                    ...template,
                    to: batch,
                });

                if (success) {
                    sent += batch.length;
                } else {
                    failed += batch.length;
                }
            } catch (error) {
                logger.error('Bulk email batch failed', { batch, error });
                failed += batch.length;
            }

            // Rate limiting delay between batches
            if (i + BATCH_SIZE < emails.length) {
                await this.delay(1000); // 1 second between batches
            }
        }

        logger.info('Bulk email campaign completed', { sent, failed, total: emails.length });

        return { sent, failed };
    }

    /**
     * Delay helper
     */
    private static delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

// Initialize on import

