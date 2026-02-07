import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from '@navigation/AppNavigator';
import { ThemeModeProvider, useThemeMode } from '@design-system/theme-mode';

function Root() {
  const { mode } = useThemeMode();
  return (
    <>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeModeProvider>
        <Root />
      </ThemeModeProvider>
    </SafeAreaProvider>
  );
}
