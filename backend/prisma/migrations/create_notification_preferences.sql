-- CreateTable: notification_preferences
-- Migration for adding notification preferences support

CREATE TABLE "notification_preferences" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  
  -- Channel preferences
  "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
  "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
  "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
  
  -- Category preferences
  "ordersEnabled" BOOLEAN NOT NULL DEFAULT true,
  "promotionsEnabled" BOOLEAN NOT NULL DEFAULT true,
  "fitnessEnabled" BOOLEAN NOT NULL DEFAULT true,
  "accountEnabled" BOOLEAN NOT NULL DEFAULT true,
  "socialEnabled" BOOLEAN NOT NULL DEFAULT true,
  
  -- Frequency settings
  "promotionFrequency" TEXT NOT NULL DEFAULT 'daily',
  "digestEnabled" BOOLEAN NOT NULL DEFAULT false,
  "digestTime" TEXT DEFAULT '09:00',
  
  -- Quiet hours
  "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
  "quietHoursStart" TEXT DEFAULT '22:00',
  "quietHoursEnd" TEXT DEFAULT '08:00',
  
  -- Timestamps
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- Create unique index on userId
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- Add foreign key constraint
ALTER TABLE "notification_preferences" 
ADD CONSTRAINT "notification_preferences_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create index for faster lookups
CREATE INDEX "notification_preferences_userId_idx" ON "notification_preferences"("userId");

-- Add comment
COMMENT ON TABLE "notification_preferences" IS 'User notification preferences for channels, categories, and scheduling';
