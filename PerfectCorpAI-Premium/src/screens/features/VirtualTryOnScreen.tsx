import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { theme } from '@/design-system/theme';
import ProductSelector from '@/components/tryon/ProductSelector';
import ColorPicker from '@/components/tryon/ColorPicker';
import IntensityControl from '@/components/tryon/IntensityControl';
import VirtualMakeupView from '@/components/tryon/VirtualMakeupView';
import { PrimaryButton } from '@/components/core/buttons/PrimaryButton';
import { useUIStore } from '@/stores/ui.store';

const DEFAULT_COLORS = ['#FF4D6D', '#E11D48', '#A855F7', '#3B82F6', '#22C55E', '#F59E0B'];
const CATEGORIES = ['lipstick', 'blush', 'eyes'];

export default function VirtualTryOnScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { showToast } = useUIStore();
  const imageUri = (route.params as any)?.imageUri as string | undefined;

  const [category, setCategory] = React.useState<string>(CATEGORIES[0]);
  const [color, setColor] = React.useState<string>(DEFAULT_COLORS[0]);
  const [intensity, setIntensity] = React.useState<number>(0.5);
  const [showBefore, setShowBefore] = React.useState<boolean>(false);

  const handleSave = () => {
    showToast({ type: 'success', message: 'Look saved!' });
  };

  const handleShare = () => {
    showToast({ type: 'success', message: 'Shared successfully!' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Virtual Try-On</Text>
      <View style={styles.preview}>
        {!showBefore ? (
          <VirtualMakeupView imageUri={imageUri} color={color} intensity={intensity} />
        ) : (
          <VirtualMakeupView imageUri={imageUri} color={'#000000'} intensity={0} />
        )}
      </View>
      <View style={styles.controls}>
        <ProductSelector categories={CATEGORIES} selected={category} onChange={setCategory} />
        <ColorPicker colors={DEFAULT_COLORS} selected={color} onChange={setColor} style={{ marginTop: theme.spacing[3] }} />
        <IntensityControl value={intensity} onChange={setIntensity} style={{ marginTop: theme.spacing[3] }} />
        <View style={styles.actions}>
          <PrimaryButton title={showBefore ? 'Show After' : 'Show Before'} onPress={() => setShowBefore((v) => !v)} variant="outline" />
          <PrimaryButton title="Save Look" onPress={handleSave} variant="solid" />
          <PrimaryButton title="Share" onPress={handleShare} variant="gradient" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing[4]
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[3]
  },
  preview: {
    marginBottom: theme.spacing[4]
  },
  controls: {},
  actions: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    marginTop: theme.spacing[4]
  }
});
