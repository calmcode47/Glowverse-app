export enum ARUserSegment {
  NEW_USER = "new_user",
  CASUAL_USER = "casual_user",
  FREQUENT_USER = "frequent_user",
  POWER_USER = "power_user",
  CONVERTER = "converter",
  BROWSER = "browser",
  SHARER = "sharer"
}

export type ARUserBehavior = {
  userId: string;
  segment: ARUserSegment;
  totalSessions: number;
  totalProductsTried: number;
  totalPurchases: number;
  conversionRate: number;
  averageSessionDuration: number;
  favoriteCategory: string;
  lastActiveDate: Date;
  shareRate?: number;
};

export function classifyARUser(behavior: ARUserBehavior): ARUserSegment {
  if (behavior.totalSessions <= 1) return ARUserSegment.NEW_USER;
  if (behavior.conversionRate > 0.3) return ARUserSegment.CONVERTER;
  if ((behavior.shareRate || 0) > 0.4) return ARUserSegment.SHARER;
  if (behavior.totalSessions > 20) return ARUserSegment.POWER_USER;
  if (behavior.totalSessions > 5) return ARUserSegment.FREQUENT_USER;
  if (behavior.totalSessions > 1 && behavior.conversionRate < 0.05) return ARUserSegment.BROWSER;
  return ARUserSegment.CASUAL_USER;
}

