import { typedApi } from "../typedClient";
import { CartResponseSchema } from "../../../schemas/api.schemas";
import { ZodError } from "zod";
import { analytics } from "../../analytics.service";

const Sentry: any = { captureException: () => {} };

class CartAPI {
  async getCart() {
    try {
      const response = await typedApi.get("/cart" as any);
      return CartResponseSchema.parse(response);
    } catch (error: any) {
      if (error instanceof ZodError) {
        this.handleValidationError(error, "/cart");
      }
      throw error;
    }
  }

  async addItem(productId: string, quantity: number, variantId?: string) {
    try {
      const response = await typedApi.post("/cart/items" as any, { productId, quantity, variantId } as any);
      return CartResponseSchema.parse(response);
    } catch (error: any) {
      if (error instanceof ZodError) {
        this.handleValidationError(error, "/cart/items");
      }
      throw error;
    }
  }

  async updateQuantity(itemId: string, quantity: number) {
    try {
      const response = await typedApi.put(`/cart/items/${itemId}` as any, { quantity } as any);
      return CartResponseSchema.parse(response);
    } catch (error: any) {
      if (error instanceof ZodError) {
        this.handleValidationError(error, `/cart/items/${itemId}`);
      }
      throw error;
    }
  }

  async removeItem(itemId: string) {
    try {
      const response = await typedApi.delete(`/cart/items/${itemId}` as any);
      return CartResponseSchema.parse(response);
    } catch (error: any) {
      if (error instanceof ZodError) {
        this.handleValidationError(error, `/cart/items/${itemId}`);
      }
      throw error;
    }
  }

  async applyPromoCode(code: string) {
    try {
      const response = await typedApi.post("/cart/promo" as any, { code } as any);
      return CartResponseSchema.parse(response);
    } catch (error: any) {
      if (error instanceof ZodError) {
        this.handleValidationError(error, "/cart/promo");
      }
      throw error;
    }
  }

  private handleValidationError(error: ZodError, endpoint: string): void {
    try {
      // eslint-disable-next-line no-console
      console.error("[Cart Validation Error]", { endpoint, errors: error.errors });
    } catch {}
    analytics.trackEvent("api_validation_error" as any, {
      endpoint,
      service: "cart",
      error_count: error.errors.length
    } as any);
    Sentry.captureException?.(error, { tags: { error_type: "validation_error", endpoint }, extra: { zodErrors: error.errors } });
  }
}

export const cartApi = new CartAPI();

