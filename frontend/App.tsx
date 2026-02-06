import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigator from "@navigation/RootNavigator";
import { theme as appTheme } from "@constants/theme";
import { RootStackParamList } from "@navigation/types";
import { AppProvider, useApp } from "@context/AppContext";
import { CameraProvider } from "@context/CameraContext";
import { AIProvider } from "@context/AIContext";

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["perfectcorpai://", "https://perfectcorpai"],
  config: {
    screens: {
      Onboarding: "onboarding",
      MainTabs: {
        screens: {
          HomeTab: "home",
          CameraTab: "camera",
          ProfileTab: "profile"
        }
      },
      Results: "results",
      Settings: "settings",
      Tutorial: "tutorial"
    }
  }
};

function ThemeBridge({ children }: { children: React.ReactNode }) {
  const { settings } = useApp();
  const base = settings.theme === "dark" ? MD3DarkTheme : MD3LightTheme;
  const paperTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: appTheme.colors.primary,
      secondary: appTheme.colors.secondary,
      surface: appTheme.colors.surface,
      background: appTheme.colors.background,
      error: appTheme.colors.error
    }
  };
  return <PaperProvider theme={paperTheme}>{children}</PaperProvider>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemeBridge>
          <CameraProvider>
            <AIProvider>
              <NavigationContainer linking={linking}>
                <RootNavigator />
                <StatusBar style="auto" />
              </NavigationContainer>
            </AIProvider>
          </CameraProvider>
        </ThemeBridge>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
});
