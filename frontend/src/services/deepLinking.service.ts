import * as Linking from "expo-linking";
import type { NavigationContainerRef } from "@react-navigation/native";
import React from "react";

type DeepLinkRoute = {
  screen: string;
  params?: Record<string, any>;
};

class DeepLinkingService {
  private navigationRef: React.RefObject<NavigationContainerRef<any>> | null = null;
  private pendingDeepLink: string | null = null;

  setNavigationRef(ref: React.RefObject<NavigationContainerRef<any>>) {
    this.navigationRef = ref;
    if (this.pendingDeepLink && this.navigationRef.current) {
      const url = this.pendingDeepLink;
      this.pendingDeepLink = null;
      this.navigate(url);
    }
  }

  private isAuthRequired(screen: string): boolean {
    const authRequiredScreens = [
      "OrderDetail",
      "OrderHistory",
      "OrderTracking",
      "Profile",
      "Settings",
      "AnalysisHistory",
      "Addresses",
      "EditProfile",
      "Referrals",
      "Notifications"
    ];
    return authRequiredScreens.includes(screen);
  }

  parseDeepLink(url: string): DeepLinkRoute | null {
    try {
      const parsed = Linking.parse(url);
      const path = parsed.path;
      const queryParams = parsed.queryParams;

      if (!path) return null;

      const routes: Record<string, (params: any) => DeepLinkRoute> = {
        product: (params) => ({ screen: "ProductDetail", params: { productId: params.productId || params.id } }),
        products: () => ({ screen: "Shop", params: {} }),
        order: (params) => ({ screen: "OrderDetail", params: { orderId: params.orderId || params.id } }),
        orders: () => ({ screen: "OrderHistory", params: {} }),
        "try-on": (params) => ({ screen: "VirtualTryOn", params: { productId: params.productId, variantId: params.variantId } }),
        analysis: (params) => ({ screen: "AnalysisResults", params: { analysisId: params.analysisId || params.id } }),
        promo: (params) => ({ screen: "Promotions", params: { code: params.code } }),
        referral: (params) => ({ screen: "Referral", params: { code: params.code } }),
        profile: () => ({ screen: "Profile", params: {} }),
        settings: () => ({ screen: "Settings", params: {} }),
        notification: (params) => ({ screen: "Notifications", params: { notificationId: params.notificationId || params.id } })
      };

      const pathSegments = path.split("/").filter(Boolean);
      // Support both /app/products and /products formats
      const routeKey = pathSegments[0] === "app" ? pathSegments[1] : pathSegments[0];

      if (!routes[routeKey]) return null;

      // Merge path-based params if available (e.g. /app/product/123)
      const mergedParams = { ...queryParams };
      if (pathSegments.length > (pathSegments[0] === "app" ? 2 : 1)) {
        const id = pathSegments[pathSegments[0] === "app" ? 2 : 1];
        if (id) mergedParams.id = id;
      }

      return routes[routeKey](mergedParams);
    } catch {
      return null;
    }
  }

  navigate(url: string, isAuthenticated: boolean = false): boolean {
    if (!this.navigationRef?.current) {
      this.pendingDeepLink = url;
      return false;
    }

    const route = this.parseDeepLink(url);
    if (!route) return false;

    if (this.isAuthRequired(route.screen) && !isAuthenticated) {
      this.pendingDeepLink = url;
      this.navigationRef.current.navigate("Login" as never);
      return false;
    }

    try {
      (this.navigationRef.current as any).navigate(route.screen, route.params);
      this.pendingDeepLink = null;
      return true;
    } catch {
      return false;
    }
  }

  processPendingLink(isAuthenticated: boolean) {
    if (this.pendingDeepLink && isAuthenticated) {
      const url = this.pendingDeepLink;
      this.pendingDeepLink = null;
      // Delay slightly to ensure navigation is ready after login transition
      setTimeout(() => this.navigate(url, true), 500);
    }
  }

  async getInitialURL(): Promise<string | null> {
    return await Linking.getInitialURL();
  }

  addListener(callback: (url: string) => void): () => void {
    const sub = Linking.addEventListener("url", ({ url }: { url: string }) => callback(url));
    return () => sub.remove();
  }

  createDeepLink(path: string, params?: Record<string, string>): string {
    return Linking.createURL(path, { queryParams: params });
  }

  createUniversalLink(path: string, params?: Record<string, string>): string {
    const baseUrl = "https://glowverse.com/app";
    const query = params ? "?" + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&") : "";
    return `${baseUrl}/${path}${query}`;
  }
}

export const deepLinkingService = new DeepLinkingService();
