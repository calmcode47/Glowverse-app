import { useCallback, useState } from 'react';
import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { useUIStore } from '@/stores/ui.store';

export const useBackendHealth = () => {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const { showToast } = useUIStore();

  const check = useCallback(async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.HEALTH, { timeout: 8000 });
      setHealthy(true);
      showToast({ type: 'success', message: 'Backend connected' });
    } catch (e: any) {
      setHealthy(false);
      showToast({ type: 'error', message: e?.message || 'Backend unreachable' });
    }
  }, []);

  return { healthy, check };
};
