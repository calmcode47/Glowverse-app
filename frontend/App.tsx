import React from "react";
import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Text, View } from "react-native";
import { ThemeProvider } from "./src/theme/themeContext";
import { useTheme } from "./src/theme/themeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENV } from "./src/config/environment";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import ErrorBoundary from "./src/components/error/ErrorBoundary";
import Constants from "expo-constants";

function ConnectivityBanner({ connected, base }: { connected: boolean; base: string }) {
  const { theme } = useTheme();
  if (connected) return null;
  // User requested to remove the "crashing error" banner
  return null;
}


export default function App() {
  const [connected, setConnected] = React.useState(true);
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
    try {
      const dsn = ENV.sentryDSN;
      if (dsn) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Sentry = require("@sentry/react-native");
        Sentry.init({
          dsn,
          enableInExpoDevelopment: false,
          debug: false,
          environment: ENV.environment,
          release: Constants.expoConfig?.version
        });
      }
    } catch {}
  }, []);
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <FavoritesProvider>
                  <ErrorBoundary>
                    <NavigationContainer>
                      <ConnectivityBanner connected={connected} base={ENV.apiBaseUrl} />
                      <RootNavigator />
                      <StatusBar style="auto" />
                    </NavigationContainer>
                  </ErrorBoundary>
                </FavoritesProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
