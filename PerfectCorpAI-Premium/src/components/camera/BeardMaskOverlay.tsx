import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function BeardMaskOverlay() {
  // Simple UI-only chin/beard zone path
  const width = 300;
  const height = 300;
  const path = `
    M ${width * 0.2} ${height * 0.55}
    Q ${width * 0.5} ${height * 0.80} ${width * 0.8} ${height * 0.55}
    Q ${width * 0.5} ${height * 0.95} ${width * 0.2} ${height * 0.55}
    Z
  `;
  return (
    <Svg pointerEvents="none" width={width} height={height} style={styles.container}>
      <Path d={path} fill="rgba(255, 107, 44, 0.15)" stroke="#FF6B2C" strokeWidth={2} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '22%',
    alignSelf: 'center'
  }
});
