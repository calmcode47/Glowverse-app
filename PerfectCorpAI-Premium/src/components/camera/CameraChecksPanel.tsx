import React, { useState } from 'react';
import { View, StyleSheet, Text, Switch } from 'react-native';
import { theme } from '@/design-system/theme';

interface CheckItem {
  id: string;
  label: string;
  active: boolean;
}

export default function CameraChecksPanel() {
  const [checks, setChecks] = useState<CheckItem[]>([
    { id: 'skin_tone', label: 'Skin Tone', active: true },
    { id: 'beard_area', label: 'Beard Area', active: true },
    { id: 'glare_detection', label: 'Glare Detection', active: false }
  ]);

  const toggle = (id: string) => {
    setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera Checks</Text>
      {checks.map((c) => (
        <View key={c.id} style={styles.row}>
          <Text style={styles.label}>{c.label}</Text>
          <Switch value={c.active} onValueChange={() => toggle(c.id)} thumbColor={c.active ? '#FF6B2C' : '#888'} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: '#2D3250',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4]
  },
  title: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.neutral[0],
    marginBottom: theme.spacing[2],
    fontWeight: '600' as any
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[2]
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.neutral[0]
  }
});
