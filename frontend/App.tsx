import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Text } from "react-native";
import { ThemeProvider } from "./src/theme/themeContext";
import { useTheme } from "./src/theme/themeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./src/config/constants";
import RootNavigator from "./src/navigation/RootNavigator";
import ErrorBoundary from "./src/components/common/ErrorBoundary";

function ConnectivityBanner({ connected, base }: { connected: boolean; base: string }) {
  const { theme } = useTheme();
  if (connected) return null;
  return (
    <GestureHandlerRootView
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        padding: 10,
        backgroundColor: theme.colors.error,
        zIndex: 1000
      }}
    >
      <Text style={{ color: theme.colors.text.inverse }}>
        Backend unreachable: {base}
      </Text>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

export default function App() {
  const [connected, setConnected] = React.useState(true);
  React.useEffect(() => {
    (async () => {
      await AsyncStorage.setItem("apiBaseUrl", API_BASE_URL);
      const origin = API_BASE_URL.replace(/\/api\/v1$/, "");
      try {
        const res = await fetch(`${origin}/health`);
        setConnected(res.status === 200);
      } catch {
        setConnected(false);
      }
    })();
  }, []);
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <NavigationContainer>
              <ConnectivityBanner connected={connected} base={API_BASE_URL} />
              <RootNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
