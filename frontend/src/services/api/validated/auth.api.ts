import { typedApi } from "../typedClient";
import { LoginResponseSchema, UserSchema } from "../../../schemas/api.schemas";
import { ZodError } from "zod";
import { analytics } from "../../analytics.service";

const Sentry: any = { captureException: () => {} };

class AuthAPI {
  async login(email: string, password: string) {
    try {
      const response = await typedApi.post("/auth/login" as any, { email, password } as any);
      const validated = LoginResponseSchema.parse(response);
      return validated;
    } catch (error: any) {
      if (error instanceof ZodError) {
        this.handleValidationError(error, "/auth/login", { email });
      }
      throw error;
    }
  }

  async register(data: { email: string; password: string; name: string }) {
    try {
      const response = await typedApi.post("/auth/register" as any, data as any);
      const validated = LoginResponseSchema.parse(response);
      return validated;
    } catch (error: any) {
      if (error instanceof ZodError) {
        this.handleValidationError(error, "/auth/register", { email: data.email });
      }
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const response = await typedApi.post("/auth/refresh" as any, { refresh_token: refreshToken } as any);
      const validated = LoginResponseSchema.parse(response);
      return validated;
    } catch (error: any) {
      if (error instanceof ZodError) {
        this.handleValidationError(error, "/auth/refresh", {});
      }
      throw error;
    }
  }

  async getMe() {
    try {
      const response = await typedApi.get("/auth/me" as any);
      const validated = UserSchema.parse(response);
      return validated;
    } catch (error: any) {
      if (error instanceof ZodError) {
        this.handleValidationError(error, "/auth/me", {});
      }
      throw error;
    }
  }

  private handleValidationError(error: ZodError, endpoint: string, context: any): void {
    try {
      // eslint-disable-next-line no-console
      console.error("[Validation Error]", { endpoint, errors: error.errors, context });
    } catch {}
    analytics.trackEvent("api_validation_error" as any, {
      endpoint,
      error_count: error.errors.length,
      error_paths: error.errors.map((e: any) => (Array.isArray(e.path) ? e.path.join(".") : String(e.path))).join(", ")
    } as any);
    Sentry.captureException?.(error, {
      tags: { error_type: "validation_error", endpoint },
      extra: { zodErrors: error.errors, context }
    });
  }
}

export const authApi = new AuthAPI();
