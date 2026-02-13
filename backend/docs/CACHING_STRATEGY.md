# Caching Strategy

## Overview
Redis is used for application-level caching to reduce database load, improve response times, and enhance user experience.

## Cache Architecture

### Components
- **Redis Server**: In-memory data store (docker-compose)
- **Cache Service**: Abstraction layer (`src/services/cache.service.ts`)
- **Cache Keys**: Centralized constants (`src/constants/cache-keys.ts`)
- **Cache Middleware**: HTTP response caching (`src/middleware/cache.ts`)

### Connection
- **URL**: Configured via `REDIS_URL` environment variable
- **Retry Strategy**: Exponential backoff (50ms → 2000ms)
- **Auto-Pipelining**: Enabled for better performance
- **Graceful Shutdown**: Connections closed on SIGTERM

## Cache Patterns

### 1. Cache-Aside (Lazy Loading)
Default pattern used throughout the application.

```typescript
const product = await CacheService.getOrSet(
  CACHE_KEYS.PRODUCT(id),
  async () => await prisma.product.findUnique({ where: { id } }),
  CACHE_TTL.MEDIUM
);
```

**Flow:**
1. Check cache for key
2. If found (cache hit), return cached value
3. If not found (cache miss), fetch from database
4. Store in cache with TTL
5. Return value

**Advantages:**
- Only caches requested data
- Resilient to cache failures
- Simple to implement

### 2. Write-Through
Used for critical data that must stay synchronized.

```typescript
// Update database
const product = await prisma.product.update({ where: { id }, data });

// Update cache immediately
await CacheService.set(CACHE_KEYS.PRODUCT(id), product, CACHE_TTL.MEDIUM);
```

### 3. Write-Behind (Invalidation)
Used when cache can be stale briefly.

```typescript
// Update database
const product = await prisma.product.update({ where: { id }, data });

// Invalidate cache
await CacheService.delete(CACHE_KEYS.PRODUCT(id));
await CacheService.deletePattern('products:*');
```

## Cache Keys

All cache keys follow the pattern: `glowverse:{resource}:{identifier}`

### Key Naming Convention
- **Singular resources**: `product:123`, `user:456`
- **Lists**: `products:electronics:page:1`
- **Aggregations**: `analytics:products:trending`
- **User-specific**: `cart:user-123`, `notifications:user-456`

### Examples
```typescript
CACHE_KEYS.PRODUCT('prod-123')           // glowverse:product:prod-123
CACHE_KEYS.PRODUCTS_LIST('beauty', 2)    // glowverse:products:beauty:page:2
CACHE_KEYS.USER_PROFILE('user-456')      // glowverse:user:profile:user-456
CACHE_KEYS.ACTIVE_PROMOTIONS()           // glowverse:promotions:active
```

## TTL Guidelines

| TTL | Duration | Use Cases |
|-----|----------|-----------|
| **SHORT** | 5 minutes | User-specific data (cart, preferences) |
| **MEDIUM** | 15 minutes | Product catalog, guides, search results |
| **LONG** | 30 minutes | Promotions, recommendations |
| **VERY_LONG** | 1 hour | Categories, static content |
| **DAY** | 24 hours | Analytics, trending data |

### Choosing TTL
- **Frequently updated**: SHORT (5 min)
- **Moderately updated**: MEDIUM (15 min)
- **Rarely updated**: LONG (30 min) or VERY_LONG (1 hour)
- **Static/Aggregated**: DAY (24 hours)

## Cache Invalidation

### Event-Based Invalidation
When data is updated, corresponding cache keys are deleted.

```typescript
// Product updated
await CacheService.delete(CACHE_KEYS.PRODUCT(id));
await CacheService.deletePattern('products:*'); // Invalidate all product lists
```

### Time-Based Invalidation
All cached data has TTL and expires automatically.

### Manual Invalidation
```typescript
// Flush specific key
await CacheService.delete(CACHE_KEYS.PRODUCT(id));

// Flush pattern
await CacheService.deletePattern('user:*');

// Flush entire cache (use sparingly)
await CacheService.flush();
```

## Caching by Resource

### Products
- **Individual**: `CACHE_KEYS.PRODUCT(id)` - MEDIUM TTL
- **Lists**: `CACHE_KEYS.PRODUCTS_LIST(category, page)` - MEDIUM TTL
- **Recommendations**: `CACHE_KEYS.PRODUCT_RECOMMENDATIONS(userId)` - LONG TTL
- **Invalidation**: On product update, delete product + all lists

