# Glowverse Frontend — React Native Mobile App

<div align="center">

[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Stripe](https://img.shields.io/badge/Stripe-0.33-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Firebase](https://img.shields.io/badge/Firebase-23-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

**Cross-platform mobile application for the Glowverse AI/AR beauty platform. Built with React Native and Expo for iOS, Android, and Web — featuring 76+ reusable components, 30+ screens, AR SDK bridge with real-time try-on, AI skin analysis pipeline, offline-first sync, and comprehensive analytics.**

</div>

---

## 📊 Status

| Area | Status | Details |
|------|:------:|---------|
| Components | ✅ | 76+ across 12 categories |
| Screens | ✅ | 30+ across 17 categories |
| Navigation | ✅ | React Navigation 7 with deep links |
| Design System | ✅ | Custom tokens, light/dark themes |
| API Integration | ✅ | Axios client with retry/backoff, deduplication |
| State Management | ✅ | React Context + TanStack Query |
| Analytics | ✅ | Firebase — commerce, AR/AI, notifications, referrals |
| Offline Support | ✅ | Request queue, optimistic cart, product caching |
| AR / Try-On | ✅ | AR SDK bridge, Vision Camera pipeline, frame capture & overlays |
| Performance | ✅ | Image preloading, FlatList tuning, lazy-loaded screens |
| Accessibility | ✅ | Labels, focus management, touch-target enforcement |
| Testing | ✅ | Jest unit tests + Detox E2E suites |
| Build & Release | ✅ | EAS profiles (dev/preview/prod), CI workflows, store assets |
| Payments | 🚧 | Stripe webhook-driven order state — in progress |
| AR/AI Hardening | 🚧 | Native SDK linkage & device QA pass — in progress |

---

## ✨ Features

### E-Commerce
- Full product catalog with image galleries, variants, and rich filters
- Cart management with offline optimistic updates
- Multi-step checkout — shipping → payment → review → confirmation
- Stripe card, Apple Pay, and Google Pay integration
- Orders list and details, address CRUD, invoice sharing

### AI & AR
- Virtual try-on powered by PerfectCorp with live frame capture and overlays
- AR SDK native bridge (iOS/Android) with Vision Camera frame processor
- AR analytics, performance monitor, and screenshot capture/sharing
- AI skin analysis with consent flow, preprocessing, and annotated results
- Device-performance-tuned quality and frame-rate managers

### Discovery & Content
- Global search with filters, sorting, and trending suggestions
- Beauty guides with step-by-step tutorials, likes, and bookmarks
- Fitness activity dashboard with goal tracking and progress charts
- Promotions with coupon-style copy UI and one-tap application
- Referral code sharing via native system share sheet

### Platform & Infrastructure
- **Offline-first:** AsyncStorage request queue with automatic replay on reconnect
- **Analytics:** Comprehensive Firebase events (screens, products, cart, checkout, AR, referrals, filters, payments, reviews)
- **API reliability:** Exponential backoff retries, request deduplication, health monitoring, Sentry tagging
- **Design system:** Design tokens, light/dark mode, Reanimated micro-interactions, glassmorphism components
- **Deep linking:** Configured schemes and navigation handlers for app-to-app flows

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start Expo dev server
# Windows & macOS: defaults to tunnel with automatic LAN fallback
npm start

# Platform launchers
npm run web       # Open in browser
npm run android   # Android emulator / device
npm run ios       # iOS simulator (macOS only)
```

> **Dev server:** `http://localhost:8081`

### Connectivity Modes

| Command | Mode | When to Use |
|---------|------|-------------|
| `npm start` | Tunnel (auto) | Default — works anywhere |
| `npm run start:tunnel` | Tunnel (forced) | Explicit tunnel on any OS |
| `npm run start:lan` | LAN | Fastest — same Wi-Fi, VPN off |
| `HOST_IP=x.x.x.x npm run start:lan` | LAN (fixed IP) | When QR shows wrong address |

### Windows Setup
If LAN mode is blocked by the Windows Firewall, run:
```powershell
powershell -ExecutionPolicy Bypass -File .\windows_fix.ps1
```
This opens port 8081 and corrects the bundler host binding.

### macOS Setup
```bash
npm start       # Tunnel by default; press 'i' for iOS simulator
npm run ios     # Direct iOS simulator launch
```
If tunnel fails, the startup script retries LAN automatically.

---

## 📁 Project Structure

```
frontend/
├── App.tsx                         # App entry point & global providers
├── index.ts                        # Expo entry registration
├── src/
│   ├── components/                 # 76+ reusable components
│   │   ├── animated/               # Animated wrapper components
│   │   ├── animations/             # Standalone animation components
│   │   ├── ar/                     # AR/camera view overlays
│   │   ├── camera/                 # Camera access components
│   │   ├── common/                 # Shared UI — buttons, cards, modals, badges
│   │   ├── history/                # History & timeline components
│   │   ├── home/                   # Home screen widgets
│   │   ├── navigation/             # Navigation-related components
│   │   ├── products/               # Product cards, lists, carousels
│   │   ├── profile/                # Profile & account components
│   │   ├── results/                # AI analysis result views
│   │   └── ui/                     # Base UI primitives
│   ├── screens/                    # 30+ screens
│   │   ├── auth/                   # Login, register, forgot password
│   │   ├── home/                   # Home & dashboard
│   │   ├── shop/                   # Catalog, product detail, cart
│   │   ├── ar/                     # Virtual try-on, camera
│   │   ├── analysis/               # Skin analysis flow
│   │   ├── fitness/                # Activity tracking & goals
│   │   ├── guide/                  # Beauty tutorial screens
│   │   ├── profile/                # User profile, settings, addresses
│   │   ├── search/                 # Global search
│   │   ├── notifications/          # Notification centre with preferences
│   │   ├── promotions/             # Promo codes & offers
│   │   ├── wishlist/               # Saved / favourites
│   │   ├── history/                # Order & scan history
│   │   ├── results/                # Analysis results display
│   │   ├── stats/                  # Analytics & statistics
│   │   ├── camera/                 # Dedicated camera screen
│   │   └── onboarding/             # First-launch onboarding flow
│   ├── navigation/                 # React Navigation 7 configuration
│   ├── services/
│   │   ├── api/                    # Typed Axios client + auth interceptors
│   │   ├── ai/                     # Skin analysis APIs + ML helpers
│   │   ├── ar/                     # AR SDK orchestration & analytics
│   │   ├── analytics.service.ts    # Firebase Analytics helper
│   │   ├── analytics/              # Extended event types & hooks
│   │   ├── offlineQueue.service.ts # Offline request queue
│   │   ├── cache.service.ts        # Product detail cache
│   │   ├── imagePreloader.service.ts # Image prefetching
│   │   └── apiHealthMonitor.ts     # API health & latency tracking
│   ├── hooks/                      # Custom React hooks (AR SDK, offline, analytics)
│   ├── context/                    # AuthContext, CartContext, ThemeContext
│   ├── modules/                    # AR SDK native bridge (iOS/Android)
│   ├── config/                     # App-level configuration
│   ├── constants/                  # Shared constants
│   ├── theme/                      # Design tokens, colours, typography
│   ├── data/                       # Static & mock data
│   └── utils/                      # Utility functions
├── e2e/                            # Detox E2E test suites
│   ├── shopping.e2e.js             # Browse, cart, checkout, search, filter
│   ├── profile.e2e.js              # Orders, profile edit, addresses
│   └── ar-analysis.e2e.js          # Try-on flow & skin analysis
├── __tests__/                      # Jest unit tests
├── assets/                         # Images, fonts, Lottie animations
├── app-store-assets/               # App Store / Play Store screenshots
├── types/                          # Shared TypeScript type definitions
├── app.json                        # Expo configuration
├── app.config.js                   # Dynamic Expo config (env injection)
├── eas.json                        # EAS Build profiles
├── babel.config.js                 # Babel with module-resolver
├── tsconfig.json                   # TypeScript configuration
├── jest.config.js                  # Jest + jest-expo configuration
└── metro.config.js                 # Metro bundler configuration
```

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.5 | Cross-platform mobile framework |
| Expo SDK | 54.0 | Build & development platform |
| React | 19.1 | UI library |
| TypeScript | 5.9 | Type safety |
| React Navigation | 7 | Stack & tab routing, deep links |
| React Native Reanimated | 4.1 | 60fps animations & gestures |
| React Native Gesture Handler | 2.28 | Touch & gesture recognition |
| React Native Paper | 5 | Material Design component library |
| TanStack Query | 5 | Server state, caching, sync |
| Axios | 1.13 | HTTP client with interceptors |
| Expo Camera | 17 | Camera access for AR/analysis |
| Expo Image Picker | 17 | Photo selection from gallery |
| Expo Secure Store | 13 | Encrypted token storage |
| Expo Notifications | 0.29 | Push notification handling |
| Expo Linear Gradient | 15 | Gradient backgrounds |
| Expo Blur | 15 | Glassmorphism blur effects |
| Lottie React Native | 7.3 | Lottie animation playback |
| React Native MMKV | 4.1 | High-performance key-value storage |
| AsyncStorage | 2.2 | Offline queue persistence |
| NetInfo | 12 | Connectivity state monitoring |
| Firebase | 23 | Analytics & push messaging |
| Stripe React Native | 0.33 | Card, Apple Pay, Google Pay |
| Sentry React Native | 8 | Error tracking & performance |
| Vision Camera | 4.7 | High-performance camera pipeline |
| Detox | 20 | E2E automation tests |
| Fuse.js | 7.1 | Client-side fuzzy search |

---

## 🧪 Testing

### Unit Tests (Jest)
```bash
npm test                    # Run all unit tests
npm run test:coverage       # With coverage report
npm run test:watch          # Watch mode during development
npm run test:ci             # CI mode (coverage + limited workers)
```

**Framework:** jest-expo + @testing-library/react-native  
**Coverage gates:** Per-file thresholds on critical paths (auth context, cart API, services)

### End-to-End Tests (Detox)
```bash
# iOS
npm run e2e:ios:build       # Build the iOS test binary
npm run e2e:ios:test        # Run iOS E2E suite

# Android
npm run e2e:android:build   # Build the Android test binary
npm run e2e:android:test    # Run Android E2E suite

# CI
npm run e2e:test:ci         # iOS release, cleanup after run
```

**E2E suites:**
| Suite | Coverage |
|-------|---------|
| `shopping.e2e.js` | Browse, add to cart, checkout, search, filter |
| `profile.e2e.js` | Orders, order details, profile edit, addresses |
| `ar-analysis.e2e.js` | Try-on flow, skin analysis, results |

---

## 📱 Build & Deployment

### EAS Build
```bash
# Development build (dev client, hot reload)
npm run build:dev

# Production build (all platforms)
npm run build:prod
```

### EAS Submit (App Stores)
```bash
npm run submit:ios          # Submit to App Store Connect
npm run submit:android      # Submit to Google Play Console
npm run release             # Build prod + submit both platforms
```

See [`eas.json`](eas.json) for profile configuration (development, preview, production).  
📖 **EAS Guide:** [docs/EAS.md](docs/EAS.md)

---

## 🎨 Design System

| Category | Implementation |
|----------|---------------|
| **Tokens** | `src/theme/` — spacing, typography, radius, shadows |
| **Colours** | Curated light/dark palettes with semantic aliases |
| **Typography** | Modern font stacks with size/weight scales |
| **Animations** | Reanimated 4 — spring physics & shared element transitions |
| **Components** | Glassmorphism cards, gradient headers, parallax effects |
| **Micro-interactions** | Haptic feedback, press states, skeleton loaders |

---

## 🔐 Configuration & Environment

### `app.json` / `app.config.js`

| Setting | Value |
|---------|-------|
| iOS Bundle ID | `com.glowverse.app` |
| Android Package | `com.glowverse.app` |
| Tablet Support | Disabled |
| Deep Link Scheme | `glowverse://` |
| Universal Links | Configured for iOS associated domains |
| Intent Filters | Configured for Android |

### Environment Variables

```env
# Required
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1

# Optional — falls back to mock/demo mode if unset
EXPO_PUBLIC_PERFECTCORP_API_KEY=your-perfectcorp-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
STRIPE_MERCHANT_ID=merchant.com.glowverse.dev
ANALYTICS_ID=your-firebase-analytics-id
SENTRY_DSN=your-sentry-dsn

# AR SDK (native bridge)
AR_SDK_VENDOR=perfectcorp
AR_SDK_ENABLED=true
AR_SDK_API_KEY=your-ar-sdk-api-key
AR_SDK_LICENSE_KEY=your-ar-sdk-license
AR_SDK_API_URL=https://your-ar-sdk-api
AR_TARGET_FPS=30
AR_ENABLE_GPU_ACCELERATION=true
AR_MAX_TEXTURE_CACHE_SIZE_MB=64
```

---

## 🧰 Developer Workflow

### Code Quality
```bash
npm run types:check         # TypeScript check (no emit)
# Note: lint and format scripts are managed at the project root
npx ts-prune               # Detect unused exports
npx depcheck               # Detect unused dependencies
npm audit                  # Security audit
npm audit fix              # Auto-fix safe issues
```

### Useful Utilities
```bash
npm run assets:optimize     # Optimise images & assets
npm run assets:verify       # Verify required assets exist
npm run audit:api           # OpenAPI endpoint coverage audit
npm run audit:contrast      # Accessibility contrast check
npm run eas:verify          # Verify EAS project ID is set
```

---

## 🗺️ Roadmap

### In Progress
- [ ] End-to-end Stripe payments with webhook-driven order state
- [ ] AR/AI native SDK linkage and device QA pass (iOS & Android)

### Planned
- [ ] Offline conflict resolution UI for failed sync
- [ ] OpenAPI-generated type adoption across all API services
- [ ] Zod response validation on critical API endpoints
- [ ] Expand E2E coverage: payment edge cases (3DS, timeout, network loss)
- [ ] Finalise store assets and App Store / Play Store captions
- [ ] Automate App Store submission via CI/CD

---

## 📚 Documentation

- [Project README](../README.md) — Full project overview and architecture
- [EAS Build Guide](docs/EAS.md) — Build profiles, secrets, and CI submission
- [Project Status Report](../project_report.md) — Completion %, gaps, go-live checklist

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and add tests
4. Run checks: `npm run types:check && npm test`
5. Commit: `git commit -m 'feat: describe your change'`
6. Push and open a Pull Request — CI runs automatically

---

## 📄 License

This project is proprietary software developed for the Glowverse beauty platform. All rights reserved.

---

*Last updated: February 20, 2026*
