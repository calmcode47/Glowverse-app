import React, { Suspense } from "react";
import { View } from "react-native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MainTabNavigator from "./MainTabNavigator";
import OnboardingScreen from "@screens/auth/OnboardingScreen";
import LoginScreen from "@screens/auth/LoginScreen";
import RegisterScreen from "@screens/auth/RegisterScreen";
import TutorialScreen from "@screens/onboarding/TutorialScreen";
import HistoryScreen from "@screens/history/HistoryScreen";
import AboutScreen from "@screens/profile/AboutScreen";
import { ActivityIndicator } from "react-native-paper";
import HeaderRight from "@components/navigation/HeaderRight";
import BackButton from "@components/navigation/BackButton";
import type { RootStackParamList } from "./types";
import { theme as appTheme } from "@constants/theme";
import OrderConfirmationScreen from "@screens/shop/OrderConfirmationScreen";
import EditProfileScreen from "@screens/profile/EditProfileScreen";
import AddressesScreen from "@screens/profile/AddressesScreen";
import EditAddressScreen from "@screens/profile/EditAddressScreen";
import { useAuth } from "../context/AuthContext";
import LazyScreenLoading from "@components/loading/LazyScreenLoading";
import LazyLoadErrorBoundary from "@components/error/LazyLoadErrorBoundary";
import { lazyLoad } from "@utils/lazyLoad";
import PaymentNetworkErrorScreen from "@screens/payments/PaymentNetworkErrorScreen";
import PaymentDeclinedScreen from "@screens/payments/PaymentDeclinedScreen";
import PaymentProcessingErrorScreen from "@screens/payments/PaymentProcessingErrorScreen";
import Payment3DSErrorScreen from "@screens/payments/Payment3DSErrorScreen";
import PaymentFraudScreen from "@screens/payments/PaymentFraudScreen";
import PaymentTimeoutScreen from "@screens/payments/PaymentTimeoutScreen";
import PaymentGenericErrorScreen from "@screens/payments/PaymentGenericErrorScreen";

