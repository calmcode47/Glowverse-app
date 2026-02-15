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
  Category: { categoryId?: string; categoryName?: string };
  Processing: { analysisId?: string; tryOnId?: string; imageUri?: string };
  Results: { imageUri?: string } | undefined;
  TryOn: undefined;
  TryOnHistory: undefined;
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
  Checkout: undefined;
  OrderTracking: { orderId: string };
  OrderDetail: { orderId: string };
  OrderConfirmation: { orderId: string };
  Admin: undefined;
  Referrals: undefined;
  AdvancedFilters: { currentFilters: any };
  ARTryOn: { productId: string };
  FitnessDashboard: undefined;
  NotificationPreferences: undefined;
  PaymentNetworkError: undefined;
  PaymentDeclined: { reason?: string };
  PaymentProcessingError: { error?: string };
  Payment3DSError: undefined;
  PaymentFraud: undefined;
  PaymentTimeout: undefined;
  PaymentGenericError: { error?: string };
  SkinAnalysis: undefined;
  AnalysisProcessing: undefined;
  AnalysisResults: { results: any };
  AnalysisHistory: undefined;
  EditProfile: undefined;
  Addresses: undefined;
  EditAddress: { address?: any };
  Promotions: { code?: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
