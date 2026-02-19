import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { validateEnv } from '../src/config/env.validator';

// Force load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
process.env.EMAIL_SERVICE = 'smtp';
process.env.SENTRY_DSN = 'https://example.com/sentry';
validateEnv();

const prisma = new PrismaClient();

beforeAll(async () => {
    // Setup test database
    console.log('Setting up test database...');
});

afterAll(async () => {
    // Disconnect from database
    await prisma.$disconnect();
});

export { prisma };
