import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { analytics } from "./analytics.service";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface QueuedRequest {
  id: string;
  url: string;
  method: HttpMethod;
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

const QUEUE_KEY = "@offline_request_queue";
const MAX_QUEUE_SIZE = 100;
const MAX_RETRIES = 3;

class OfflineQueueService {
  private queue: QueuedRequest[] = [];
  private processing = false;

  async initialize(): Promise<void> {
    await this.loadQueue();
    NetInfo.addEventListener((state: NetInfoState) => {
      if (state.isConnected) {
        this.processQueue();
      }
    });
  }

  async addToQueue(url: string, method: string, data?: any, headers?: Record<string, string>): Promise<void> {
    const request: QueuedRequest = {
      id: `${Date.now()}_${Math.random()}`,
      url,
      method: method.toUpperCase() as HttpMethod,
      data,
      headers,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: MAX_RETRIES
    };
    this.queue.push(request);
    if (this.queue.length > MAX_QUEUE_SIZE) {
      this.queue.shift();
    }
    await this.saveQueue();
    analytics.logEvent({
      name: "request_queued",
      properties: { url, method }
    });
  }

  async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const request = this.queue[0];
      try {
        await this.executeRequest(request);
        this.queue.shift();
        await this.saveQueue();
        analytics.logEvent({
          name: "request_synced",
          properties: { url: request.url, method: request.method }
        });
      } catch (error: any) {
        request.retryCount++;
        if (request.retryCount >= request.maxRetries) {
          // eslint-disable-next-line no-console
          console.error("Request failed after max retries:", request);
          this.queue.shift();
          analytics.logEvent({
            name: "request_failed",
            properties: { url: request.url, method: request.method, error: error?.message || "Unknown" }
          });
        }
        await this.saveQueue();
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          break;
        }
      }
    }
    this.processing = false;
  }

  private async executeRequest(request: QueuedRequest): Promise<any> {
    const response = await fetch(request.url, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        ...(request.headers || {})
      },
      body: request.data ? JSON.stringify(request.data) : undefined
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  private async saveQueue(): Promise<void> {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
  }

  private async loadQueue(): Promise<void> {
    const stored = await AsyncStorage.getItem(QUEUE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) this.queue = parsed;
      } catch {
        this.queue = [];
      }
    }
  }

  async clearQueue(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(QUEUE_KEY);
  }

  getQueueSize(): number {
    return this.queue.length;
  }
}

export const offlineQueue = new OfflineQueueService();
