import { Product } from "../data/products";
import { NavigatorScreenParams } from "@react-navigation/native";

export type RootTabParamList = {
  HomeTab: undefined;
  ShopTab: undefined;
  CameraTab: undefined;
  WishlistTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: NavigatorScreenParams<RootTabParamList>;
  ProductDetail: { productId?: string; product?: Product };
  Processing: { analysisId?: string; tryOnId?: string; imageUri?: string };
  Results: { imageUri?: string } | undefined;
  TryOn: undefined;
  Settings: undefined;
  Tutorial: undefined;
  Fitness: undefined;
  GroomingGuide: undefined;
  OrderHistory: undefined;
  UserHistory: undefined;
  About: undefined;
  Cart: undefined;
  Search: undefined;
  Notifications: undefined;
  OrderTracking: { orderId: string };
  OrderDetail: { orderId: string };
  Admin: undefined;
  Referrals: undefined;
  AdvancedFilters: { currentFilters: any };
  ARTryOn: { productId: string };
  FitnessDashboard: undefined;
  NotificationPreferences: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