const OrderHistoryScreen = lazyLoad(() => import("@screens/profile/OrderHistoryScreen"));
const OrderDetailScreen = lazyLoad(() => import("@screens/profile/OrderDetailScreen"));
const OrderTrackingScreen = lazyLoad(() => import("@screens/orders/OrderTrackingScreen"));
const AnalysisHistoryScreen = lazyLoad(() => import("@screens/analysis/AnalysisHistoryScreen"));
const AnalysisResultsScreen = lazyLoad(() => import("@screens/analysis/AnalysisResultsScreen"));
const HistoryDashboardScreen = lazyLoad(() => import("@screens/history/HistoryDashboardScreen"));
const FitnessActivityDetail = lazyLoad(() => import("@screens/fitness/FitnessActivityDetail"));
const ARSessionDetail = lazyLoad(() => import("@screens/ar/ARSessionDetail"));
const SettingsScreen = lazyLoad(() => import("@screens/profile/SettingsScreen"));
const NotificationsScreen = lazyLoad(() => import("@screens/notifications/NotificationsScreen"));
const PromotionsScreen = lazyLoad(() => import("@screens/shop/PromotionsScreen"));
const ReferralDashboardScreen = lazyLoad(() => import("@screens/referrals/ReferralDashboardScreen"));
const VirtualTryOnScreen = lazyLoad(() => import("@screens/ar/VirtualTryOnScreen"));
const ARTryOnScreen = lazyLoad(() => import("@screens/tryon/ARTryOnScreen"));
const FitnessDashboardScreen = lazyLoad(() => import("@screens/fitness/FitnessDashboardScreen"));
const TipsDetailScreen = lazyLoad(() => import("@screens/tips/TipsDetailScreen"));
const EliteAccessScreen = lazyLoad(() => import("@screens/elite/EliteAccessScreen"));
const NotificationPreferencesScreen = lazyLoad(() => import("@screens/settings/NotificationPreferencesScreen"));
const AdvancedFiltersScreen = lazyLoad(() => import("@screens/shop/AdvancedFiltersScreen"));
const SkinAnalysisScreen = lazyLoad(() => import("@screens/analysis/SkinAnalysisScreen"));
const AnalysisProcessingScreen = lazyLoad(() => import("@screens/analysis/AnalysisProcessingScreen"));
const ProductDetailScreen = lazyLoad(() => import("@screens/shop/ProductDetailScreen"));
const CartScreen = lazyLoad(() => import("@screens/shop/CartScreen"));
const SearchScreen = lazyLoad(() => import("@screens/search/SearchScreen"));
const CheckoutScreen = lazyLoad(() => import("@screens/shop/CheckoutScreen"));
const CategoryScreen = lazyLoad(() => import("@screens/shop/CategoryScreen"));
const TryOnHistoryScreen = lazyLoad(() => import("@screens/ar/TryOnHistoryScreen"));
const AdminNavigator = lazyLoad(() => import("./AdminNavigator"));

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
          initialRouteName={"MainTabs"}
          screenOptions={{
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: "#FFFFFF" },
            headerTintColor: "#1E2A3B",
            headerRight: () => <HeaderRight />,
            headerLeft: () => <BackButton />,
          }}
        >
          <Stack.Screen
            name="MainTabs"
            component={MainTabNavigator}
            options={{
              title: "Glowverse",
              headerShown: false,
            }}
          />
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
            component={AnalysisProcessingScreen}
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
            name="HistoryDashboard"
            component={HistoryDashboardScreen}
            options={{
              title: "History",
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              gestureEnabled: true
            }}
          />
          <Stack.Screen
            name="FitnessActivityDetail"
            component={FitnessActivityDetail}
            options={{
              title: "Fitness Activity",
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              gestureEnabled: true
            }}
          />
          <Stack.Screen
            name="ARSessionDetail"
            component={ARSessionDetail}
            options={{
              title: "AR Session",
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              gestureEnabled: true
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
            name="PaymentNetworkError"
            component={PaymentNetworkErrorScreen}
            options={{ title: "Network Error" }}
          />
          <Stack.Screen
            name="PaymentDeclined"
            component={PaymentDeclinedScreen}
            options={{ title: "Payment Declined" }}
          />
          <Stack.Screen
            name="PaymentProcessingError"
            component={PaymentProcessingErrorScreen}
            options={{ title: "Processing Error" }}
          />
          <Stack.Screen
            name="Payment3DSError"
            component={Payment3DSErrorScreen}
            options={{ title: "Authentication Error" }}
          />
          <Stack.Screen
            name="PaymentFraud"
            component={PaymentFraudScreen}
            options={{ title: "Security Check" }}
          />
          <Stack.Screen
            name="PaymentTimeout"
            component={PaymentTimeoutScreen}
            options={{ title: "Timeout" }}
          />
          <Stack.Screen
            name="PaymentGenericError"
            component={PaymentGenericErrorScreen}
            options={{ title: "Payment Error" }}
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
            name="OrderTracking"
            component={OrderTrackingScreen}
            options={{
              title: "Track Order",
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
            name="TipsDetail"
            component={TipsDetailScreen}
            options={{
              title: "Daily Tip",
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
            }}
          />
          <Stack.Screen
            name="EliteAccess"
            component={EliteAccessScreen}
            options={{
              title: "Elite Access",
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
            }}
          />
          <Stack.Screen
            name="Referrals"
            component={ReferralDashboardScreen}
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
          <Stack.Screen
            name="Admin"
            component={AdminNavigator}
            options={{
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              gestureEnabled: true
            }}
          />
          <Stack.Screen
            name="AdvancedFilters"
            component={AdvancedFiltersScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
              gestureEnabled: true
            }}
          />
          <Stack.Screen
            name="ARTryOn"
            component={ARTryOnScreen}
            options={{
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              gestureEnabled: false
            }}
          />
          <Stack.Screen
            name="FitnessDashboard"
            component={FitnessDashboardScreen}
            options={{
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
            }}
          />
          <Stack.Screen
            name="NotificationPreferences"
            component={NotificationPreferencesScreen}
            options={{
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
            }}
          />
        </Stack.Navigator>
      </Suspense>
    </LazyLoadErrorBoundary>
  );
}
