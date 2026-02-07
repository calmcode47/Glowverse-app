import React from 'react';
import { View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';

interface OptimizedViewProps extends ViewProps {
  withBlur?: boolean;
  withShadow?: boolean;
  children?: React.ReactNode;
}

export const OptimizedView: React.FC<OptimizedViewProps> = ({
  withBlur = false,
  withShadow = false,
  style,
  children,
  ...props
}) => {
  const { profile } = useDeviceProfile();
  if (withBlur && profile?.enableBlur) {
    return (
      <BlurView intensity={60} style={style}>
        {children}
      </BlurView>
    );
  }
  const viewStyle = [
    style,
    withShadow &&
      profile?.enableShadows && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4
      }
  ];
  return (
    <View style={viewStyle as any} {...props}>
      {children}
    </View>
  );
};
