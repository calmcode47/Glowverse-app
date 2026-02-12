import { PrismaClient } from '@prisma/client';

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
