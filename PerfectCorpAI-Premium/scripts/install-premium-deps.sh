#!/usr/bin/env bash
set -euo pipefail

echo "Installing core navigation dependencies..."
npx expo install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

echo "Installing animations and graphics..."
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install @shopify/react-native-skia
npx expo install lottie-react-native
npm install @rive-app/react-native
npm install moti

echo "Installing camera and media..."
npx expo install expo-camera expo-image-picker expo-media-library
npm install react-native-vision-camera

echo "Installing UI and design packages..."
npm install react-native-linear-gradient
npm install react-native-svg
npm install react-native-animatable
npm install react-native-paper
npm install react-native-elements
npm install @react-native-community/blur

echo "Installing state management and networking..."
npm install zustand
npm install @tanstack/react-query
npm install axios

echo "Installing utilities..."
npx expo install expo-haptics expo-blur expo-linear-gradient
npx expo install @react-native-async-storage/async-storage
npx expo install expo-secure-store
npm install date-fns
npm install react-hook-form
npm install zod

echo "Installing animation utilities..."
npm install react-native-redash
npm install react-native-animatable

echo "Installing performance packages..."
npx expo install expo-image
npm install @shopify/flash-list
npm install react-native-fast-image

echo "Installing dev dependencies..."
npm install -D babel-plugin-module-resolver typescript @types/react @types/react-native

echo "Installing build properties plugin to enable new architecture..."
npm install expo-build-properties

echo \"Installing custom dev client to support native modules...\"
npx expo install expo-dev-client

echo "Dependencies installed."
