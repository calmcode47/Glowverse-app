import * as fs from 'fs';
import * as path from 'path';

interface OptimizationReport {
    timestamp: Date;
    beforeOptimization: {
        slowQueries: number;
        p95: number;
        p99: number;
    };
    afterOptimization: {
        slowQueries: number;
        p95: number;
        p99: number;
    };
    improvements: {
        slowQueriesReduction: string;
        p95Improvement: string;
        p99Improvement: string;
    };
    indexesAdded: string[];
    n1PatternsFixed: number;
}

async function generateReport() {
    try {
        // Load before and after analysis
        const beforeStr = fs.existsSync('query-analysis-before.json') ? fs.readFileSync('query-analysis-before.json', 'utf8') : null;
        const afterStr = fs.existsSync('query-analysis-after.json') ? fs.readFileSync('query-analysis-after.json', 'utf8') : null;

        if (!beforeStr || !afterStr) {
            console.error("Missing analysis files. Please run analysis before and after optimization.");
            return;
        }

        const before = JSON.parse(beforeStr);
        const after = JSON.parse(afterStr);

        const report: OptimizationReport = {
            timestamp: new Date(),
            beforeOptimization: {
                slowQueries: before.slowQueries,
                p95: before.statistics.p95,
                p99: before.statistics.p99,
            },
            afterOptimization: {
                slowQueries: after.slowQueries,
                p95: after.statistics.p95,
                p99: after.statistics.p99,
            },
            improvements: {
                slowQueriesReduction: `${((1 - after.slowQueries / (before.slowQueries || 1)) * 100).toFixed(1)}%`,
                p95Improvement: `${((1 - after.statistics.p95 / (before.statistics.p95 || 1)) * 100).toFixed(1)}%`,
                p99Improvement: `${((1 - after.statistics.p99 / (before.statistics.p99 || 1)) * 100).toFixed(1)}%`,
            },
            indexesAdded: [
                'Products: category, brand, price, rating, created',
                'Orders: user, status, created',
                'Guides: author, category, published',
                'Notifications: user, read status',
            ],
            n1PatternsFixed: 5, // Count of N+1 patterns fixed
        };

        // Generate markdown report
        const markdown = `
# Database Query Optimization Report

**Generated:** ${report.timestamp.toISOString()}

## Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Slow Queries (>100ms) | ${report.beforeOptimization.slowQueries} | ${report.afterOptimization.slowQueries} | ${report.improvements.slowQueriesReduction} |
| P95 Response Time | ${report.beforeOptimization.p95}ms | ${report.afterOptimization.p95}ms | ${report.improvements.p95Improvement} |
| P99 Response Time | ${report.beforeOptimization.p99}ms | ${report.afterOptimization.p99}ms | ${report.improvements.p99Improvement} |

## Optimizations Implemented

### Indexes Added
${report.indexesAdded.map(idx => `- ${idx}`).join('\n')}

### N+1 Query Patterns Fixed
- ${report.n1PatternsFixed} N+1 patterns eliminated
- Replaced with optimized \`include\` and \`_count\` queries

### Caching Implemented
- Product catalog queries cached (15min TTL)
- User profile queries cached (5min TTL)
- Guide listings cached (15min TTL)

### Pagination Optimized
- Implemented cursor-based pagination for large datasets
- Reduced memory usage for pagination queries
`;

        const docsDir = path.join(__dirname, '../docs');
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
        }

        fs.writeFileSync(path.join(docsDir, 'QUERY_OPTIMIZATION_REPORT.md'), markdown);
        console.log('✅ Optimization report generated');
    } catch (err) {
        console.error("Error generating report:", err);
    }
}

generateReport().catch(console.error);
