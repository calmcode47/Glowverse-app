/**
 * Seed Script for Notification Preferences
 * 
 * Creates default notification preferences for existing users.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedNotificationPreferences() {
    console.log('Starting notification preferences seed...');

    try {
        // Get all users
        const users = await prisma.user.findMany({
            select: { id: true, email: true },
        });

        console.log(`Found ${users.length} users`);

        let created = 0;
        let skipped = 0;

        for (const user of users) {
            // Check if preferences already exist
            const existing = await prisma.notificationPreferences.findUnique({
                where: { userId: user.id },
            });

            if (existing) {
                console.log(`Skipping user ${user.email} - preferences already exist`);
                skipped++;
                continue;
            }

            // Create default preferences
            await prisma.notificationPreferences.create({
                data: {
                    userId: user.id,
                    emailEnabled: true,
                    pushEnabled: true,
                    smsEnabled: false,
                    ordersEnabled: true,
                    promotionsEnabled: true,
                    fitnessEnabled: true,
                    accountEnabled: true,
                    socialEnabled: true,
                    promotionFrequency: 'daily',
                    digestEnabled: false,
                    digestTime: '09:00',
                    quietHoursEnabled: false,
                    quietHoursStart: '22:00',
                    quietHoursEnd: '08:00',
                },
            });

            console.log(`Created preferences for user ${user.email}`);
            created++;
        }

        console.log(`\nSeed completed:`);
        console.log(`  Created: ${created}`);
        console.log(`  Skipped: ${skipped}`);
        console.log(`  Total: ${users.length}`);
    } catch (error) {
        console.error('Error seeding notification preferences:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run seed
seedNotificationPreferences()
    .then(() => {
        console.log('Seed completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Seed failed:', error);
        process.exit(1);
    });
