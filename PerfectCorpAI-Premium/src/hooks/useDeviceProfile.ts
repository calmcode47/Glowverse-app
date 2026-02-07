import { useState, useEffect } from 'react';
import { getDeviceProfile, DeviceProfile } from '@/utils/device-optimizer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_PROFILE_KEY = '@device_profile';

export const useDeviceProfile = () => {
  const [profile, setProfile] = useState<DeviceProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const cached = await AsyncStorage.getItem(DEVICE_PROFILE_KEY);
      if (cached) {
        setProfile(JSON.parse(cached));
        setIsLoading(false);
        return;
      }
      const detected = await getDeviceProfile();
      setProfile(detected);
      await AsyncStorage.setItem(DEVICE_PROFILE_KEY, JSON.stringify(detected));
    } catch {
      setProfile({
        isLowEnd: true,
        shouldReduceAnimations: true,
        shouldReduceQuality: true,
        imageQuality: 0.6,
        maxConcurrentAnimations: 2,
        enableBlur: false,
        enableParticles: false,
        enableShadows: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { profile, isLoading };
};
