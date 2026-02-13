import * as Linking from "expo-linking";
import type { NavigationContainerRef } from "@react-navigation/native";
import React from "react";

type DeepLinkRoute = {
  screen: string;
  params?: Record<string, any>;
};

class DeepLinkingService {
  private navigationRef: React.RefObject<NavigationContainerRef<any>> | null = null;

  setNavigationRef(ref: React.RefObject<NavigationContainerRef<any>>) {
    this.navigationRef = ref;
  }

  parseDeepLink(url: string): DeepLinkRoute | null {
    try {
      const { path, queryParams } = Linking.parse(url);
      if (!path) return null;
      const routes: Record<string, (params: any) => DeepLinkRoute> = {
        product: (params) => ({ screen: "ProductDetail", params: { productId: params.id } }),
        products: () => ({ screen: "Shop", params: {} }),
        order: (params) => ({ screen: "OrderDetail", params: { orderId: params.id } }),
        orders: () => ({ screen: "OrderHistory", params: {} }),
        "try-on": (params) => ({ screen: "VirtualTryOn", params: { productId: params.productId, variantId: params.variantId } }),
        analysis: (params) => ({ screen: "AnalysisResults", params: { analysisId: params.id } }),
        promo: (params) => ({ screen: "Promotions", params: { code: params.code } }),
        referral: (params) => ({ screen: "Referral", params: { code: params.code } }),
        profile: () => ({ screen: "Profile", params: {} }),
        settings: () => ({ screen: "Settings", params: {} }),
        notification: (params) => ({ screen: "Notifications", params: { notificationId: params.id } })
      };
      const pathSegments = path.split("/").filter(Boolean);
      const routeKey = pathSegments[0];
      if (!routes[routeKey]) return null;
      return routes[routeKey](queryParams);
    } catch {
      return null;
    }
  }

  navigate(url: string): boolean {
    if (!this.navigationRef?.current) return false;
    const route = this.parseDeepLink(url);
    if (!route) return false;
    try {
      this.navigationRef.current.navigate(route.screen as never, route.params as never);
      return true;
    } catch {
      return false;
    }
  }

  async getInitialURL(): Promise<string | null> {
    return await Linking.getInitialURL();
  }

  addListener(callback: (url: string) => void): () => void {
    const sub = Linking.addEventListener("url", ({ url }) => callback(url));
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
