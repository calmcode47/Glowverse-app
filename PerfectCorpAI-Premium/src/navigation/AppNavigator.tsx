import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '@screens/main/HomeScreen';
import { CameraScreen } from '@screens/main/CameraScreen';
import { AnalysisResultsScreen } from '@screens/features/AnalysisResultsScreen';
import VirtualTryOnScreen from '@screens/features/VirtualTryOnScreen';
import { FitnessGroomingDashboard } from '@screens/features/FitnessGroomingDashboard';
import { MensProductCatalog } from '@screens/features/MensProductCatalog';
import { MensAccessoriesScreen } from '@screens/features/MensAccessoriesScreen';
import { PerformanceDashboard } from '@screens/features/PerformanceDashboard';
import { MensShopHomeScreen } from '@screens/features/MensShopHomeScreen';
import { MensProductDetailsScreen } from '@screens/features/MensProductDetailsScreen';
import { BrandDashboardScreen } from '@screens/features/BrandDashboardScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="BrandDashboard" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="AnalysisResults" component={AnalysisResultsScreen} />
      <Stack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
      <Stack.Screen name="FitnessGrooming" component={FitnessGroomingDashboard} />
      <Stack.Screen name="MensCatalog" component={MensProductCatalog} />
      <Stack.Screen name="MensAccessories" component={MensAccessoriesScreen} />
      <Stack.Screen name="PerformanceDashboard" component={PerformanceDashboard} />
      <Stack.Screen name="MensShopHome" component={MensShopHomeScreen} />
      <Stack.Screen name="MensProductDetails" component={MensProductDetailsScreen} />
      <Stack.Screen name="BrandDashboard" component={BrandDashboardScreen} />
    </Stack.Navigator>
  );
}
