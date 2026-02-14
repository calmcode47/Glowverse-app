export enum AnalyticsEventName {
  ADD_TO_WISHLIST = "add_to_wishlist",
  REMOVE_FROM_WISHLIST = "remove_from_wishlist",
  VIEW_WISHLIST = "view_wishlist",
  SHARE_WISHLIST = "share_wishlist",

  APPLY_FILTER = "apply_filter",
  REMOVE_FILTER = "remove_filter",
  CHANGE_SORT = "change_sort",

  NOTIFICATION_RECEIVED = "notification_received",
  NOTIFICATION_OPENED = "notification_opened",
  NOTIFICATION_DISMISSED = "notification_dismissed",

  PROMO_VIEWED = "promo_viewed",
  PROMO_COPIED = "promo_copied",
  PROMO_APPLIED = "promo_applied",
  PROMO_FAILED = "promo_failed",

  REFERRAL_SHARED = "referral_shared",
  REFERRAL_CLICKED = "referral_clicked",
  REFERRAL_SIGNUP = "referral_signup",

  PAYMENT_METHOD_SELECTED = "payment_method_selected",
  PAYMENT_METHOD_ADDED = "payment_method_added",

  REVIEW_STARTED = "review_started",
  REVIEW_SUBMITTED = "review_submitted"
}

export interface WishlistEventParams {
  item_id: string;
  item_name?: string;
  price?: number;
  currency?: string;
  source?: "product_detail" | "product_list";
}

export interface FilterEventParams {
  filter_type: "category" | "price" | "brand" | "rating" | "sort";
  filter_value: string | number;
  results_count: number;
}

export interface PromoEventParams {
  promo_code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  cart_value?: number;
  reason?: string;
}

export interface NotificationEventParams {
  notification_id?: string;
  notification_type?: string;
  title?: string;
}

export interface ReferralEventParams {
  code: string;
  user_id?: string;
}

export interface PaymentEventParams {
  method: "card" | "paypal" | "applepay" | "googlepay";
  payment_method_id?: string;
}

export interface ReviewStartedParams {
  item_id: string;
  item_name?: string;
}

export interface ReviewSubmittedParams {
  item_id: string;
  rating: number;
  comment_length?: number;
}

export type AnalyticsEventParams = {
  [AnalyticsEventName.ADD_TO_WISHLIST]: WishlistEventParams;
  [AnalyticsEventName.REMOVE_FROM_WISHLIST]: WishlistEventParams;
  [AnalyticsEventName.VIEW_WISHLIST]: Record<string, never>;
  [AnalyticsEventName.SHARE_WISHLIST]: Record<string, never>;

  [AnalyticsEventName.APPLY_FILTER]: FilterEventParams;
  [AnalyticsEventName.REMOVE_FILTER]: FilterEventParams;
  [AnalyticsEventName.CHANGE_SORT]: FilterEventParams;

  [AnalyticsEventName.NOTIFICATION_RECEIVED]: NotificationEventParams;
  [AnalyticsEventName.NOTIFICATION_OPENED]: NotificationEventParams;
  [AnalyticsEventName.NOTIFICATION_DISMISSED]: NotificationEventParams;

  [AnalyticsEventName.PROMO_VIEWED]: { promo_code?: string };
  [AnalyticsEventName.PROMO_COPIED]: { promo_code: string };
  [AnalyticsEventName.PROMO_APPLIED]: PromoEventParams;
  [AnalyticsEventName.PROMO_FAILED]: PromoEventParams;

  [AnalyticsEventName.REFERRAL_SHARED]: ReferralEventParams;
  [AnalyticsEventName.REFERRAL_CLICKED]: ReferralEventParams;
  [AnalyticsEventName.REFERRAL_SIGNUP]: ReferralEventParams;

  [AnalyticsEventName.PAYMENT_METHOD_SELECTED]: PaymentEventParams;
  [AnalyticsEventName.PAYMENT_METHOD_ADDED]: PaymentEventParams;

  [AnalyticsEventName.REVIEW_STARTED]: ReviewStartedParams;
  [AnalyticsEventName.REVIEW_SUBMITTED]: ReviewSubmittedParams;
};
