# Glowverse Mobile

Glowverse is a premium mobile experience built with **React Native** and **Expo SDK 52**. It combines advanced AI-driven skin analysis with augmented reality (AR) virtual try-on features to create an immersive shopping experience.

## 🌟 Key Features

*   **AI Skin Analysis**: Real-time skin scanning and analysis via **Perfect Corp AI**, providing scores for hydration, clarity, and texture.
*   **Virtual Try-On (AR)**: High-fidelity AR makeup application for lipsticks, eyeshadows, and more using individual product profiles.
*   **Premium Visuals**: 
    *   **Parallax Backgrounds**: Dynamic depth effects that react to scrolling.
    *   **Scroll Reveal**: Sophisticated entrance animations for UI elements.
    *   **Modern Design**: Glassmorphic elements, vibrant gradients, and professional typography.
*   **Market Trends**: Integrated price tracking graphs and "Live" market trend indicators for luxury products.

## 🚀 Startup Guide

Before starting, ensure you have installed the dependencies:
```bash
cd frontend
npm install
```

### 📱 Launch Options

| Platform | Command | Description |
| :--- | :--- | :--- |
| **Web** | `npm run web` | Launches the app in your default browser. |
| **iOS** | `npm run ios` | Opens the app in the iOS Simulator (macOS only) or prompts for Expo Go on a physical device. |
| **Android** | `npm run android` | Opens the app in an Android Emulator or prompts for Expo Go on a physical device. |

> [!TIP]
> For physical devices, download the **Expo Go** app from the App Store or Play Store and scan the QR code generated in your terminal after running `npm start`.

### 🔧 Environment
- API base:
  - Set `API_BASE_URL` via `app.json` extra or environment (web)
  - Defaults to `http://localhost:5000`
  - Runtime override: AsyncStorage key `apiBaseUrl` (used by the Axios client)
- Perfect Corp:
  - `PERFECT_CORP_API_KEY` in `app.json` extra if needed for direct mobile usage

## 🛠️ Utilities & Helpers (`src/utils/`)

The application includes a suite of robust utility functions to handle common logic:

*   **`permissions.ts`**: Centralized management for Camera and Media Library permissions.
*   **`imageProcessor.ts`**: Handles image cropping, compression, and base64 conversion for AI analysis.
*   **`storage.ts`**: Wrapper for `AsyncStorage` to manage persistent local data (User preferences, saved looks).
*   **`apiHelper.ts`**: Configures Axios instances with standard headers and error handling.
*   **`errorHandler.ts`**: Standardized service for catching and displaying user-friendly errors via Toasts.
*   **`validation.ts`**: Reusable logic for validating product data, user inputs, and API responses.
*   **`formatting.ts`**: Helper functions for currency conversion, date formatting, and text truncation.
*   **`logger.ts`**: Enhanced console logging for debugging state changes and API lifecycle.

## 🏗️ Project Structure

*   `src/components/animations/`: Custom `Reanimated` wrappers for high-performance UI motion.
*   `src/screens/`: Feature-grouped screens (AR, Shop, Results, Profile).
*   `src/services/api/`: Typed API clients for third-party and internal backend services.
*   `src/context/`: Global state providers for AI results, theme, and camera session.
*   `src/theme/`: Shared design system (colors, spacing, shadows).

## 🧪 Testing & Quality

*   **Unit Tests**: `npm test`
*   **Type Safety**: `npx tsc --noEmit`
