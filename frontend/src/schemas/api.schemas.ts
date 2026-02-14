import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
export type User = z.infer<typeof UserSchema>;

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  images: z.array(z.string().url()),
  category: z.string(),
  brand: z.string(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  inStock: z.boolean()
});
export type Product = z.infer<typeof ProductSchema>;

export const CartItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  product: ProductSchema,
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  variantId: z.string().uuid().optional()
});

export const CartResponseSchema = z.object({
  items: z.array(CartItemSchema),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  discount: z.number().nonnegative().optional().default(0),
  total: z.number().nonnegative(),
  promoCode: z.string().optional()
});
export type CartResponse = z.infer<typeof CartResponseSchema>;

export const OrderStatusSchema = z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]);

export const AddressSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  phone: z.string().regex(/^\d{10}$/),
  isDefault: z.boolean()
});

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  product: ProductSchema,
  quantity: z.number().int().positive(),
  price: z.number().positive()
});

export const OrderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  items: z.array(OrderItemSchema),
  total: z.number().positive(),
  subtotal: z.number().positive(),
  tax: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  discount: z.number().nonnegative().optional().default(0),
  status: OrderStatusSchema,
  shippingAddress: AddressSchema,
  paymentMethod: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().datetime().optional()
});
export type Order = z.infer<typeof OrderSchema>;

export const LoginResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  user: UserSchema
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative()
});
export type Pagination = z.infer<typeof PaginationSchema>;

export const ProductListResponseSchema = z.object({
  products: z.array(ProductSchema),
  pagination: PaginationSchema
});

