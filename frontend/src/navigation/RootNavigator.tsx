import React from "react";
import { View } from "react-native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MainTabNavigator from "./MainTabNavigator";
import OnboardingScreen from "@screens/onboarding/OnboardingScreen";
import AnalysisResultsScreen from "@screens/results/AnalysisResultsScreen";
import SettingsScreen from "@screens/profile/SettingsScreen";
import TutorialScreen from "@screens/onboarding/TutorialScreen";
import { ActivityIndicator, useTheme } from "react-native-paper";
import HeaderRight from "@components/navigation/HeaderRight";
import BackButton from "@components/navigation/BackButton";
import type { RootStackParamList } from "./types";

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const theme = useTheme();
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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={hasOnboarded ? "MainTabs" : "Onboarding"}
      screenOptions={{
        headerTitleAlign: "center",
        headerRight: () => <HeaderRight />,
        headerLeft: () => <BackButton />
      }}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{
          title: "Welcome",
          headerLeft: () => null
        }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          title: "PerfectCorpAI",
          headerShown: false
        }}
      />
      <Stack.Screen
        name="Results"
        component={AnalysisResultsScreen}
        options={{
          title: "Results",
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="Tutorial"
        component={TutorialScreen}
        options={{
          title: "Tutorial",
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
          gestureEnabled: true
        }}
      />
    </Stack.Navigator>
  );
}
