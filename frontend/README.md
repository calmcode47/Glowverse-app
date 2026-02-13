# Glowverse Frontend - React Native Mobile App

[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo%20SDK-54-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

Cross-platform mobile application for the Glowverse AI/AR beauty platform. Built with React Native and Expo for iOS, Android, and Web. Features 76+ reusable components, 30+ screens, advanced animations, and AR-powered virtual try-on experiences.

---

## 📊 Status

| Area | Status | Details |
|------|--------|---------|
| Components | ✅ 76+ | 12 component categories |
| Screens | ✅ 30+ | 17 screen categories |
| Navigation | ✅ Setup | React Navigation 7 |
| Theming | ✅ Done | Custom design system |
| API Integration | ⚠️ Partial | Axios API client scaffolded |
| State Management | ⚠️ Planned | Context + hooks pattern |
| Testing | ⚠️ Scaffolded | Jest + Testing Library configured |
| AR Features | ⚠️ Planned | Camera + face detection ready |

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on specific platform
npm run web        # Web browser
npm run ios        # iOS Simulator (macOS only)
npm run android    # Android emulator
```

**App running at:** `http://localhost:8081`

---

## 📁 Project Structure

```
frontend/
├── App.tsx                    # App entry point
├── index.ts                   # Expo entry
├── src/
│   ├── components/            # 76+ reusable components
│   │   ├── animated/          # Animated wrappers
│   │   ├── animations/        # Animation components
│   │   ├── ar/                # AR/camera overlays
│   │   ├── camera/            # Camera components
│   │   ├── common/            # Shared UI (buttons, cards, modals)
│   │   ├── history/           # History/timeline components
│   │   ├── home/              # Home screen widgets
│   │   ├── navigation/        # Navigation components
│   │   ├── products/          # Product cards, lists
│   │   ├── profile/           # Profile components
│   │   ├── results/           # Analysis result views
│   │   └── ui/                # Base UI primitives
│   ├── screens/               # 30+ screens
│   │   ├── auth/              # Login, register, forgot password
│   │   ├── home/              # Home, dashboard
│   │   ├── shop/              # Product catalog, details, cart
│   │   ├── ar/                # Virtual try-on, camera
│   │   ├── analysis/          # Skin analysis
│   │   ├── fitness/           # Activity tracking, goals
│   │   ├── guide/             # Beauty tutorials
│   │   ├── profile/           # User profile, settings
│   │   ├── search/            # Global search
│   │   ├── notifications/     # Notification center
│   │   ├── promotions/        # Promo codes, offers
│   │   ├── wishlist/          # Saved products
│   │   ├── history/           # Order & scan history
│   │   ├── results/           # Analysis results
│   │   ├── stats/             # Statistics & analytics
│   │   ├── camera/            # Camera screen
│   │   └── onboarding/        # First-launch onboarding
│   ├── navigation/            # React Navigation config
│   ├── services/              # API client layer
│   ├── hooks/                 # Custom React hooks
│   ├── context/               # React context providers
│   ├── config/                # App configuration
│   ├── constants/             # App constants
│   ├── theme/                 # Design system & colors
│   ├── data/                  # Static/mock data
│   └── utils/                 # Utility functions
├── assets/                    # Images, fonts, Lottie animations
├── types/                     # TypeScript type definitions
├── __tests__/                 # Test files
├── app.json                   # Expo configuration
├── eas.json                   # EAS Build configuration
├── babel.config.js            # Babel with module resolver
├── tsconfig.json              # TypeScript configuration
└── jest.config.js             # Jest test configuration
```

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81 | Mobile framework |
| Expo SDK | 54 | Development & build platform |
| TypeScript | 5.9 | Type safety |
| React Navigation | 7 | Routing & navigation |
| React Native Paper | 5 | Material Design components |
| React Native Reanimated | 4.1 | Smooth animations |
| React Native Gesture Handler | 2.28 | Touch gestures |
| Expo Camera | 17 | Camera access |
| Expo Image Picker | 17 | Photo selection |
| Expo Linear Gradient | 15 | Gradient backgrounds |
| Expo Blur | 15 | Blur effects |
| Lottie React Native | 7.3 | Lottie animations |
| Axios | 1.13 | HTTP client |
| AsyncStorage | 2.2 | Local data persistence |

---

## 🧪 Testing

```bash
npm test          # Run tests with jest-expo
```

**Test setup:** Jest 30 + @testing-library/react-native

---

## 📱 Build & Deploy

### Development
```bash
npm start         # Start Expo dev server
```

### EAS Build (Production)
```bash
npx eas build --platform ios
npx eas build --platform android
```

### EAS Submit
```bash
npx eas submit --platform ios
npx eas submit --platform android
```

> See `eas.json` for build profiles (development, preview, production).

---

## 🔐 Environment

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
EXPO_PUBLIC_PERFECTCORP_API_KEY=your-api-key
```

---

## 🎨 Design System

- **Theming:** Custom design tokens in `src/theme/`
- **Colors:** Curated palette with light/dark mode support
- **Typography:** Modern font system
- **Animations:** Reanimated-powered micro-interactions
- **Components:** Premium glassmorphism, gradients, parallax effects

---

## 🗺️ Roadmap

- [ ] Complete API integration layer
- [ ] Implement state management (Context + hooks)
- [ ] Connect all screens to backend
- [ ] Form validation with Zod
- [ ] Offline mode with data caching
- [ ] Push notifications (Expo Notifications)
- [ ] AR camera integration
- [ ] Component testing
- [ ] Performance optimization
- [ ] App Store / Play Store submission

---

*Last Updated: February 13, 2026*
