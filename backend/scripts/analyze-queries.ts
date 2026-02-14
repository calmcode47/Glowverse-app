import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient({
    log: [
        { emit: 'event', level: 'query' },
    ],
});

interface QueryLog {
    query: string;
    duration: number;
    params: string;
    timestamp: Date;
}

const queries: QueryLog[] = [];

// @ts-ignore
prisma.$on('query', (e: any) => {
    queries.push({
        query: e.query,
        duration: e.duration,
        params: e.params,
        timestamp: new Date(),
    });
});

async function analyzeQueries() {
    console.log('🔍 Starting query analysis...\n');

    // Simulate realistic usage patterns
    const analysisScenarios = [
        () => simulateProductBrowsing(),
        () => simulateUserProfile(),
        () => simulateOrderCreation(),
        () => simulateSearch(),
        () => simulateGuidesBrowsing(),
    ];

    for (const scenario of analysisScenarios) {
        await scenario();
    }

    // Analyze collected queries
    const slowQueries = queries.filter(q => q.duration > 100);
    const verySlowQueries = queries.filter(q => q.duration > 500);

    console.log('\n📊 Query Performance Analysis\n');
    console.log(`Total queries: ${queries.length}`);
    console.log(`Slow queries (>100ms): ${slowQueries.length} (${(slowQueries.length / queries.length * 100).toFixed(1)}%)`);
    console.log(`Very slow (>500ms): ${verySlowQueries.length} (${(verySlowQueries.length / queries.length * 100).toFixed(1)}%)`);

    // Calculate statistics
    const durations = queries.map(q => q.duration);
    if (durations.length > 0) {
        const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
        const sorted = durations.sort((a, b) => a - b);
        const p50 = sorted[Math.floor(sorted.length * 0.5)];
        const p95 = sorted[Math.floor(sorted.length * 0.95)];
        const p99 = sorted[Math.floor(sorted.length * 0.99)];

        console.log(`\nAverage: ${avg.toFixed(2)}ms`);
        console.log(`P50: ${p50}ms`);
        console.log(`P95: ${p95}ms`);
        console.log(`P99: ${p99}ms`);

        // Identify most frequent slow queries
        console.log(`\n🐌 Slowest Queries:\n`);
        const sortedBySlow = [...queries].sort((a, b) => b.duration - a.duration);
        sortedBySlow.slice(0, 10).forEach((q, i) => {
            console.log(`${i + 1}. ${q.duration}ms - ${q.query.substring(0, 100)}...`);
        });

        // Export to JSON for analysis
        fs.writeFileSync(
            'query-analysis.json',
            JSON.stringify({
                totalQueries: queries.length,
                slowQueries: slowQueries.length,
                statistics: { avg, p50, p95, p99 },
                slowestQueries: sortedBySlow.slice(0, 20),
            }, null, 2)
        );

        console.log(`\n✅ Analysis saved to query-analysis.json`);
    } else {
        console.log('\nNo queries recorded.');
    }
}

async function simulateProductBrowsing() {
    await prisma.product.findMany({
        take: 20,
        include: { category: true },
    });

    // Find a product to get ID, handling empty DB
    const product = await prisma.product.findFirst();
    if (product) {
        await prisma.product.findUnique({
            where: { id: product.id },
            include: {
                category: true,
                reviews: true,
            },
        });
    }
}

async function simulateUserProfile() {
    // Find a user first
    const user = await prisma.user.findFirst();
    if (user) {
        await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                profile: true,
                preferences: true,
                orders: {
                    take: 10,
                    include: { items: true },
                },
            },
        });
    }

}

async function simulateOrderCreation() {
    const user = await prisma.user.findFirst();
    if (user) {
        // We might not have a cart, but let's try
        await prisma.cart.findFirst({
            where: { userId: user.id },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });
    }
}

async function simulateSearch() {
    await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: 'cream', mode: 'insensitive' } },
                { description: { contains: 'cream', mode: 'insensitive' } },
            ],
        },
        take: 20,
    });
}

async function simulateGuidesBrowsing() {
    await prisma.guide.findMany({
        take: 20,
        include: {
            author: true,
            steps: true,
            _count: {
                select: { likes: true, bookmarks: true },
            },
        },
    });
}

analyzeQueries()
    .then(() => process.exit(0))
    .catch(console.error);
