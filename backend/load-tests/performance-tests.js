const autocannon = require('autocannon');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.TEST_URL || 'https://staging.glowverse.app';

const tests = [
    {
        name: 'Health Check',
        url: `${baseUrl}/api/health`,
        duration: 30,
        connections: 100,
        pipelining: 10,
    },
    {
        name: 'Product Listing',
        url: `${baseUrl}/api/products?category=skincare`,
        duration: 60,
        connections: 50,
        pipelining: 5,
    },
    {
        name: 'Product Search',
        url: `${baseUrl}/api/search?q=moisturizer`,
        duration: 60,
        connections: 50,
        pipelining: 5,
    },
    {
        name: 'Guide Listing',
        url: `${baseUrl}/api/guides`,
        duration: 60,
        connections: 30,
        pipelining: 3,
    },
];

async function runTests() {
    console.log('🚀 Starting performance tests...\n');

    const results = [];

    for (const test of tests) {
        console.log(`\n📊 Testing: ${test.name}`);
        console.log(`URL: ${test.url}`);
        console.log(`Duration: ${test.duration}s, Connections: ${test.connections}\n`);

        const result = await autocannon({
            url: test.url,
            duration: test.duration,
            connections: test.connections,
            pipelining: test.pipelining,
            headers: {
                'content-type': 'application/json',
            },
        });

        results.push({
            name: test.name,
            url: test.url,
            requests: {
                total: result.requests.total,
                average: result.requests.average,
                p50: result.latency.p50,
                p95: result.latency.p95,
                p99: result.latency.p99,
            },
            throughput: {
                average: result.throughput.average,
                total: result.throughput.total,
            },
            errors: result.errors,
        });

        console.log(`✅ Completed: ${test.name}`);
        console.log(`   Requests/sec: ${result.requests.average}`);
        console.log(`   P95 Latency: ${result.latency.p95}ms`);
        console.log(`   P99 Latency: ${result.latency.p99}ms`);
        console.log(`   Errors: ${result.errors}`);
    }

    // Generate report
    const report = {
        timestamp: new Date().toISOString(),
        environment: baseUrl,
        results,
        summary: {
            totalTests: tests.length,
            averageP95: results.reduce((sum, r) => sum + r.requests.p95, 0) / results.length,
            averageP99: results.reduce((sum, r) => sum + r.requests.p99, 0) / results.length,
            totalErrors: results.reduce((sum, r) => sum + r.errors, 0),
        },
    };

    const reportPath = path.join(__dirname, 'results', 'performance-report.json');
    // Ensure results dir exists
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });

    fs.writeFileSync(
        reportPath,
        JSON.stringify(report, null, 2)
    );

    console.log(`\n✅ Performance report saved to ${reportPath}`);
}

runTests().catch(console.error);
