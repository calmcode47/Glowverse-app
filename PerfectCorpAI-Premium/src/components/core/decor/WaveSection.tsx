import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinear, Stop, Path } from 'react-native-svg';

interface WaveSectionProps {
  height?: number;
  topColor?: string;
  bottomColor?: string;
}

export const WaveSection: React.FC<WaveSectionProps> = ({ height = 160, topColor = '#FFFFFF', bottomColor = '#FFE6CC' }) => {
  const { width } = Dimensions.get('window');
  const h = height;
  const path = `M0 0 H ${width} V ${h} Q ${width * 0.6} ${h - 70} ${width * 0.3} ${h - 20} Q ${width * 0.1} ${h - 0} 0 ${h - 40} Z`;
  return (
    <Svg width={width} height={h}>
      <Defs>
        <SvgLinear id="waveGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={topColor} stopOpacity="1" />
          <Stop offset="1" stopColor={bottomColor} stopOpacity="1" />
        </SvgLinear>
      </Defs>
      <Path d={path} fill="url(#waveGrad)" />
    </Svg>
  );
};
