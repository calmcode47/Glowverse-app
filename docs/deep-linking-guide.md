# Deep Linking Implementation Guide

## Overview

This guide explains how to work with deep linking in the Glowverse application, including creating new deep links, testing, and debugging.

---

## Architecture

### Components

```
┌─────────────────────────────────────────┐
│         Deep Link Entry Points          │
│  (Universal Links / App Links / Scheme) │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│        DeepLinkHandler Service          │
│  • Parse URL                            │
│  •Check Auth & Validate                 │
│  • Pre-fetch Data                       │
│  • Track Analytics                      │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  Validation  │  │  Prefetch    │
│   Service    │  │   Service    │
└──────────────┘  └──────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      React Navigation Integration       │
│         (Navigate to Screen)            │
└─────────────────────────────────────────┘
```

---

## Adding a New Deep Link

### Step 1: Define the URL Pattern

**Format**: `https://glowverse.app/{path}/{param}`

**Example**: `https://glowverse.app/collections/summer-2024`

### Step 2: Update Association Files

**iOS (apple-app-site-association)**:
```json
{
  "applinks": {
    "details": [{
      "paths": [
        "/collections/*",  // Add this line
        // ... existing paths
      ]
    }]
  }
}
```

**Android (assetlinks.json)**: No changes needed (auto-matches domain)

### Step 3: Update app.json

Add intent filter for Android:
```json
{
  "android": {
    "intentFilters": [
      {
        "data": [
          {
            "scheme": "https",
            "host": "glowverse.app",
            "pathPrefix": "/collections"  // Add this
          }
        ]
      }
    ]
  }
}
```

### Step 4: Add Parsing Logic

In `DeepLinkHandler.ts`, add to `parseDeepLink()`:

```typescript
//Collections: /collections/{slug}
if (firstSegment === 'collections' && segments.length >= 2) {
  return {
    type: 'collection',
    path,
    params: { collectionSlug: segments[1] },
    queryParams: queryParams || {},
  };
}
```

### Step 5: Add Type Definition

In `types.ts`:

```typescript
export type DeepLinkType =
  | 'collection'  // Add this
  | 'product'
  // ... existing types
```

### Step 6: Add Route Mapping

In `DeepLinkHandler.ts`, add to `getRouteForType()`:

```typescript
const routes: Record<DeepLinkType, DeepLinkRoute> = {
  collection: {
    screen: 'Collection',
    params: { slug: params.collectionSlug }
  },
  // ... existing routes
};
```

### Step 7: Add Validation (Optional)

In `DataValidationService.ts`:

```typescript
async validateCollectionSlug(slug: string): Promise<boolean> {
  try {
    const response = await client.get(`/api/v1/collections/${slug}`);
    return response.status === 200;
  } catch {
    return true; // Allow offline
  }
}
```

Update `validateParameters()` in DeepLinkHandler:

```typescript
case 'collection':
  const valid = await dataValidationService.validateCollectionSlug(
    parsed.params.collectionSlug
  );
  return valid ? { valid: true } : { valid: false, error: 'Collection not found' };
```

### Step 8: Add Pre-fetching (Optional)

In `PrefetchService.ts`:

```typescript
case 'collection':
  await this.prefetchCollection(params.collectionSlug);
  break;

private async prefetchCollection(slug: string): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: ['collection', slug],
    queryFn: async () => {
      const { client } = await import('../api/client');
      const response = await client.get(`/api/v1/collections/${slug}`);
      return response.data;
    },
  });
}
```

### Step 9: Add Tests

In `DeepLinkHandler.test.ts`:

```typescript
test('should parse collection link correctly', () => {
  const url = 'https://glowverse.app/collections/summer-2024';
  const result = deepLinkHandler.parseDeepLink(url);
  
  expect(result).toEqual({
    type: 'collection',
    path: '/collections/summer-2024',
    params: { collectionSlug: 'summer-2024' },
    queryParams: {},
  });
});
```

### Step 10: Deploy Association Files

