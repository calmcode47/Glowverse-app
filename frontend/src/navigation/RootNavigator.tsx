import React from "react";
import { View } from "react-native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MainTabNavigator from "./MainTabNavigator";
import OnboardingScreen from "@screens/auth/OnboardingScreen";
import LoginScreen from "@screens/auth/LoginScreen";
import RegisterScreen from "@screens/auth/RegisterScreen";
import TutorialScreen from "@screens/onboarding/TutorialScreen";
import ProductDetailScreen from "@screens/shop/ProductDetailScreen";
import CategoryScreen from "@screens/shop/CategoryScreen";
import HistoryScreen from "@screens/history/HistoryScreen";
import AboutScreen from "@screens/profile/AboutScreen";
import CartScreen from "../screens/shop/CartScreen";
import SearchScreen from "../screens/search/SearchScreen";
import TryOnHistoryScreen from "@screens/ar/TryOnHistoryScreen";
import { ActivityIndicator } from "react-native-paper";
import HeaderRight from "@components/navigation/HeaderRight";
import BackButton from "@components/navigation/BackButton";
import type { RootStackParamList } from "./types";
import { theme as appTheme } from "@constants/theme";
import CheckoutScreen from "@screens/shop/CheckoutScreen";
import OrderConfirmationScreen from "@screens/shop/OrderConfirmationScreen";
import EditProfileScreen from "@screens/profile/EditProfileScreen";
import AddressesScreen from "@screens/profile/AddressesScreen";
import EditAddressScreen from "@screens/profile/EditAddressScreen";
import { useAuth } from "@context/AuthContext";
import React, { Suspense } from "react";
import LazyScreenLoading from "@components/loading/LazyScreenLoading";
import LazyLoadErrorBoundary from "@components/error/LazyLoadErrorBoundary";
import { lazyLoad } from "@utils/lazyLoad";

const OrderHistoryScreen = lazyLoad(() => import("@screens/profile/OrderHistoryScreen"));
const OrderDetailScreen = lazyLoad(() => import("@screens/profile/OrderDetailScreen"));
const AnalysisHistoryScreen = lazyLoad(() => import("@screens/analysis/AnalysisHistoryScreen"));
const AnalysisResultsScreen = lazyLoad(() => import("@screens/analysis/AnalysisResultsScreen"));
const SettingsScreen = lazyLoad(() => import("@screens/profile/SettingsScreen"));
const NotificationsScreen = lazyLoad(() => import("@screens/notifications/NotificationsScreen"));
const PromotionsScreen = lazyLoad(() => import("@screens/shop/PromotionsScreen"));
const ReferralScreen = lazyLoad(() => import("@screens/profile/ReferralScreen"));
const VirtualTryOnScreen = lazyLoad(() => import("@screens/ar/VirtualTryOnScreen"));
const SkinAnalysisScreen = lazyLoad(() => import("@screens/analysis/SkinAnalysisScreen"));
const AnalysisProcessingScreen = lazyLoad(() => import("@screens/analysis/AnalysisProcessingScreen"));

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [loading, setLoading] = React.useState(true);
  const [hasOnboarded, setHasOnboarded] = React.useState<boolean>(false);
  const { isAuthenticated, isLoading } = useAuth();

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

  if (loading || isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: appTheme.colors.backgroundDark }}>
        <ActivityIndicator size="large" color={appTheme.colors.orange} />
      </View>
    );
  }

  return (
    <LazyLoadErrorBoundary>
      <Suspense fallback={<LazyScreenLoading />}>
    <Stack.Navigator
      initialRouteName={!hasOnboarded ? "Onboarding" : isAuthenticated ? "MainTabs" : "Login"}
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: appTheme.colors.surfaceDark },
        headerTintColor: appTheme.colors.text.inverse,
        headerRight: () => <HeaderRight />,
        headerLeft: () => <BackButton />,
      }}
    >
      {!isAuthenticated ? (
        <>
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
        </>
      ) : (
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{
            title: "Your Brand",
            headerShown: false,
          }}
        />
      )}
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
        name="Category"
        component={CategoryScreen}
        options={{
          title: "Categories",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          gestureEnabled: true
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
        name="TryOnHistory"
        component={TryOnHistoryScreen}
        options={{
          title: "Try-On History",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          title: "Checkout",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{
          title: "Order Confirmed",
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{
          title: "Order Details",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="SkinAnalysis"
        component={SkinAnalysisScreen}
        options={{
          title: "Skin Analysis",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
        }}
      />
      <Stack.Screen
        name="AnalysisProcessing"
        component={AnalysisProcessingScreen}
        options={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS
        }}
      />
      <Stack.Screen
        name="AnalysisResults"
        component={AnalysisResultsScreen}
        options={{
          title: "Results",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
        }}
      />
      <Stack.Screen
        name="AnalysisHistory"
        component={AnalysisHistoryScreen}
        options={{
          title: "Analysis History",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: "Edit Profile",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
        }}
      />
      <Stack.Screen
        name="Addresses"
        component={AddressesScreen}
        options={{
          title: "Addresses",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
        }}
      />
      <Stack.Screen
        name="EditAddress"
        component={EditAddressScreen}
        options={{
          title: "Edit Address",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
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
        name="Promotions"
        component={PromotionsScreen}
        options={{
          title: "Promotions",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="Referrals"
        component={ReferralScreen}
        options={{
          title: "Refer & Earn",
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
      </Suspense>
    </LazyLoadErrorBoundary>
  );
}
