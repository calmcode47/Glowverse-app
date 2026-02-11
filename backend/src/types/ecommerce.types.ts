/**
 * E-Commerce Type Definitions
 * Enums, interfaces, and DTOs for product catalog, cart, and order management
 */

// ============================================
// ENUMS
// ============================================

export enum ProductCategory {
    SKINCARE = 'SKINCARE',
    MAKEUP = 'MAKEUP',
    HAIRCARE = 'HAIRCARE',
    FRAGRANCE = 'FRAGRANCE',
    TOOLS = 'TOOLS',
    SUPPLEMENTS = 'SUPPLEMENTS'
}

export enum OrderStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED'
}

// ============================================
// ADDRESS & PAYMENT
// ============================================

export interface Address {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
}

// ============================================
// PRODUCT TYPES
// ============================================

export interface ProductFilters {
    category?: ProductCategory;
    search?: string;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular';
}

export interface ProductSearchResult {
    id: string;
    name: string;
    brand: string;
    category: ProductCategory;
    price: number;
    thumbnailUrl: string;
    rating?: number;
    relevanceScore?: number;
}

// ============================================
// CART TYPES
// ============================================

export interface CartItemWithProduct {
    id: string;
    cartId: string;
    productId: string;
    product: {
        id: string;
        name: string;
        brand: string;
        category: ProductCategory;
        price: number;
        thumbnailUrl: string;
        stock: number;
        isActive: boolean;
    };
    quantity: number;
    price: number;
    total: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CartWithItems {
    id: string;
    userId: string;
    items: CartItemWithProduct[];
    subtotal: number;
    itemCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CartTotal {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    itemCount: number;
}

export interface AddToCartDto {
    productId: string;
    quantity: number;
}

export interface UpdateCartItemDto {
    quantity: number;
}

// ============================================
// ORDER TYPES
// ============================================

export interface CreateOrderDto {
    shippingAddress: Address;
    billingAddress?: Address;
    paymentMethod: string;
    notes?: string;
    promotionCode?: string;  // Optional promotion code
}

export interface UpdateOrderStatusDto {
    status: OrderStatus;
    trackingNumber?: string;
}

export interface OrderFilters {
    status?: OrderStatus;
    page?: number;
    limit?: number;
}

export interface OrderStatistics {
    totalOrders: number;
    ordersByStatus: {
        [key in OrderStatus]?: number;
    };
    totalSpent: number;
    averageOrderValue: number;
    recentOrders: {
        id: string;
        orderNumber: string;
        total: number;
        status: OrderStatus;
        createdAt: Date;
    }[];
}

// ============================================
// PAGINATION
// ============================================

export interface PaginationMetadata {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationMetadata;
}