1. Copy updated files to backend
2. Verify accessibility via HTTPS
3. Test on device

---

## Testing Deep Links

### Development Testing

**Using Terminal**:
```bash
# iOS Simulator
xcrun simctl openurl booted "https://glowverse.app/products/test_123"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://glowverse.app/products/test_123" \
  com.glowverse.app
```

**Using Browser** (Device):
1. Open Safari (iOS) or Chrome (Android)
2. Paste link: `https://glowverse.app/products/test_123`
3. Tap to open

**Using Email**:
1. Send test email with links
2. Open email on device
3. Tap link

### Production Testing

1. Use manual checklist: `docs/deep-linking-test-checklist.md`
2. Test on real devices
3. Verify analytics events

---

## Debugging

### Issue: Link opens browser instead of app

**iOS**:
- Verify AASA file is accessible
- Check Content-Type is `application/json`
- Ensure Team ID is correct
- Rebuild app after `app.json` changes
- Test on physical device (not simulator)

**Android**:
- Check App Links verification: 
  ```bash
  adb shell pm get-app-links com.glowverse.app
  ```
- Verify SHA-256 fingerprint matches
- Manually verify:
  ```bash
  adb shell pm verify-app-links --re-verify com.glowverse.app
  ```

### Issue: App crashes on deep link

1. Check logs:
   ```bash
   # iOS
   xcrun simctl spawn booted log stream --level debug
   
   # Android
   adb logcat | grep Glowverse
   ```

2. Verify screen exists in navigation
3. Check parameter validation
4. Test with simpler link

### Issue: Analytics not tracking

1. Verify analytics service is initialized
2. Check network requests
3. Test with debug logging:
   ```typescript
   await deepLinkHandler.handleDeepLink(url, 'email');
   // Check console for "[DeepLink] Analytics tracked"
   ```

---

## Analytics Events

### Tracked Events

**deep_link_opened**:
```typescript
{
  linkUrl: string;
  linkType: 'product' | 'referral' | ...;
  source: 'email' | 'sms' | 'social' | ...;
  timestamp: number;
  userId?: string;
}
```

**deep_link_failed**:
```typescript
{
  linkUrl: string;
  linkType: string;
  error: string;
  timestamp: number;
}
```

**deep_link_converted**:
```typescript
{
  linkType: string;
  timestamp: number;
  userId?: string;
}
```

### Tracking Conversion

Call when user completes intended action:

```typescript
import { deepLinkHandler } from '@services/deepLinking/DeepLinkHandler';

// In ProductDetail screen after purchase
await deepLinkHandler.trackDeepLinkConversion('product');
```

---

## Best Practices

### URL Design

✅ **Do**:
- Use lowercase paths: `/products/123`
- Use hyphens for spaces: `/collections/summer-sale`
- Keep URLs short and readable
- Use consistent patterns

❌ **Don't**:
- Use query params for required data: `/products?id=123`
- Use underscores: `/product_detail`
- Create deeply nested paths: `/a/b/c/d/e/f`
- Include sensitive data in URL

### Authentication

- Mark routes as protected in `requiresAuth()`
- Store redirect URL for post-login navigation
- Validate user permissions server-side
- Don't trust client-side validation alone

### Error Handling

- Always provide fallback screens
- Show user-friendly error messages
- Log errors for debugging
- Allow offline access when possible

### Performance

- Pre-fetch critical data
- Cache validation results
- Use optimistic navigation
- Monitor navigation latency

---

## Troubleshooting Checklist

- [ ] Association files deployed and accessible
- [ ] Team ID / SHA-256 fingerprints correct
- [ ] `app.json` updated with paths
- [ ] App rebuilt after configuration changes
- [ ] Screen exists in navigation
- [ ] Parameters validated correctly
- [ ] Analytics events firing
- [ ] Tested on physical device
- [ ] Works in cold start and warm start
- [ ] Error screens display correctly

---

## Support

For issues or questions:
1. Check logs for error messages
2. Review this documentation
3. Test with simplified link
4. Contact development team
