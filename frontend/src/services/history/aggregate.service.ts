import * as AnalysisAPI from '../api/analysis.api';
import * as FitnessAPI from '../api/fitness.api';
import * as TryOnAPI from '../api/tryon.api';
import * as OrdersAPI from '../api/orders.api';
import type { ActivityItem } from './types';

export async function fetchAnalysisHistory(): Promise<ActivityItem[]> {
  const res = await AnalysisAPI.getAnalyses({ limit: 50 });
  const items = (res.analyses || []).map(a => ({
    id: a.id,
    type: 'analysis' as const,
    timestamp: Date.parse(a.createdAt),
    title: 'Skin Analysis',
    description: a.status,
    thumbnailUrl: a.processedImageUrl || a.originalImageUrl,
    metadata: a
  }));
  return items;
}

export async function fetchFitnessHistory(): Promise<ActivityItem[]> {
  const list = await FitnessAPI.getActivities();
  return list.map(a => ({
    id: a.id,
    type: 'fitness' as const,
    timestamp: Date.parse(a.createdAt),
    title: a.type,
    description: `${a.duration}m • ${a.calories} cal`,
    metadata: a
  }));
}

export async function fetchTryOnHistory(): Promise<ActivityItem[]> {
  const res = await TryOnAPI.getTryOns({ limit: 50 });
  const arr = res.items || [];
  return arr.map(t => ({
    id: t.id,
    type: 'tryon' as const,
    timestamp: Date.parse(t.createdAt),
    title: 'AR Try-On',
    description: t.productName || t.type,
    thumbnailUrl: t.resultImageUrl || t.originalImageUrl,
    metadata: t
  }));
}

export async function fetchOrderHistory(): Promise<ActivityItem[]> {
  const orders = await OrdersAPI.listOrders();
  return orders.map(o => ({
    id: o.id,
    type: 'order' as const,
    timestamp: Date.parse(o.createdAt),
    title: `Order #${o.number || o.id.slice(0, 6)}`,
    description: `${o.items?.length || 0} items • $${o.total?.toFixed?.(2) || o.total}`,
    metadata: o
  }));
}

export function combineAndSort(items: ActivityItem[]): ActivityItem[] {
  return items.sort((a, b) => b.timestamp - a.timestamp);
}

export async function aggregateActivity(): Promise<ActivityItem[]> {
  const [analyses, fitness, tryons, orders] = await Promise.all([
    fetchAnalysisHistory(),
    fetchFitnessHistory(),
    fetchTryOnHistory(),
    fetchOrderHistory()
  ]);
  return combineAndSort([...analyses, ...fitness, ...tryons, ...orders]);
}

