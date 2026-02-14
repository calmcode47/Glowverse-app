import axios from 'axios';

interface PerformanceBaseline {
    endpoint: string;
    p50: number;
    p95: number;
    p99: number;
}

const BASELINES: PerformanceBaseline[] = [
    { endpoint: '/api/v1/products', p50: 100, p95: 300, p99: 500 },
    { endpoint: '/api/v1/health', p50: 10, p95: 25, p99: 50 },
    //   { endpoint: '/api/v1/guides', p50: 75, p95: 200, p99: 400 },
];

const REGRESSION_THRESHOLD = 1.2; // 20% slower = regression
const TEST_URL = process.env.TEST_URL || 'http://localhost:3000';

async function detectRegressions() {
    console.log(`🔍 Checking for performance regressions against ${TEST_URL}...\n`);

    const regressions: string[] = [];

    for (const baseline of BASELINES) {
        console.log(`Testing ${baseline.endpoint}...`);

        // Run quick performance test
        const times: number[] = [];
        for (let i = 0; i < 20; i++) {
            const start = Date.now();
            try {
                await axios.get(`${TEST_URL}${baseline.endpoint}`);
                times.push(Date.now() - start);
            } catch (err: any) {
                console.error(`Error requesting ${baseline.endpoint}: ${err.message}`);
            }
        }

        if (times.length === 0) {
            console.warn(`  ⚠️  No successful requests for ${baseline.endpoint}`);
            continue;
        }

        times.sort((a, b) => a - b);
        const p50 = times[Math.floor(times.length * 0.5)];
        const p95 = times[Math.floor(times.length * 0.95)];
        const p99 = times[Math.floor(times.length * 0.99)];

        console.log(`  Current - P50: ${p50}ms, P95: ${p95}ms, P99: ${p99}ms`);
        console.log(`  Baseline - P50: ${baseline.p50}ms, P95: ${baseline.p95}ms, P99: ${baseline.p99}ms`);

        // Check for regression
        const p95Ratio = p95 / baseline.p95;
        const p99Ratio = p99 / baseline.p99;

        if (p95Ratio > REGRESSION_THRESHOLD || p99Ratio > REGRESSION_THRESHOLD) {
            const regression = `${baseline.endpoint}: P95 ${p95Ratio.toFixed(2)}x baseline, P99 ${p99Ratio.toFixed(2)}x baseline`;
            regressions.push(regression);
            console.log(`  ❌ REGRESSION DETECTED: ${regression}\n`);
        } else {
            console.log(`  ✅ Performance OK\n`);
        }
    }

    if (regressions.length > 0) {
        console.log(`\n❌ ${regressions.length} performance regression(s) detected:`);
        regressions.forEach(r => console.log(`  - ${r}`));
        process.exit(1);
    } else {
        console.log('\n✅ No performance regressions detected');
        process.exit(0);
    }
}

detectRegressions().catch(console.error);
