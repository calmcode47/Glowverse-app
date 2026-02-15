# Backend Setup Instructions - Notification Preferences

## Prerequisites

- Node.js >= 16
- PostgreSQL database
- Prisma CLI installed

## Step 1: Update Prisma Schema

Add the NotificationPreferences model to your main `prisma/schema.prisma` file:

```bash
# Copy the model definition from
cat prisma/schema-notification-preferences.prisma

# Add to your main schema.prisma file
# Or use Prisma's schema composition if supported
```

Also update your User model to include the relation:

```prisma
model User {
  // ... existing fields
  notificationPreferences NotificationPreferences?
}
```

## Step 2: Run Database Migration

```bash
# Generate and apply migration
npx prisma migrate dev --name add_notification_preferences

# Or run the SQL migration directly
psql -U your_user -d glowverse_db -f prisma/migrations/create_notification_preferences.sql
```

## Step 3: Seed Existing Users

Run the seed script to create default preferences for existing users:

```bash
# Using ts-node
npx ts-node prisma/seeds/seedNotificationPreferences.ts

# Or if you have a seeds script in package.json
npm run seed:notifications
```

## Step 4: Update Main App

Add the notification routes to your main Express app:

```typescript
// src/app.ts or src/server.ts
import notificationRoutes from './routes/notifications.routes';

// Add this line with other route registrations
app.use('/api/notifications', notificationRoutes);
```

## Step 5: Update Existing Notification Code

Replace any direct notification sending with the enhanced service:

```typescript
// Before
import { emailService } from './services/email.service';
await emailService.send(userId, subject, message);

// After
import { enhancedNotificationService } from './services/enhancedNotification.service';
await enhancedNotificationService.sendNotification({
  userId,
  type: 'order', // or 'promotion', 'fitness', 'account', 'social'
  channel: 'email', // or 'push', 'sms', 'all'
  subject,
  message,
  priority: 'normal', // or 'low', 'high'
});
```

## Step 6: Run Tests

```bash
# Run unit tests
npm test

# Run specific test suites
npm test notificationPreferences.service.test
npm test enhancedNotification.service.test

# Run with coverage
npm test -- --coverage
```

## Step 7: Start Development Server

```bash
npm run dev
```

## Step 8: Test API Endpoints

### Get Preferences

```bash
curl -X GET http://localhost:3000/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Preferences

```bash
curl -X PATCH http://localhost:3000/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pushEnabled": false,
    "promotionsEnabled": false,
    "quietHoursEnabled": true,
    "quietHoursStart": "22:00",
    "quietHoursEnd": "07:00"
  }'
```

### Reset Preferences

```bash
curl -X POST http://localhost:3000/api/notifications/preferences/reset \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Environment Variables

Ensure you have these in your `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/glowverse_db"
JWT_SECRET="your-secret-key"
```

## Troubleshooting

### Migration Fails

If migration fails, check:
- Database connection
- User permissions
- Existing table conflicts

```bash
# Drop and recreate (CAUTION: development only)
npx prisma migrate reset

# Then re-run
npx prisma migrate dev
```

### Seed Script Errors

```bash
# Check Prisma client is generated
npx prisma generate

# Then re-run seed
npx ts-node prisma/seeds/seedNotificationPreferences.ts
```

### Frontend Integration

Update your frontend API client:

```typescript
// src/services/api/notifications.api.ts
export async function getNotificationPreferences() {
  const response = await api.get('/api/notifications/preferences');
  return response.data;
}

export async function updateNotificationPreferences(updates: any) {
  const response = await api.patch('/api/notifications/preferences', updates);
  return response.data;
}

export async function resetNotificationPreferences() {
  const response = await api.post('/api/notifications/preferences/reset');
  return response.data;
}
```

## Production Deployment

1. **Run migration in production:**
   ```bash
   npx prisma migrate deploy
   ```

2. **Seed existing users:**
   ```bash
   npm run seed:notifications
   ```

3. **Monitor logs:**
   - Check for suppressed notifications
   - Monitor quiet hours effectiveness
   - Track preference update patterns

4. **Set up monitoring:**
   - Alert on high suppression rates
   - Track notification delivery rates
   - Monitor preference changes

## Next Steps

- Frontend NotificationSettingsScreen implementation
- Email/Push/SMS service integration
- Notification queue setup (Bull, Redis)
- Analytics integration
- Digest notification scheduler
