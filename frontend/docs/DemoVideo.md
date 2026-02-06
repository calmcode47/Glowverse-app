# PerfectCorpAI — 2.5 Minute Demo Guide

## Overview
- Goal: Showcase onboarding, home tour, AI skin analysis, virtual try-on, profile/history, and closing brand moment.
- Pace: ~2:30 total. Keep transitions tight, leverage built-in animations.
- Capture: iPhone/Android device or simulator; record screen at 60fps.

## Shot List, Voiceover, and Visual Cues

### 1) App Launch & Onboarding (0:00–0:15)
- Voiceover:
  - “Welcome to PerfectCorpAI — your AI beauty companion.”
  - “Let’s walk through the onboarding and get started.”
- On-screen actions:
  - Show splash screen.
  - Swipe slides: Welcome → Features → Camera Permission → Get Started.
  - Tap “Allow Camera” (shows success animation), then “Get Started”.
- Visual cues:
  - Lower-third: “AI Beauty Experience”
  - Subtle zoom on animated logo and loader.

### 2) Home Screen Tour (0:15–0:35)
- Voiceover:
  - “The Home screen highlights key features and recent history.”
  - “Start Skin Analysis or Try Virtual Makeup with AR.”
- On-screen actions:
  - Scroll features; briefly tap FeatureCard tooltips.
  - Show HeroBanner carousel and recent history (if present).
- Visual cues:
  - Overlay labels: “Skin Analysis”, “Virtual Makeup”.
  - Quick highlight around notification and profile icons.

### 3) Skin Analysis Demo (0:35–1:15)
- Voiceover:
  - “Tap Skin Analysis. Grant camera access if prompted.”
  - “Face guide helps align for a clear capture.”
  - “AI processes the image and returns results.”
- On-screen actions:
  - Navigate to Camera; show face guide overlay.
  - Capture selfie; show loading spinner.
  - Navigate to Results; show Before/After slider, Summary Score, metrics, markers, and recommendations.
- Visual cues:
  - Callout: “Before/After slider”
  - Callout: “AI metrics: acne, wrinkles, dark spots, redness”
  - Callout: “Product recommendations”

### 4) Virtual Try-On Demo (1:15–1:45)
- Voiceover:
  - “Explore Virtual Try-On for instant makeup previews.”
  - “Select lipstick, change colors, and adjust intensity.”
  - “Capture and save your look.”
- On-screen actions:
  - Navigate to Virtual Try-On.
  - Open makeup drawer; choose Lipstick; pick a shade; adjust intensity; toggle Compare.
  - Capture; show toast and Save Look dialog; confirm save.
- Visual cues:
  - Highlight: “Color swatches”
  - Highlight: “Intensity slider”
  - Badge: “Compare mode”

### 5) Profile & History (1:45–2:00)
- Voiceover:
  - “Profile centralizes stats, history, and preferences.”
  - “Manage notifications, theme, and language.”
- On-screen actions:
  - Open Profile; show avatar picker, stats cards.
  - Scroll history grid; long-press delete confirmation.
  - Show Settings list; toggle theme and notifications.
- Visual cues:
  - Callout: “Stats: analyses, products tried, favorites”
  - Callout: “History: filter, load more”
  - Callout: “Settings: theme, language, privacy”

### 6) Closing (2:00–2:30)
- Voiceover:
  - “Discover your best look with PerfectCorpAI.”
  - “Contact us to bring AI beauty to your brand.”
- On-screen actions:
  - Return to logo animation; show tagline and contact.
- Visual cues:
  - Title: “AI Beauty Experience”
  - Footer: “contact@perfectcorp.ai” / “perfectcorpai.com”

## Capture Tips
- Record at 60fps; disable notifications; clean status bar.
- Use consistent lighting for camera segments.
- Keep taps deliberate and visible; enable system touch indicators if available.
- Use subtle zooms on key animations; avoid abrupt cuts.

## Optional B-Roll
- Slow pan of recommendations carousel.
- Quick montage of color changes in try-on.
- Macro shot of ScoreCard circular animation.

## Project Commands (for filming)
- Install: `npm install`
- Start: `npx expo start`
- iOS simulator: `npx expo start --ios`
- Android emulator: `npx expo start --android`
- Typecheck: `npx tsc --noEmit`
- Tests: `npx jest`
- Dev build (EAS): `eas build --profile development --platform ios`
