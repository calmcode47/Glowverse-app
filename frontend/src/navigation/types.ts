import { NavigatorScreenParams } from "@react-navigation/native";

export type RootTabParamList = {
  HomeTab: undefined;
  CameraTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<RootTabParamList>;
  Results: { imageUri?: string } | undefined;
  Settings: undefined;
  Tutorial: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
