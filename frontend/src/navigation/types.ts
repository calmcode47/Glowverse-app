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
  Results: { imageUri?: string } | undefined;
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
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
