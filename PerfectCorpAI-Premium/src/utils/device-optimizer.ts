import { Platform, Dimensions } from 'react-native';

export interface DeviceProfile {
  isLowEnd: boolean;
  shouldReduceAnimations: boolean;
  shouldReduceQuality: boolean;
  imageQuality: number;
  maxConcurrentAnimations: number;
  enableBlur: boolean;
  enableParticles: boolean;
  enableShadows: boolean;
}

export const isLowEndDevice = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    if ((Platform.Version as number) < 28) return true;
  }
  if (Platform.OS === 'ios') {
    const { width, height } = Dimensions.get('window');
    const screenSize = width * height;
    if (screenSize < 750 * 1334) return true;
  }
  return false;
};

export const getDeviceProfile = async (): Promise<DeviceProfile> => {
  const lowEnd = await isLowEndDevice();
  if (lowEnd) {
    return {
      isLowEnd: true,
      shouldReduceAnimations: true,
      shouldReduceQuality: true,
      imageQuality: 0.6,
      maxConcurrentAnimations: 2,
      enableBlur: false,
      enableParticles: false,
      enableShadows: false
    };
  }
  return {
    isLowEnd: false,
    shouldReduceAnimations: false,
    shouldReduceQuality: false,
    imageQuality: 0.9,
    maxConcurrentAnimations: 10,
    enableBlur: true,
    enableParticles: true,
    enableShadows: true
  };
};

export const getAnimationConfig = (profile: DeviceProfile) => {
  if (profile.shouldReduceAnimations) {
    return {
      duration: 200,
      useNativeDriver: true,
      enableSpring: false
    };
  }
  return {
    duration: 300,
    useNativeDriver: true,
    enableSpring: true
  };
};

export const getImageConfig = (profile: DeviceProfile) => {
  return {
    quality: profile.imageQuality,
    maxWidth: profile.isLowEnd ? 1280 : 1920,
    maxHeight: profile.isLowEnd ? 720 : 1080,
    format: 'jpeg' as const,
    cache: profile.isLowEnd ? 'default' : 'aggressive'
  };
};
