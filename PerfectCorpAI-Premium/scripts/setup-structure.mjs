import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'src');

const dirs = [
  'design-system/tokens',
  'components/core/buttons',
  'components/core/cards',
  'components/core/inputs',
  'components/core/feedback',
  'components/advanced/animations',
  'components/advanced/3d',
  'components/advanced/ar',
  'components/camera',
  'components/home',
  'components/analysis',
  'components/tryon',
  'components/navigation',
  'screens/auth',
  'screens/main',
  'screens/features',
  'navigation',
  'services/api',
  'services/storage',
  'services/camera',
  'stores',
  'hooks',
  'utils',
  'constants',
  'types',
  'assets/animations',
  'assets/images',
  'assets/fonts',
  'assets/videos'
];

const files = [
  ['design-system/tokens/colors.ts', `export const colors = {
  primary: '#7F5AF0',
  secondary: '#2CB67D',
  background: '#0F0F10',
  surface: '#121214',
  text: '#E6E6E6',
  muted: '#9BA1A6',
};\n`],
  ['design-system/tokens/typography.ts', `export const typography = {
  fontFamily: { regular: 'System', medium: 'System', bold: 'System' },
  size: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32 },
  lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.7 },
};\n`],
  ['design-system/tokens/spacing.ts', `export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};\n`],
  ['design-system/tokens/shadows.ts', `export const shadows = {
  sm: { elevation: 2 },
  md: { elevation: 6 },
  lg: { elevation: 12 },
};\n`],
  ['design-system/tokens/gradients.ts', `export const gradients = {
  primary: ['#7F5AF0', '#6246EA'],
  success: ['#2CB67D', '#249E6D'],
};\n`],
  ['design-system/tokens/animations.ts', `export const animations = {
  duration: { fast: 150, normal: 300, slow: 600 },
  easing: { inOut: 'easeInOut' },
};\n`],
  ['design-system/theme.ts', `import { colors } from './tokens/colors';
import { typography } from './tokens/typography';
import { spacing } from './tokens/spacing';
import { shadows } from './tokens/shadows';
import { gradients } from './tokens/gradients';
import { animations } from './tokens/animations';

export const theme = { colors, typography, spacing, shadows, gradients, animations };\n`],
  ['design-system/styled.ts', `export { theme } from './theme';\n`],

  ['components/core/buttons/PrimaryButton.tsx', `import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
type Props = { title: string; onPress?: () => void };
export default function PrimaryButton({ title, onPress }: Props) {
  return <TouchableOpacity onPress={onPress}><Text>{title}</Text></TouchableOpacity>;
}\n`],
  ['components/core/buttons/GlassButton.tsx', `import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
type Props = { title: string; onPress?: () => void };
export default function GlassButton({ title, onPress }: Props) {
  return <TouchableOpacity onPress={onPress}><Text>{title}</Text></TouchableOpacity>;
}\n`],
  ['components/core/buttons/FloatingButton.tsx', `import React from 'react';
import { TouchableOpacity } from 'react-native';
type Props = { onPress?: () => void };
export default function FloatingButton({ onPress }: Props) {
  return <TouchableOpacity onPress={onPress} />;
}\n`],
  ['components/core/buttons/PulseButton.tsx', `import React from 'react';
import { TouchableOpacity } from 'react-native';
type Props = { onPress?: () => void };
export default function PulseButton({ onPress }: Props) {
  return <TouchableOpacity onPress={onPress} />;
}\n`],

  ['components/core/cards/GlassCard.tsx', `import React from 'react';
import { View } from 'react-native';
export default function GlassCard() { return <View />; }\n`],
  ['components/core/cards/NeumorphicCard.tsx', `import React from 'react';
import { View } from 'react-native';
export default function NeumorphicCard() { return <View />; }\n`],
  ['components/core/cards/AnimatedCard.tsx', `import React from 'react';
import { View } from 'react-native';
export default function AnimatedCard() { return <View />; }\n`],

  ['components/core/inputs/AnimatedInput.tsx', `import React from 'react';
import { TextInput } from 'react-native';
export default function AnimatedInput() { return <TextInput />; }\n`],
  ['components/core/inputs/GlassInput.tsx', `import React from 'react';
import { TextInput } from 'react-native';
export default function GlassInput() { return <TextInput />; }\n`],
  ['components/core/inputs/FloatingLabel.tsx', `import React from 'react';
import { View } from 'react-native';
export default function FloatingLabel() { return <View />; }\n`],

  ['components/core/feedback/Toast.tsx', `import React from 'react';
import { View } from 'react-native';
export default function Toast() { return <View />; }\n`],
  ['components/core/feedback/Haptic.tsx', `export const haptic = { light: true };\n`],
  ['components/core/feedback/LoadingOverlay.tsx', `import React from 'react';
import { View } from 'react-native';
export default function LoadingOverlay() { return <View />; }\n`],
  ['components/core/feedback/Skeleton.tsx', `import React from 'react';
import { View } from 'react-native';
export default function Skeleton() { return <View />; }\n`],

  ['components/advanced/animations/ParticleSystem.tsx', `import React from 'react';
import { View } from 'react-native';
export default function ParticleSystem() { return <View />; }\n`],
  ['components/advanced/animations/RippleEffect.tsx', `import React from 'react';
import { View } from 'react-native';
export default function RippleEffect() { return <View />; }\n`],
  ['components/advanced/animations/MorphingBlob.tsx', `import React from 'react';
import { View } from 'react-native';
export default function MorphingBlob() { return <View />; }\n`],
  ['components/advanced/animations/FloatingElements.tsx', `import React from 'react';
import { View } from 'react-native';
export default function FloatingElements() { return <View />; }\n`],

  ['components/advanced/3d/Product3DViewer.tsx', `import React from 'react';
import { View } from 'react-native';
export default function Product3DViewer() { return <View />; }\n`],
  ['components/advanced/3d/Face3DModel.tsx', `import React from 'react';
import { View } from 'react-native';
export default function Face3DModel() { return <View />; }\n`],

  ['components/advanced/ar/AROverlay.tsx', `import React from 'react';
import { View } from 'react-native';
export default function AROverlay() { return <View />; }\n`],
  ['components/advanced/ar/FaceTracking.tsx', `import React from 'react';
import { View } from 'react-native';
export default function FaceTracking() { return <View />; }\n`],

  ['components/camera/CameraView.tsx', `import React from 'react';
import { View } from 'react-native';
export default function CameraView() { return <View />; }\n`],
  ['components/camera/CameraControls.tsx', `import React from 'react';
import { View } from 'react-native';
export default function CameraControls() { return <View />; }\n`],
  ['components/camera/FaceGuideOverlay.tsx', `import React from 'react';
import { View } from 'react-native';
export default function FaceGuideOverlay() { return <View />; }\n`],
  ['components/camera/BeautyFilters.tsx', `import React from 'react';
import { View } from 'react-native';
export default function BeautyFilters() { return <View />; }\n`],
  ['components/camera/RealtimePreview.tsx', `import React from 'react';
import { View } from 'react-native';
export default function RealtimePreview() { return <View />; }\n`],

  ['components/home/HeroSection.tsx', `import React from 'react';
import { View } from 'react-native';
export default function HeroSection() { return <View />; }\n`],
  ['components/home/FeatureCards.tsx', `import React from 'react';
import { View } from 'react-native';
export default function FeatureCards() { return <View />; }\n`],
  ['components/home/TrendingSection.tsx', `import React from 'react';
import { View } from 'react-native';
export default function TrendingSection() { return <View />; }\n`],
  ['components/home/PersonalizedFeed.tsx', `import React from 'react';
import { View } from 'react-native';
export default function PersonalizedFeed() { return <View />; }\n`],

  ['components/analysis/SkinAnalysisView.tsx', `import React from 'react';
import { View } from 'react-native';
export default function SkinAnalysisView() { return <View />; }\n`],
  ['components/analysis/ResultsVisualization.tsx', `import React from 'react';
import { View } from 'react-native';
export default function ResultsVisualization() { return <View />; }\n`],
  ['components/analysis/InteractiveChart.tsx', `import React from 'react';
import { View } from 'react-native';
export default function InteractiveChart() { return <View />; }\n`],
  ['components/analysis/BeforeAfterSlider.tsx', `import React from 'react';
import { View } from 'react-native';
export default function BeforeAfterSlider() { return <View />; }\n`],

  ['components/tryon/VirtualMakeupView.tsx', `import React from 'react';
import { View } from 'react-native';
export default function VirtualMakeupView() { return <View />; }\n`],
  ['components/tryon/ProductSelector.tsx', `import React from 'react';
import { View } from 'react-native';
export default function ProductSelector() { return <View />; }\n`],
  ['components/tryon/ColorPicker.tsx', `import React from 'react';
import { View } from 'react-native';
export default function ColorPicker() { return <View />; }\n`],
  ['components/tryon/IntensityControl.tsx', `import React from 'react';
import { View } from 'react-native';
export default function IntensityControl() { return <View />; }\n`],

  ['components/navigation/CustomTabBar.tsx', `import React from 'react';
import { View } from 'react-native';
export default function CustomTabBar() { return <View />; }\n`],
  ['components/navigation/AnimatedHeader.tsx', `import React from 'react';
import { View } from 'react-native';
export default function AnimatedHeader() { return <View />; }\n`],
  ['components/navigation/GestureNavigator.tsx', `import React from 'react';
import { View } from 'react-native';
export default function GestureNavigator() { return <View />; }\n`],

  ['screens/auth/WelcomeScreen.tsx', `import React from 'react';
import { View } from 'react-native';
export default function WelcomeScreen() { return <View />; }\n`],
  ['screens/auth/LoginScreen.tsx', `import React from 'react';
import { View } from 'react-native';
export default function LoginScreen() { return <View />; }\n`],
  ['screens/auth/RegisterScreen.tsx', `import React from 'react';
import { View } from 'react-native';
export default function RegisterScreen() { return <View />; }\n`],
  ['screens/auth/OnboardingScreen.tsx', `import React from 'react';
import { View } from 'react-native';
export default function OnboardingScreen() { return <View />; }\n`],

  ['screens/main/HomeScreen.tsx', `import React from 'react';
import { View } from 'react-native';
export default function HomeScreen() { return <View />; }\n`],
  ['screens/main/DiscoverScreen.tsx', `import React from 'react';
import { View } from 'react-native';
export default function DiscoverScreen() { return <View />; }\n`],
  ['screens/main/CameraScreen.tsx', `import React from 'react';
import { View } from 'react-native';
export default function CameraScreen() { return <View />; }\n`],
  ['screens/main/ProfileScreen.tsx', `import React from 'react';
import { View } from 'react-native';
export default function ProfileScreen() { return <View />; }\n`],
  ['screens/main/SettingsScreen.tsx', `import React from 'react';
import { View } from 'react-native';
export default function SettingsScreen() { return <View />; }\n`],

  ['screens/features/SkinAnalysisScreen.tsx', `import React from 'react';
import { View } from 'react-native';
export default function SkinAnalysisScreen() { return <View />; }\n`],
  ['screens/features/VirtualTryOnScreen.tsx', `import React from 'react';
import { View } from 'react-native';
export default function VirtualTryOnScreen() { return <View />; }\n`],
  ['screens/features/ResultsScreen.tsx', `import React from 'react';
import { View } from 'react-native';
export default function ResultsScreen() { return <View />; }\n`],
  ['screens/features/ProductDetailsScreen.tsx', `import React from 'react';
import { View } from 'react-native';
export default function ProductDetailsScreen() { return <View />; }\n`],
  ['screens/features/SavedLooksScreen.tsx', `import React from 'react';
import { View } from 'react-native';
export default function SavedLooksScreen() { return <View />; }\n`],
  ['screens/features/TutorialScreen.tsx', `import React from 'react';
import { View } from 'react-native';
export default function TutorialScreen() { return <View />; }\n`],

  ['navigation/AppNavigator.tsx', `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View } from 'react-native';
export default function AppNavigator() {
  return <NavigationContainer><View /></NavigationContainer>;
}\n`],
  ['navigation/AuthNavigator.tsx', `import React from 'react';
import { View } from 'react-native';
export default function AuthNavigator() { return <View />; }\n`],
  ['navigation/MainNavigator.tsx', `import React from 'react';
import { View } from 'react-native';
export default function MainNavigator() { return <View />; }\n`],
  ['navigation/types.ts', `export type RootStackParamList = { index?: undefined };\n`],

  ['services/api/client.ts', `export const client = {};\n`],
  ['services/api/auth.api.ts', `export const authApi = {};\n`],
  ['services/api/user.api.ts', `export const userApi = {};\n`],
  ['services/api/analysis.api.ts', `export const analysisApi = {};\n`],
  ['services/api/tryon.api.ts', `export const tryonApi = {};\n`],
  ['services/api/upload.api.ts', `export const uploadApi = {};\n`],
  ['services/storage/secure-storage.ts', `export const secureStorage = {};\n`],
  ['services/storage/async-storage.ts', `export const asyncStorage = {};\n`],
  ['services/camera/camera-service.ts', `export const cameraService = {};\n`],
  ['services/camera/image-processor.ts', `export const imageProcessor = {};\n`],

  ['stores/auth.store.ts', `export const authStore = {};\n`],
  ['stores/user.store.ts', `export const userStore = {};\n`],
  ['stores/camera.store.ts', `export const cameraStore = {};\n`],
  ['stores/analysis.store.ts', `export const analysisStore = {};\n`],
  ['stores/ui.store.ts', `export const uiStore = {};\n`],

  ['hooks/useAuth.ts', `export const useAuth = () => ({})\n`],
  ['hooks/useCamera.ts', `export const useCamera = () => ({})\n`],
  ['hooks/useAnimation.ts', `export const useAnimation = () => ({})\n`],
  ['hooks/useHaptic.ts', `export const useHaptic = () => ({})\n`],
  ['hooks/useKeyboard.ts', `export const useKeyboard = () => ({})\n`],
  ['hooks/useNetworkStatus.ts', `export const useNetworkStatus = () => ({})\n`],

  ['utils/validation.ts', `export const validation = {};\n`],
  ['utils/formatting.ts', `export const formatting = {};\n`],
  ['utils/image-processing.ts', `export const imageProcessing = {};\n`],
  ['utils/haptics.ts', `export const haptics = {};\n`],
  ['utils/animations-helpers.ts', `export const animationsHelpers = {};\n`],

  ['constants/config.ts', `export const config = {};\n`],
  ['constants/api-endpoints.ts', `export const apiEndpoints = {};\n`],
  ['constants/storage-keys.ts', `export const storageKeys = {};\n`],

  ['types/api.types.ts', `export type ApiResponse<T> = { data: T };\n`],
  ['types/navigation.types.ts', `export type NavigationTypes = { initial?: boolean };\n`],
  ['types/user.types.ts', `export type User = { id: string; name: string };\n`],
  ['types/analysis.types.ts', `export type AnalysisResult = { score: number };\n`],
];

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function main() {
  for (const d of dirs) {
    await ensureDir(path.join(root, d));
  }
  for (const [rel, content] of files) {
    const fp = path.join(root, rel);
    await ensureDir(path.dirname(fp));
    await writeFile(fp, content, 'utf8');
  }
}

main().catch((e) => {
  process.exitCode = 1;
});
