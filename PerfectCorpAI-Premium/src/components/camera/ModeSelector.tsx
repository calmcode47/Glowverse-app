import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { useCameraStore } from '@/stores/camera.store';
import { theme } from '@/design-system/theme';

interface Props {
  style?: ViewStyle;
}

const modes: Array<'photo' | 'analysis' | 'tryon'> = ['photo', 'analysis', 'tryon'];

export default function ModeSelector({ style }: Props) {
  const { currentMode, setMode } = useCameraStore();
  return (
    <View style={[styles.container, style]}>
      {modes.map((m) => {
        const active = currentMode === m;
        return (
          <TouchableOpacity
            key={m}
            onPress={() => setMode(m)}
            style={[styles.mode, active ? styles.modeActive : styles.modeInactive]}
            activeOpacity={0.85}
          >
            <Text style={[styles.text, active ? styles.textActive : styles.textInactive]}>{m.toUpperCase()}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2]
  },
  mode: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.base,
    borderWidth: 1
  },
  modeActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500]
  },
  modeInactive: {
    backgroundColor: theme.colors.glass.dark,
    borderColor: theme.colors.glass.dark
  },
  text: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold as any
  },
  textActive: {
    color: theme.colors.neutral[0]
  },
  textInactive: {
    color: theme.colors.neutral[200]
  }
});