### Users
- **Profile**: `CACHE_KEYS.USER_PROFILE(id)` - SHORT TTL
- **Preferences**: `CACHE_KEYS.USER_PREFERENCES(id)` - SHORT TTL
- **Invalidation**: On profile update, delete user-specific keys

### Cart
- **Cart**: `CACHE_KEYS.CART(userId)` - SHORT TTL
- **Invalidation**: On cart update (add/remove items)

### Promotions
- **Individual**: `CACHE_KEYS.PROMOTION(code)` - MEDIUM TTL
- **Active List**: `CACHE_KEYS.ACTIVE_PROMOTIONS()` - LONG TTL
- **Invalidation**: On promotion create/update/delete

### Guides
- **Individual**: `CACHE_KEYS.GUIDE(id)` - MEDIUM TTL
- **Lists**: `CACHE_KEYS.GUIDES_LIST(category, page)` - MEDIUM TTL
- **Popular**: `CACHE_KEYS.POPULAR_GUIDES()` - LONG TTL
- **Invalidation**: On guide publish/update

## HTTP Response Caching

Use cache middleware for entire HTTP responses:

```typescript
import { cacheMiddleware } from '../middleware/cache';
import { CACHE_TTL } from '../constants/cache-keys';

// Cache all GET requests to this route
router.get('/products', cacheMiddleware({ ttl: CACHE_TTL.MEDIUM }), getProducts);

// Skip caching for authenticated users
router.get('/profile', cacheMiddleware({
  skip: (req) => !!req.user,
  ttl: CACHE_TTL.SHORT
}), getProfile);
```

## Monitoring

### Metrics to Track
- **Cache hit rate**: `(hits / (hits + misses)) * 100`
- **Cache miss rate**: `(misses / (hits + misses)) * 100`
- **Average response time**: Compare cached vs uncached
- **Memory usage**: Redis memory consumption
- **Eviction rate**: Keys evicted due to memory pressure

### Target Metrics
- Cache hit rate: **> 70%** for frequently accessed data
- Cache miss rate: **< 30%**
- Response time improvement: **> 50%** for cached responses

### Health Check
Redis health is checked via `/health` endpoint:
```json
{
  "cache": {
    "status": "healthy",
    "ping": 2
  }
}
```

## Cache Warming

### On Deployment
Pre-populate cache with frequently accessed data:

```typescript
async function warmCache() {
  // Cache popular products
  const popularProducts = await prisma.product.findMany({ take: 50 });
  for (const product of popularProducts) {
    await CacheService.set(CACHE_KEYS.PRODUCT(product.id), product, CACHE_TTL.MEDIUM);
  }
  
  // Cache active promotions
  const promotions = await prisma.promotion.findMany({ where: { active: true } });
  await CacheService.set(CACHE_KEYS.ACTIVE_PROMOTIONS(), promotions, CACHE_TTL.LONG);
}
```

## Error Handling

### Graceful Degradation
Cache failures never break the application:

```typescript
static async get<T>(key: string): Promise<T | null> {
  try {
    // ... cache logic
  } catch (error) {
    logger.error('Cache get error', { key, error });
    return null; // Fail gracefully, fetch from database
  }
}
```

### Redis Connection Loss
- Application continues to function
- All cache operations fail gracefully
- Data fetched directly from database
- Automatic reconnection via retry strategy

## Best Practices

1. **Always set TTL**: Prevent indefinite cache growth
2. **Use cache keys constants**: Avoid typos and inconsistencies
3. **Invalidate on updates**: Keep cache synchronized
4. **Monitor hit rates**: Optimize caching strategy
5. **Cache expensive operations**: Database queries, API calls
6. **Don't cache user-specific data globally**: Use user-scoped keys
7. **Test cache invalidation**: Ensure updates are reflected
8. **Use patterns for bulk invalidation**: `deletePattern('products:*')`

## Troubleshooting

### Low Cache Hit Rate
1. Check TTL is appropriate for data volatility
2. Verify cache keys are consistent
3. Review invalidation strategy (too aggressive?)
4. Monitor cache evictions (memory pressure?)

### Stale Data
1. Reduce TTL for frequently updated resources
2. Improve invalidation on updates
3. Consider write-through pattern for critical data

### High Memory Usage
1. Review TTL settings (too long?)
2. Implement cache size limits
3. Use Redis eviction policies (LRU)
4. Monitor key count and sizes

## Resources

- [Redis Documentation](https://redis.io/documentation)
- [ioredis GitHub](https://github.com/luin/ioredis)
- [Cache Patterns](https://docs.aws.amazon.com/AmazonElastiCache/latest/mem-ug/Strategies.html)
