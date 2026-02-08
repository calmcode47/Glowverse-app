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
  ProductDetail: { productId: string };
  Results: { imageUri?: string } | undefined;
  Settings: undefined;
  Tutorial: undefined;
  Fitness: undefined;
  GroomingGuide: undefined;
  Orders: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
