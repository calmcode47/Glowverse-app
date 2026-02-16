# AR Feature Testing Checklist

Comprehensive testing checklist for Glowverse AR features.

## Pre-Testing Setup

- [ ] Backend running with Perfect Corp API key configured
- [ ] Frontend running (Expo Go or Development Build)
- [ ] Device with camera (physical device required)
- [ ] Good lighting conditions
- [ ] Latest code deployed

---

## AR Mode Verification

### API Mode (Expo Go)
- [ ] Opens in Expo Go successfully
- [ ] Console shows "Using API fallback" message
- [ ] No "ARSDKModule not available" warnings crash the app
- [ ] AR features work via backend

### Native Mode (Development Build)
- [ ] Development client builds successfully (iOS)
- [ ] Development client builds successfully (Android)
- [ ] Console shows "Using native AR SDK" message
- [ ] ARSDKModule loads without errors
- [ ] Performance better than API mode

---

## Camera Access

- [ ] App requests camera permission on first AR use
- [ ] Permission grant works correctly
- [ ] Permission denial shows user-friendly message
- [ ] Retry permission request works
- [ ] Camera preview displays correctly
- [ ] Camera switches (front/back) work
- [ ] Flash/torch toggle works (if implemented)

---

## Face Detection

### Basic Detection
- [ ] Face detected with frontal view
- [ ] Face detected with slight angle (<30°)
- [ ] No false positives (objects, pets, etc.)
- [ ] Confidence score reasonable (>0.7)
- [ ] Detection speed < 3 seconds (API) or < 1s (Native)

### Face Tracking
- [ ] Landmarks detected (eyes, nose, mouth)
- [ ] Tracking smooth with head movement
- [ ] Re-detect after face lost
- [ ] Multiple faces handled gracefully (detects primary)

### Lighting Conditions
- [ ] Works in bright indoor lighting
- [ ] Works in dim lighting (with warning)
- [ ] Works in outdoor daylight
- [ ] Too dark shows helpful hint
- [ ] Too bright shows helpful hint

### Edge Cases
- [ ] Partial face visible (shows guide)
- [ ] Extreme angles (>45°) handled
- [ ] Face too small (distance warning)
- [ ] Face too large (distance warning)
- [ ] Accessories (glasses, hats) don't break detection

---

## Virtual Try-On

### Lipstick
- [ ] Applies to lips correctly
- [ ] Color accurate to product
- [ ] Doesn't bleed outside lip area
- [ ] Works with different lip shapes
- [ ] Intensity adjustment works (0-100)
- [ ] Matte/glossy/shimmer textures work

### Eyeshadow
- [ ] Applies to eyelids correctly
- [ ] Matches product color
- [ ] Natural blending
- [ ] Works with different eye shapes
- [ ] Doesn't overlap eyebrows

### Eyeliner
- [ ] Follows eyelid contour
- [ ] Thickness adjustable
- [ ] Winged liner works
- [ ] Color accurate

### Blush
- [ ] Positions on cheeks correctly
- [ ] Natural gradient
- [ ] Adjustable intensity
- [ ] Works with different face shapes

### Foundation
- [ ] Covers face evenly
- [ ] Color matches selected shade
- [ ] Natural transition at edges
- [ ] Adjustable coverage

### Multiple Products
- [ ] Can apply multiple products simultaneously
- [ ] Products don't conflict/overlap incorrectly
- [ ] Can switch products without redetecting face
- [ ] Can remove individual products

---

## Image Capture

- [ ] Capture button responsive
- [ ] Image quality good (not pixelated)
- [ ] Makeup preserved in captured image
- [ ] Save to gallery works
- [ ] Gallery permission requested appropriately
- [ ] Filename descriptive and timestamp

---

## Performance

### Speed
- [ ] Face detection < 2s (native) or < 4s (API)
- [ ] Makeup application < 1s (native) or < 3s (API)
- [ ] UI remains responsive during processing
- [ ] Loading indicators display appropriately

