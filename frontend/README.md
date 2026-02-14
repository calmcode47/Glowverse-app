# Glowverse Frontend — React Native Mobile App

[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo%20SDK-54-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

Cross‑platform mobile application for the Glowverse AI/AR beauty platform. Built with React Native and Expo for iOS, Android, and Web. Includes 76+ reusable components, 30+ screens, advanced animations, AR try‑on, AI analysis, robust testing, analytics, and offline capabilities.

---

## 📊 Status

| Area | Status | Details |
|------|--------|---------|
| Components | ✅ 76+ | 12 categories |
| Screens | ✅ 30+ | 17 categories |
| Navigation | ✅ Done | React Navigation 7 |
| Theming | ✅ Done | Custom design system (light/dark) |
| API Integration | ✅ Enhanced | Axios client + auth/refresh + backoff + dedupe |
| State | ✅ Done | Context + hooks |
| Analytics | ✅ Extended | Firebase events incl. wishlist/filters/payment/reviews |
| Offline | ✅ Done | Request queue, optimistic cart, caching |
| Testing | ✅ Done | Unit + Detox E2E |
| AR Features | ✅ Done | Virtual try‑on + capture |
| Performance | ✅ Optimized | Image preloading, FlatList tuning, lazy load |
| Accessibility | ✅ Improved | Labels, focus mgmt, touch targets |
| Build & Release | ✅ Configured | EAS profiles, CI for PR/production & budgets |

---

## ✨ Features

- Authentication with token refresh and secure storage
- Product catalog, detail pages with image galleries
- Cart and checkout with card, Apple Pay, Google Pay
- Promotions and order creation with order confirmation
- AR virtual try‑on flow with capture and overlays
- AI skin analysis screens and results
- Global search with filters and sorting
- Favorites, profile, addresses, orders
- Theming with design tokens and light/dark modes
- Deep links and universal links navigation
- Error boundaries and graceful network handling
- Analytics instrumentation
  - Screen views, product views, search, add/remove cart
  - Begin checkout and purchase events
  - AR start/complete and analysis start/complete
  - Share, referral, and promo events
  - New: wishlist add/remove, filter apply/remove/sort, notification received/opened/dismissed, payment method selected/added, review started/submitted
- Offline capabilities
  - AsyncStorage queue for non‑GET requests while offline
  - Automatic synchronization on reconnect with retry/backoff
  - Optimistic UI updates for cart
  - Product caching for offline detail view
- Testing
  - Jest unit tests with coverage thresholds
  - Detox E2E tests for shopping, profile/orders, AR/analysis

---

## 🚀 Quick Start

- Install dependencies: `npm install`
- Start dev server: `npm start`
- Run on platforms:
  - `npm run web`
  - `npm run ios`
  - `npm run android`

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
│   ├── services/              # API, analytics, offline
│   ├── hooks/                 # Custom React hooks
│   ├── context/               # React context providers
│   ├── config/                # App configuration
│   ├── constants/             # App constants
│   ├── theme/                 # Design system & colors
│   ├── data/                  # Static/mock data
│   └── utils/                 # Utility functions
├── assets/                    # Images, fonts, Lottie animations
├── app-store-assets/          # Store screenshots (device‑specific)
├── e2e/                       # Detox test suite & config
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
| NetInfo | 11.4 | Connectivity status |
| Firebase Analytics | 8 | Analytics and events |
| Stripe RN | 0.33 | Payments (card/Apple Pay/Google Pay) |
| Detox | 20 | E2E tests |

---

## 🧪 Testing

- Unit tests
  - Run: `npm test`
  - Coverage: `npm run test:coverage`
  - Framework: jest‑expo + @testing‑library/react‑native
  - Stable mocks for icons, navigation, SecureStore, Camera, Media Library, NetInfo
- End‑to‑End tests (Detox)
  - Build iOS: `npm run e2e:ios:build`
  - Test iOS: `npm run e2e:ios:test`
  - Build Android: `npm run e2e:android:build`
  - Test Android: `npm run e2e:android:test`
  - CI: `npm run e2e:test:ci`
  - Config: `.detoxrc.json`, `e2e/config.json`
  - Suites:
    - `e2e/shopping.e2e.js` — browse, add to cart, checkout, search, filter
    - `e2e/profile.e2e.js` — orders, order details, profile edit, addresses
    - `e2e/ar-analysis.e2e.js` — try‑on flow and skin analysis

**Coverage gates:** per‑file line thresholds for critical logic (e.g., auth context and cart API).

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

See also: [docs/EAS.md](./docs/EAS.md) for secrets, submit configuration, and CI.

### Useful Scripts
- Build (development): `npm run build:dev`
- Build (production): `npm run build:prod`
- Submit iOS: `npm run submit:ios`
- Submit Android: `npm run submit:android`
- Generate API types from OpenAPI (optional): `npm run types:api`
---

## 🔐 Configuration & Environment

### Expo config (app.json)
- Name/slug: Glowverse / glowverse
- iOS: `bundleIdentifier: com.glowverse.app`, `supportsTablet: false`, non‑exempt encryption false
- Android: `package: com.glowverse.app`, `versionCode: 1`, adaptive icon, permissions
- Icon/splash:
  - Icon: `assets/icon.png` (provide 1024×1024 PNG, no transparency)
  - Splash: `assets/splash-icon.png` (2048×2048 PNG, safe area)
- EAS project: set `extra.eas.projectId`
- Deep links: scheme `glowverse`, associated domains for iOS and intent filters for Android

### Environment variables
- API base URL, analytics ID, Sentry DSN, and Stripe keys are configured via `app.json` extras and the ENV layer.
- Example:
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
EXPO_PUBLIC_PERFECTCORP_API_KEY=your-api-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_***
EXPO_PUBLIC_SENTRY_DSN=https://***
```

---

## 🎨 Design System

- **Theming:** Custom design tokens in `src/theme/`
- **Colors:** Curated palette with light/dark mode support
- **Typography:** Modern font system
- **Animations:** Reanimated-powered micro-interactions
- **Components:** Premium glassmorphism, gradients, parallax effects

---

## 🧩 Implementations Summary

- Analytics
  - Service: `src/services/analytics.service.ts`
  - Screen tracking via NavigationContainer
  - Instrumented screens: Product detail, Cart, Checkout, Search, Virtual Try‑On, Auth login
- Analytics Extension (new)
  - Event types: `src/services/analytics/types.ts`
  - Hooks: wishlist, promos, filters, payment, reviews
  - Components integrated: ProductCard, FavoriteButton, Cart/Checkout, Promotions, Notifications
- Performance Optimization (new)
  - Image preloader: [imagePreloader.service.ts](file:///Users/mayank/Glowverse-app/frontend/src/services/imagePreloader.service.ts)
  - FlatList tuning in Shop and Search lists
  - Lazy-loading heavy screens in RootNavigator
  - CI bundle-size budget: [.github/workflows/performance.yml](file:///Users/mayank/Glowverse-app/.github/workflows/performance.yml)
- Accessibility (new)
  - Alt text on product images, descriptive labels on cards/buttons
  - Focus management and error announcements in AddressForm
- API Reliability (new)
  - Client: exponential backoff retries, latency analytics, Sentry tagging
  - Request deduplication for product detail
  - Health monitor: [apiHealthMonitor.ts](file:///Users/mayank/Glowverse-app/frontend/src/services/apiHealthMonitor.ts)
- Offline Capabilities
  - Queue: `src/services/offlineQueue.service.ts` with AsyncStorage persistence and NetInfo recovery
  - API client interceptors queue non‑GET requests when offline
  - OfflineIndicator: global banner for offline/syncing states
  - Cache: `src/services/cache.service.ts` for product detail pages
  - Optimistic cart add in `CartContext`
- Testing
  - Unit tests for cart API and others
  - Detox suites: shopping, profile/orders, AR/analysis
  - Stable jest setup and mocks
- Checkout
  - Multi‑step checkout (shipping → payment → review → confirmation)
  - Stripe card and platform pay stubs integrated
- App Store Readiness
  - app.json finalized for name, identifiers, and permissions
  - Screenshots folder scaffolded: `app-store-assets/`
  - Icons/splash and screenshot structure documented at repo root

---

## 🗺️ Roadmap

- Reliability & Types
  - [ ] Adopt generated OpenAPI types across services
  - [ ] Add Zod response validation on critical endpoints
- Offline & Caching
  - [ ] Broader offline caching for lists/search with stale‑while‑revalidate
  - [ ] Conflict resolution UI for failed syncs
- Analytics & QA
  - [ ] Expand E2E to cover deep links, payments edge cases
  - [ ] Add more analytics assertions and dashboards
- Accessibility & Performance
  - [ ] Complete a11y pass on remaining screens
  - [ ] Add render-time monitors on heavy components
- Store Readiness
  - [ ] Finalize store assets and captions; link EAS projectId
  - [ ] Automate App Store / Play Store submission via CI

---

*Last Updated: February 14, 2026 (post analytics, performance, a11y, API reliability updates)*
