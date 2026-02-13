/**
 * Cache key constants for consistent cache key generation
 */
export const CACHE_KEYS = {
    // Products
    PRODUCT: (id: string) => `product:${id}`,
    PRODUCTS_LIST: (category?: string, page: number = 1) =>
        `products:${category || 'all'}:page:${page}`,
    PRODUCT_RECOMMENDATIONS: (userId: string) => `recommendations:${userId}`,

    // User
    USER: (id: string) => `user:${id}`,
    USER_PROFILE: (id: string) => `user:profile:${id}`,
    USER_PREFERENCES: (id: string) => `user:preferences:${id}`,

    // Cart
    CART: (userId: string) => `cart:${userId}`,

    // Promotions
    PROMOTION: (code: string) => `promotion:${code}`,
    ACTIVE_PROMOTIONS: () => `promotions:active`,

    // Guides
    GUIDE: (id: string) => `guide:${id}`,
    GUIDES_LIST: (category?: string, page: number = 1) =>
        `guides:${category || 'all'}:page:${page}`,
    POPULAR_GUIDES: () => `guides:popular`,

    // Search
    SEARCH_RESULTS: (query: string, filters: string) =>
        `search:${query}:${filters}`,
    POPULAR_SEARCHES: () => `searches:popular`,

    // Analytics
    TRENDING_PRODUCTS: () => `analytics:products:trending`,
    USER_ACTIVITY: (userId: string) => `analytics:user:${userId}`,

    // Orders
    ORDER: (id: string) => `order:${id}`,
    USER_ORDERS: (userId: string) => `user:orders:${userId}`,

    // Notifications
    USER_NOTIFICATIONS: (userId: string) => `notifications:${userId}`,
    UNREAD_COUNT: (userId: string) => `notifications:unread:${userId}`,
} as const;

/**
 * Cache TTL constants (in seconds)
 */
export const CACHE_TTL = {
    SHORT: 300,        // 5 minutes - User-specific data
    MEDIUM: 900,       // 15 minutes - Product catalog, guides
    LONG: 1800,        // 30 minutes - Promotions, recommendations
    VERY_LONG: 3600,   // 1 hour - Categories, static content
    DAY: 86400,        // 24 hours - Analytics, trending data
} as const;
