-- Products table indexes
CREATE INDEX IF NOT EXISTS "idx_products_category" ON "products"("category");
CREATE INDEX IF NOT EXISTS "idx_products_brand" ON "products"("brand");
CREATE INDEX IF NOT EXISTS "idx_products_price" ON "products"("price");
CREATE INDEX IF NOT EXISTS "idx_products_rating" ON "products"("rating");
CREATE INDEX IF NOT EXISTS "idx_products_created" ON "products"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_products_name_search" ON "products" USING gin(to_tsvector('english', "name"));
CREATE INDEX IF NOT EXISTS "idx_products_desc_search" ON "products" USING gin(to_tsvector('english', "description"));

-- Composite index for product filtering
CREATE INDEX IF NOT EXISTS "idx_products_category_price" ON "products"("category", "price");
CREATE INDEX IF NOT EXISTS "idx_products_category_rating" ON "products"("category", "rating" DESC);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS "idx_orders_user" ON "orders"("userId");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders"("status");
CREATE INDEX IF NOT EXISTS "idx_orders_created" ON "orders"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_orders_user_status" ON "orders"("userId", "status");

-- Cart indexes
CREATE INDEX IF NOT EXISTS "idx_cart_user" ON "carts"("userId");
CREATE INDEX IF NOT EXISTS "idx_cart_items_cart" ON "cart_items"("cartId");
CREATE INDEX IF NOT EXISTS "idx_cart_items_product" ON "cart_items"("productId");

-- Guides indexes
CREATE INDEX IF NOT EXISTS "idx_guides_author" ON "guides"("authorId");
CREATE INDEX IF NOT EXISTS "idx_guides_category" ON "guides"("category");
CREATE INDEX IF NOT EXISTS "idx_guides_published" ON "guides"("publishedAt");
CREATE INDEX IF NOT EXISTS "idx_guides_created" ON "guides"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_guides_title_search" ON "guides" USING gin(to_tsvector('english', "title"));

-- Guide engagement indexes
CREATE INDEX IF NOT EXISTS "idx_guide_likes_guide" ON "guide_likes"("guideId");
CREATE INDEX IF NOT EXISTS "idx_guide_likes_user" ON "guide_likes"("userId");
CREATE INDEX IF NOT EXISTS "idx_guide_bookmarks_guide" ON "guide_bookmarks"("guideId");
CREATE INDEX IF NOT EXISTS "idx_guide_bookmarks_user" ON "guide_bookmarks"("userId");

-- Notifications indexes
CREATE INDEX IF NOT EXISTS "idx_notifications_user" ON "notifications"("userId");
CREATE INDEX IF NOT EXISTS "idx_notifications_read" ON "notifications"("isRead");
CREATE INDEX IF NOT EXISTS "idx_notifications_user_read" ON "notifications"("userId", "isRead");
CREATE INDEX IF NOT EXISTS "idx_notifications_created" ON "notifications"("createdAt" DESC);

-- Fitness indexes
CREATE INDEX IF NOT EXISTS "idx_fitness_activities_user" ON "fitness_activities"("userId");
CREATE INDEX IF NOT EXISTS "idx_fitness_activities_date" ON "fitness_activities"("activityDate" DESC);
CREATE INDEX IF NOT EXISTS "idx_fitness_goals_user" ON "fitness_goals"("userId");

-- Referral indexes
CREATE INDEX IF NOT EXISTS "idx_referral_code" ON "referrals"("code");
CREATE INDEX IF NOT EXISTS "idx_referral_referrer" ON "referrals"("referrerId");
-- Note: Rewards are columns in referrals table, not a separate table in schema (based on schema)
-- If ReferralReward table existed it would be here, but schema has rewards in `referrals` table.

-- Reviews indexes
CREATE INDEX IF NOT EXISTS "idx_reviews_product" ON "product_reviews"("productId");
CREATE INDEX IF NOT EXISTS "idx_reviews_user" ON "product_reviews"("userId");
CREATE INDEX IF NOT EXISTS "idx_reviews_rating" ON "product_reviews"("rating" DESC);

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS "idx_promotions_active" ON "promotions"("isActive") WHERE "isActive" = true;
-- User deletion usually handled by deletedAt, but User model has isActive instead of deletedAt in the provided schema (lines 157).
-- However, user prompt says `WHERE "deletedAt" IS NULL`. Schema line 157 says `isActive Boolean @default(true)`. 
-- I will use `isActive = true` to match schema.
CREATE INDEX IF NOT EXISTS "idx_users_active" ON "users"("isActive") WHERE "isActive" = true;
