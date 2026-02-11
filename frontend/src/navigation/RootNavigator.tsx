import React from "react";
import { View } from "react-native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MainTabNavigator from "./MainTabNavigator";
import OnboardingScreen from "@screens/auth/OnboardingScreen";
import LoginScreen from "@screens/auth/LoginPaper";
import RegisterScreen from "@screens/auth/RegisterScreen";
import AnalysisResultsScreen from "@screens/results/AnalysisResultsScreen";
import ProcessingScreen from "@screens/analysis/ProcessingScreen";
import SettingsScreen from "@screens/profile/SettingsScreen";
import TutorialScreen from "@screens/onboarding/TutorialScreen";
import ProductDetailScreen from "@screens/shop/ProductDetailScreen";
import HistoryScreen from "@screens/history/HistoryScreen";
import OrderHistoryScreen from "@screens/profile/OrderHistoryScreen";
import AboutScreen from "@screens/profile/AboutScreen";
import CartScreen from '../screens/shop/CartScreen';
import SearchScreen from '../screens/search/SearchScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import VirtualTryOnScreen from "@screens/ar/VirtualTryOnScreen";
import { ActivityIndicator } from "react-native-paper";
import HeaderRight from "@components/navigation/HeaderRight";
import BackButton from "@components/navigation/BackButton";
import type { RootStackParamList } from "./types";
import { theme as appTheme } from "@constants/theme";

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [loading, setLoading] = React.useState(true);
  const [hasOnboarded, setHasOnboarded] = React.useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem("onboardingComplete");
        setHasOnboarded(value === "true");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: appTheme.colors.backgroundDark }}>
        <ActivityIndicator size="large" color={appTheme.colors.orange} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={hasOnboarded ? "MainTabs" : "Onboarding"}
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: appTheme.colors.surfaceDark },
        headerTintColor: appTheme.colors.text.inverse,
        headerRight: () => <HeaderRight />,
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{
          title: "Welcome",
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "Login",
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={RegisterScreen}
        options={{
          title: "Create Account",
        }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          title: "Your Brand",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="Processing"
        component={ProcessingScreen}
        options={{
          title: "Processing",
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="Results"
        component={AnalysisResultsScreen}
        options={{
          title: "Results",
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="Tutorial"
        component={TutorialScreen}
        options={{
          title: "Tutorial",
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="UserHistory"
        component={HistoryScreen}
        options={{
          title: "History",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
        }}
      />
      <Stack.Screen
        name="TryOn"
        component={VirtualTryOnScreen}
        options={{
          title: "Try On",
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{
          title: "Order History",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: "About Glowverse",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          gestureEnabled: true
        }}
      />
    </Stack.Navigator>
  );
}
