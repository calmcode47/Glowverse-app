import React from 'react';
import { ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressProps {
  value: number;
  maxValue?: number;
  radius?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  maxValue = 100,
  radius = 50,
  strokeWidth = 8,
  color = '#FF6B2C',
  backgroundColor = '#222',
  style
}) => {
  const size = radius * 2;
  const circumference = 2 * Math.PI * (radius - strokeWidth / 2);
  const progress = Math.max(0, Math.min(value, maxValue));
  const offset = circumference - (progress / maxValue) * circumference;

  return (
    <Svg width={size} height={size} style={style}>
      <Circle
        cx={radius}
        cy={radius}
        r={radius - strokeWidth / 2}
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={radius}
        cy={radius}
        r={radius - strokeWidth / 2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="none"
        transform={`rotate(-90 ${radius} ${radius})`}
      />
    </Svg>
  );
};