### Resource Usage
- [ ] App doesn't crash during AR usage
- [ ] Memory usage reasonable (<200MB increase)
- [ ] Battery drain acceptable
- [ ] Device doesn't overheat
- [ ] Camera doesn't stutter

### Network (API Mode)
- [ ] Handles slow connections gracefully
- [ ] Shows loading state during API calls
- [ ] Timeout handled (shows retry option)
- [ ] Works on WiFi
- [ ] Works on cellular data

---

## Error Handling

### User Errors
- [ ] No face detected → clear message
- [ ] Poor lighting → helpful tip
- [ ] Face too far/close → distance guide
- [ ] Extreme angle → repositioning hint
- [ ] Invalid product → error message

### Technical Errors
- [ ] Network error → retry option
- [ ] API timeout → fallback message
- [ ] Camera error → troubleshooting steps
- [ ] Permission denied → settings redirect
- [ ] Low storage → cleanup suggestion

### Recovery
- [ ] Can retry after error
- [ ] App state recovers gracefully
- [ ] Error doesn't break other app features
- [ ] Errors logged for debugging

---

## Cross-Platform

### iOS
- [ ] Works on iPhone 12+ (iOS 15+)
- [ ] Works on iPad (if supported)
- [ ] Camera orientation correct
- [ ] Permissions UI native
- [ ] Performance acceptable

### Android
- [ ] Works on Pixel/Samsung (Android 10+)
- [ ] Works on various screen sizes
- [ ] Camera orientation correct
- [ ] Permissions UI native
- [ ] Performance acceptable

### UI Consistency
- [ ] Layout same on both platforms
- [ ] Buttons/controls in same positions
- [ ] Colors/fonts consistent
- [ ] Animations consistent

---

## Edge Cases

### App Lifecycle
- [ ] Backgrounding app doesn't break AR
- [ ] Returning from background resumes correctly
- [ ] Lock screen doesn't crash app
- [ ] Incoming call handled gracefully
- [ ] Low power mode works
- [ ] App switch (multitasking) works

### Special Scenarios
- [ ] Quick product switching works
- [ ] Rapid face movement handled
- [ ] Screen rotation handled (if enabled)
- [ ] Device orientation changes work
- [ ] Works with Face ID enabled
- [ ] Works with accessibility features

---

## API Fallback Verification

### Expo Go Testing
- [ ] Warning message displays on first use
- [ ] "API mode" indicator visible
- [ ] All features work via API
- [ ] Results comparable to native
- [ ] No native module errors crash app

### Fallback Logic
- [ ] Gracefully falls back if native unavailable
- [ ] User doesn't notice difference (besides speed)
- [ ] Consistent interface both modes
- [ ] Logs indicate which mode used

---

## Production Readiness

### Performance Benchmarks
- [ ] Face detection: API <5s, Native <2s
- [ ] Makeup application: API <5s, Native <2s
- [ ] Memory usage: <200MB increase
- [ ] Battery drain: <5% per 10 minutes
- [ ] No memory leaks

### Quality Checks
- [ ] Results look realistic
- [ ] Colors accurate
- [ ] No visual glitches
- [ ] Works in various conditions
- [ ] User experience smooth

### Analytics
- [ ] AR usage tracked
- [ ] Error rates logged
- [ ] Performance metrics collected
- [ ] User feedback captured

---

## Status Legend

- ✅ = Passing
- ⚠️ = Needs improvement
- ❌ = Failing
- ⏸️ = Not tested yet
- 🔄 = Retest needed

---

## Test Results Summary

### Overall Status
- **API Mode:** ___________
- **Native Mode:** ___________
- **Critical Issues:** ___________
- **Minor Issues:** ___________
- **Production Ready:** YES / NO

### Notes

_Add any important observations or issues here_

---

## Sign-off

- [ ] All critical tests passing
- [ ] No blocking issues
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Ready for user testing

**Tested by:** ___________  
**Date:** ___________  
**Device(s):** ___________  
**App Version:** ___________
