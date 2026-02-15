# Frontend Setup - Notification Settings

## Prerequisites

- Backend API running with notification preferences endpoints
- React Native app set up
- Navigation configured

## Step 1: Install Dependencies

```bash
cd frontend

# Install date/time picker for quiet hours
npm install @react-native-community/datetimepicker

# For iOS
cd ios && pod install && cd ..
```

## Step 2: Add Navigation Route

Add the NotificationSettingsScreen to your navigation stack:

```typescript
// src/navigation/SettingsStack.tsx or similar
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';

// Add to stack
<Stack.Screen
  name="NotificationSettings"
  component={NotificationSettingsScreen}
  options={{ title: 'Notifications' }}
/>
```

## Step 3: Add Link from Profile/Settings

```typescript
// In ProfileScreen or SettingsScreen
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

<TouchableOpacity
  onPress={() => navigation.navigate('NotificationSettings')}
>
  <View style={styles.menuItem}>
    <Icon name="notifications-outline" size={24} />
    <Text>Notification Settings</Text>
    <Icon name="chevron-forward" size={20} />
  </View>
</TouchableOpacity>
```

## Step 4: Configure API Client

Ensure your API client has the correct base URL:

```typescript
// src/services/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken(); // Your auth token getter
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Step 5: Test the Screen

```bash
# Run the app
npm run ios
# or
npm run android
```

## Usage Examples

### Navigating to Settings

```typescript
navigation.navigate('NotificationSettings');
```

### Programmatic Updates

```typescript
import * as NotificationPreferencesAPI from '../services/api/notificationPreferences.api';

// Disable all promotions
await NotificationPreferencesAPI.updateNotificationPreferences({
  promotionsEnabled: false,
});

// Set quiet hours
await NotificationPreferencesAPI.updateNotificationPreferences({
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
});

// Reset to defaults
await NotificationPreferencesAPI.resetNotificationPreferences();
```

## Features

✅ **Channel Control:**
- Email on/off
- Push notifications on/off
- SMS on/off

✅ **Category Control:**
- Orders & Shipping
- Promotions & Sales
- Fitness & Progress
- Account Updates
- Social Activity

✅ **Advanced Settings:**
- Promotion frequency (Daily/Weekly/Monthly/Never)
- Quiet hours with time pickers
- Digest notifications (if enabled)

✅ **UX Features:**
- Optimistic updates
- Loading states
- Error handling
- Reset to defaults
- Saving indicator

## Customization

### Theme Colors

The screen uses your app's theme:

```typescript
// Customize in your theme
{
  colors: {
    primary: '#8B5CF6',
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    }
  }
}
```

### Custom Sections

Add custom notification categories:

```typescript
// In NotificationSettingsScreen.tsx
<View style={styles.settingRow}>
  <View style={styles.settingInfo}>
    <Text style={styles.settingLabel}>Custom Category</Text>
    <Text style={styles.settingDescription}>Your custom notifications</Text>
  </View>
  <Switch
    value={preferences.customEnabled}
    onValueChange={(value) => updatePreference({ customEnabled: value })}
  />
</View>
```

## Troubleshooting

### DateTimePicker not showing

Make sure you installed and linked the package:
```bash
npm install @react-native-community/datetimepicker
cd ios && pod install
```

### API calls failing

Check:
1. Backend is running
2. API URL is correct
3. Auth token is set
4. CORS is enabled on backend

### Switch not updating

Ensure you're:
1. Awaiting the API call
2. Updating state after response
3. Handling errors properly

## Testing

```typescript
// Example test
describe('NotificationSettingsScreen', () => {
  it('loads preferences on mount', async () => {
    render(<NotificationSettingsScreen />);
    await waitFor(() => {
      expect(screen.getByText('Email Notifications')).toBeTruthy();
    });
  });

  it('updates preference when switch toggled', async () => {
    render(<NotificationSettingsScreen />);
    const emailSwitch = screen.getByTestId('email-switch');
    fireEvent(emailSwitch, 'onValueChange', false);
    
    await waitFor(() => {
      expect(updateNotificationPreferences).toHaveBeenCalledWith({
        emailEnabled: false,
      });
    });
  });
});
```

## Next Steps

- Add push notification permission request
- Implement digest time picker
- Add notification preview/test button
- Create notification history screen
- Add analytics tracking for preference changes
