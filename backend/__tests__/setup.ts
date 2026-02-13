import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Force load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

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
