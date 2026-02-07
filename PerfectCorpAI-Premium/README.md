# PerfectCorpAI Premium

A premium Expo React Native application featuring AI-driven skin analysis, virtual try-on, advanced animations, and a polished design system. Built with TypeScript, Zustand for state management, and a robust API integration layer.

## Highlights
- Design System: tokens for colors, typography, spacing, shadows, gradients, animations
- API Layer: Axios client with interceptors, retry, and secure token storage
- State Management: Auth, Camera, Analysis, and UI stores via Zustand
- Premium UI: gradient buttons, glass buttons, animated cards, skeletons
- Advanced Animations: particle system, morphing blob backgrounds
- Camera System: face guide overlay, mode selector, controls, analysis integration
- Personalized Home: hero section, feature shortcuts, recent feed, trending looks
- Results Visualization: charts, metrics, concerns, product recommendations

## Tech Stack
- Expo SDK 54, React Native 0.81
- TypeScript
- Zustand
- Axios
- Reanimated, expo-linear-gradient, expo-blur, react-native-svg
- React Navigation

## Getting Started
1. Install dependencies
   ```bash
   npm install
   ```
2. Start the app
   ```bash
   npm run start         # Expo dev server
   npm run ios           # iOS simulator
   npm run android       # Android emulator
   npm run web           # Web (experimental)
   ```
3. Typecheck
   ```bash
   npm run typecheck
   ```

## Configuration
- Base API URL and endpoints: `src/constants/api-endpoints.ts`
- Secure tokens: `src/services/storage/secure-storage.ts`
- Path aliases: `tsconfig.json` and `babel.config.js` allow `@/…` imports

## Backend Integration
- Environment
  - Create a `.env` file at project root with:
    ```
    API_BASE_URL_DEV=http://<your-lan-ip>:<port>/api/v1
    API_BASE_URL_PROD=https://your-api.example.com/api/v1
    ```
  - The app reads these via `app.config.js` and injects to Expo config extras.
- Base URL Resolution
  - Dev mode uses `extra.apiBaseUrlDev`
  - Production uses `extra.apiBaseUrlProd`
  - Fallbacks exist to LAN and sample prod URL if envs are missing
- Health Check
  - On Home, the app pings `/health` and shows a toast on success/failure
  - Endpoint paths are defined in `src/constants/api-endpoints.ts`
- Services
  - Auth: `src/services/api/auth.api.ts`
  - Analysis: `src/services/api/analysis.api.ts`
  - Try-On: `src/services/api/tryon.api.ts`
  - Axios client with interceptors and token refresh: `src/services/api/client.ts`
    - Access token attached on requests
    - 401 triggers refresh sequence
    - Network errors return friendly messages

## Key Modules
- Design System: `src/design-system/` and `src/design-system/tokens/`
- API Services: `src/services/api/` (auth, analysis, try-on)
- Stores: `src/stores/` (auth, camera, analysis, ui)
- Components:
  - Buttons: `src/components/core/buttons/`
  - Cards: `src/components/core/cards/`
  - Animations: `src/components/advanced/animations/`
  - Camera: `src/components/camera/`
  - Home: `src/components/home/`
- Screens:
  - Main: `src/screens/main/` (Home, Camera)
  - Features: `src/screens/features/` (AnalysisResults)

## Development Notes
- Animations use Reanimated to ensure smooth 60fps performance
- Haptic feedback via `expo-haptics`
- Face detection integration via `expo-camera`
- Use `ParticleSystem` and `MorphingBlob` for premium background effects
- For Expo Go device connectivity, start your backend on LAN and set `API_BASE_URL_DEV` to your machine IP

## Contributing
Pull requests are welcome. Ensure typecheck passes and follow the project’s coding style and alias imports.

## License
Proprietary – internal use.
