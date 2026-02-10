import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface PriceTrendGraphProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
}

export default function PriceTrendGraph({
    data,
    width = 120,
    height = 40,
    color = '#10B981'
}: PriceTrendGraphProps) {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);

    // Build the path
    const points = data.map((val, idx) => {
        const x = idx * stepX;
        const y = height - ((val - min) / range) * (height - 4) - 2; // 2px padding
        return `${x},${y}`;
    });

    const pathData = `M ${points.join(' L ')}`;

    // Create area path for gradient
    const areaData = `${pathData} L ${width},${height} L 0,${height} Z`;

    return (
        <View style={{ width, height, overflow: 'hidden' }}>
            <Svg width={width} height={height}>
                <Defs>
                    <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={color} stopOpacity="0.3" />
                        <Stop offset="1" stopColor={color} stopOpacity="0" />
                    </LinearGradient>
                </Defs>
                <Path
                    d={areaData}
                    fill="url(#gradient)"
                />
                <Path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>
        </View>
    );
}
