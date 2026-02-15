import React from "react";
import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Text, View } from "react-native";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, asyncStoragePersister } from "./src/lib/queryClient";
import { ThemeProvider } from "./src/theme/themeContext";
import { useTheme } from "./src/theme/themeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENV } from "./src/config/environment";
import RootNavigator from "./src/navigation/RootNavigator";
import { analytics } from "./src/services/analytics.service";
import { AuthProvider, useGlowAuth } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import ErrorBoundary from "./src/components/error/ErrorBoundary";
import Constants from "expo-constants";
import { NotificationsProvider } from "./src/context/NotificationsContext";
import { initializeStripe } from "./src/services/stripe.service";
import { deepLinkingService } from "./src/services/deepLinking.service";
import { notificationService } from "./src/services/notifications/firebaseConfig";
import { usePreloadScreens } from "./src/hooks/usePreloadScreens";
import { InteractionManager } from "react-native";
import { memoryUsageMonitor } from "./src/utils/performance";
import { apiHealthMonitor } from "./src/services/apiHealthMonitor";
import ConflictIndicator from "./src/components/conflicts/ConflictIndicator";
import ConflictHost from "./src/components/conflicts/ConflictHost";
import { conflictQueue } from "./src/services/conflictQueue.service";
import { offlineQueue } from "./src/services/offlineQueue.service";
import { networkMonitor } from "./src/services/sync/NetworkMonitor";
import { OfflineBanner } from "./src/components/offline/OfflineBanner";



function ConnectivityBanner({ connected, base }: { connected: boolean; base: string }) {
  const { theme } = useTheme();
  if (connected) return null;
  // User requested to remove the "crashing error" banner
  return null;
}


function AppContent({ connected }: { connected: boolean }) {
  const navigationRef = React.useRef<any>(null);
  const routeNameRef = React.useRef<string | undefined>(undefined);
  const { isAuthenticated } = (useGlowAuth as any)();

  React.useEffect(() => {
    if (isAuthenticated) {
      deepLinkingService.processPendingLink(isAuthenticated);
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    deepLinkingService.setNavigationRef(navigationRef);
    (async () => {
      try {
        const url = await deepLinkingService.getInitialURL();
        if (url) {
          setTimeout(() => {
            deepLinkingService.navigate(url, isAuthenticated);
          }, 1000);
        }
      } catch { }
    })();
    const unsub = deepLinkingService.addListener((url) => {
      deepLinkingService.navigate(url, isAuthenticated);
    });
    return () => unsub();
  }, [isAuthenticated]);

  const linking = {
    prefixes: [
      "glowverse://",
      "https://glowverse.com/app",
      "https://www.glowverse.com/app",
      "https://glowverse.app/app",
      "https://www.glowverse.app/app"
    ],
    config: {
      screens: {
        Home: "home",
        Shop: "products",
        ProductDetail: "product/:productId",
        Cart: "cart",
        Checkout: "checkout",
        OrderDetail: "order/:orderId",
        OrderHistory: "orders",
        VirtualTryOn: "try-on/:productId?",
        AnalysisResults: "analysis/:analysisId",
        Promotions: "promo/:code?",
        Referral: "referral/:code?",
        Profile: "profile",
        Settings: "settings",
        Notifications: "notifications/:notificationId?"
      }
    }
  } as const;

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking as any}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={async () => {
        const previous = routeNameRef.current;
        const current = navigationRef.current?.getCurrentRoute()?.name;
        if (current && previous !== current) {
          await analytics.logScreenView(current);
        }
        routeNameRef.current = current;
      }}
    >
      <ConnectivityBanner connected={connected} base={ENV.apiBaseUrl} />
      <OfflineBanner />
      <ConflictIndicator />
      <ConflictHost />
      <RootNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  const [connected, setConnected] = React.useState(true);
  usePreloadScreens();

  React.useEffect(() => {
    (async () => {
      await AsyncStorage.setItem("apiBaseUrl", ENV.apiBaseUrl);
      const origin = ENV.apiBaseUrl.replace(/\/api\/v1$/, "");
      try {
        const res = await fetch(`${origin}/health`);
        setConnected(res.status === 200);
      } catch {
        setConnected(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    conflictQueue.loadConflicts().catch(() => { });
  }, []);

  React.useEffect(() => {
    if (connected) {
      offlineQueue.processQueue().catch(() => { });
    }
  }, [connected]);

  React.useEffect(() => {
    try {
      const dsn = ENV.sentryDSN;
      if (dsn) {
        const Sentry = require("@sentry/react-native");
        Sentry.init({
          dsn,
          enableInExpoDevelopment: false,
          debug: false,
          environment: ENV.environment,
          release: Constants.expoConfig?.version
        });
      }
    } catch { }
  }, []);

  React.useEffect(() => {
    initializeStripe().catch(() => { });
    notificationService.initialize().catch(() => { });
  }, []);

  React.useEffect(() => {
    const cancel = InteractionManager.runAfterInteractions(() => {
      try {
        memoryUsageMonitor(10000);
        apiHealthMonitor.start();
      } catch { }
    });
    return () => {
      // @ts-ignore
      cancel?.cancel?.();
    };
  }, []);

  React.useEffect(() => {
    networkMonitor.start();
    const unsubscribeNetwork = networkMonitor.addListener((status) => {
      if (status.isOnline) {
        offlineQueue.processQueue().catch(() => { });
      }
    });

    return () => {
      unsubscribeNetwork();
      networkMonitor.stop();
    };
  }, []);

  return (
    <ErrorBoundary>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <ThemeProvider>
              <AuthProvider>
                <NotificationsProvider>
                  <CartProvider>
                    <FavoritesProvider>
                      <ErrorBoundary>
                        <AppContent connected={connected} />
                      </ErrorBoundary>
                    </FavoritesProvider>
                  </CartProvider>
                </NotificationsProvider>
              </AuthProvider>
            </ThemeProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  );
}
