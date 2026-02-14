const fs = require('fs');
const path = require('path');

function analyzeResults() {
    const resultsDir = path.join(__dirname, '../load-tests/results');

    if (!fs.existsSync(resultsDir)) {
        console.log('Results directory not found');
        return;
    }

    const files = fs.readdirSync(resultsDir)
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(resultsDir, f));

    if (files.length === 0) {
        console.log('No test results found');
        return;
    }

    console.log(`\n📊 Analyzing ${files.length} test result(s)...\n`);

    for (const file of files) {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        // Handle Artillery JSON output structure
        const summary = data.aggregate;

        if (!summary) {
            console.log(`⚠️  Skipping ${path.basename(file)}: No aggregate data found (might be failed test run)`);
            continue;
        }

        console.log(`\n📄 ${path.basename(file)}`);
        // Artillery v2 aggregate structure might differ slightly, checking common fields
        const duration = summary.duration || 0;
        const requestsCompleted = summary.counters['http.requests'] || 0;
        const errors = (summary.counters['http.codes.500'] || 0) + (summary.counters['errors'] || 0); // Broad error check

        // TPS/RPS
        const rps = summary.rates['http.request_rate'] || 0;

        // Latency
        const p50 = summary.summaries['http.response_time'] ? summary.summaries['http.response_time'].p50 : 0;
        const p95 = summary.summaries['http.response_time'] ? summary.summaries['http.response_time'].p95 : 0;
        const p99 = summary.summaries['http.response_time'] ? summary.summaries['http.response_time'].p99 : 0;

        console.log(`   Duration: ${duration}s`);
        console.log(`   Requests: ${requestsCompleted}`);
        console.log(`   RPS: ${rps ? rps.toFixed(2) : 'N/A'}`);
        console.log(`   P50: ${p50}ms`);
        console.log(`   P95: ${p95}ms`);
        console.log(`   P99: ${p99}ms`);
        console.log(`   Errors: ${errors}`);
        const errorRate = requestsCompleted > 0 ? (errors / requestsCompleted * 100) : 0;
        console.log(`   Error Rate: ${errorRate.toFixed(2)}%`);

        // Check against targets
        const meetsP95Target = p95 < 200;
        const meetsP99Target = p99 < 500;
        const meetsErrorTarget = errorRate < 1;

        console.log(`\n   Status:`);
        console.log(`   ${meetsP95Target ? '✅' : '❌'} P95 < 200ms`);
        console.log(`   ${meetsP99Target ? '✅' : '❌'} P99 < 500ms`);
        console.log(`   ${meetsErrorTarget ? '✅' : '❌'} Error rate < 1%`);
    }

    console.log('\n✅ Analysis complete\n');
}

analyzeResults();
