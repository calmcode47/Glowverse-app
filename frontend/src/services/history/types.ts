export type HistoryTab = 'all' | 'analysis' | 'fitness' | 'tryons' | 'orders';

export type ActivityItem = {
  id: string;
  type: 'analysis' | 'fitness' | 'tryon' | 'order';
  timestamp: number;
  title: string;
  description: string;
  thumbnailUrl?: string;
  metadata: any;
};

export type QuickStatsData = {
  analysesCount: number;
  lastAnalysisDate?: string;
  improvementScore?: number;
  activeDays?: number;
  productsTriedAR?: number;
  ordersCount?: number;
};

