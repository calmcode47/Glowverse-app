import { client } from "./client";

export interface AdminStats {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    activeProducts: number;
    ordersToday: number;
    signupsToday: number;
    recentOrders: Array<{
        id: string;
        total: number;
        status: string;
        createdAt: string;
    }>;
}

export interface AdminProduct {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    inStock: boolean;
    images: string[];
}

export interface AdminOrder {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    shippingAddress: {
        name: string;
    };
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export const adminApi = {
    getDashboardStats: async (): Promise<AdminStats> => {
        const response = await client.get("/api/v1/admin/stats");
        return response.data;
    },

    getProducts: async (): Promise<AdminProduct[]> => {
        const response = await client.get("/api/v1/admin/products");
        return response.data;
    },

    createProduct: async (productData: any): Promise<AdminProduct> => {
        const response = await client.post("/api/v1/admin/products", productData);
        return response.data;
    },

    updateProduct: async (id: string, productData: any): Promise<AdminProduct> => {
        const response = await client.put(`/api/v1/admin/products/${id}`, productData);
        return response.data;
    },

    deleteProduct: async (id: string): Promise<void> => {
        await client.delete(`/api/v1/admin/products/${id}`);
    },

    getOrders: async (status: string = 'all'): Promise<AdminOrder[]> => {
        const url = status === 'all' ? "/api/v1/admin/orders" : `/api/v1/admin/orders?status=${status}`;
        const response = await client.get(url);
        return response.data;
    },

    updateOrderStatus: async (id: string, status: string): Promise<void> => {
        await client.patch(`/api/v1/admin/orders/${id}`, { status });
    },

    getUsers: async (): Promise<AdminUser[]> => {
        const response = await client.get("/api/v1/admin/users");
        return response.data;
    },

    updateUserRole: async (id: string, role: string): Promise<void> => {
        await client.patch(`/api/v1/admin/users/${id}`, { role });
    }
};
