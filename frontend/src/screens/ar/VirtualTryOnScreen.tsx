import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { useTheme, IconButton, Button, Text } from "react-native-paper";
import { CameraView } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { useCamera } from "@hooks/useCamera";
import MakeupDrawer from "@components/ar/MakeupDrawer";
import ColorPicker from "@components/ar/ColorPicker";
import IntensitySlider from "@components/ar/IntensitySlider";
import SaveLookModal from "@components/ar/SaveLookModal";
import { uploadImage, applyMakeup } from "@services/api/perfectcorp";
import * as FaceDetector from "expo-face-detector";
import Toast, { ToastRef } from "@components/common/Toast";
import { useCameraContext } from "@context/CameraContext";

export default function VirtualTryOnScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { capturePhoto, cameraType, toggleCameraType } = useCamera();
  const { addImage } = useCameraContext();
  const [drawerOpen, setDrawerOpen] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState("Lipstick");
  const [selectedColor, setSelectedColor] = React.useState("#E91E63");
  const [intensity, setIntensity] = React.useState(70);
  const [compare, setCompare] = React.useState(false);
  const [overlayUri, setOverlayUri] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saveOpen, setSaveOpen] = React.useState(false);
  const toastRef = React.useRef<ToastRef>(null);
  const cameraRef = React.useRef<any>(null);

  const categories = ["Lipstick", "Eyeshadow", "Blush", "Foundation"];
  const products = [
    { id: "lip-rose", image: "https://images.unsplash.com/photo-1606311805150-739bb665792b?w=640&q=80", name: "Rose", brand: "Glowverse", price: "$19", colors: ["#E91E63", "#9C27B0", "#F06292"] },
    { id: "lip-ruby", image: "https://images.unsplash.com/photo-1542382257-80dedb725818?w=640&q=80", name: "Ruby", brand: "Glowverse", price: "$21", colors: ["#C62828", "#AD1457", "#FF5252"] },
    { id: "eye-sky", image: "https://images.unsplash.com/photo-1541643600914-78b0843f6b42?w=640&q=80", name: "Sky", brand: "Glowverse", price: "$17", colors: ["#3F51B5", "#2196F3", "#00BCD4"] }
  ];

  const tryOnProduct = async (prod: { id: string }) => {
    const result = await capturePhoto(cameraRef.current as any);
    if (!result?.uri) return;
    const fd = await FaceDetector.detectFacesAsync(result.uri as any);
    if (!fd?.faces?.length) {
      toastRef.current?.show({ title: "No face detected", variant: "warning" });
      return;
    }
    const up = await uploadImage({ uri: result.uri, filename: "tryon.jpg", mimeType: "image/jpeg" });
    const applied = await applyMakeup(up.imageId, prod.id);
    if (applied.previewUri) {
      setOverlayUri(applied.previewUri);
      addImage({ uri: result.uri, timestamp: Date.now(), mode: "makeup" } as any);
      toastRef.current?.show({ title: "Applied", variant: "success" });
    }
  };

  const onCapture = async () => {
    const result = await capturePhoto(cameraRef.current as any);
    if (result?.uri) {
      addImage({ uri: result.uri, timestamp: Date.now(), mode: "makeup" } as any);
      toastRef.current?.show({ title: "Captured", variant: "info" });
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={(r: any) => (cameraRef.current = r)} style={styles.camera} facing={cameraType as any} />
      {overlayUri && !compare ? <Image source={{ uri: overlayUri }} style={styles.overlay} /> : null}
      <View style={styles.topBar}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <IconButton icon={compare ? "eye-off-outline" : "eye-outline"} onPress={() => setCompare((v) => !v)} />
        <IconButton icon="camera-switch" onPress={toggleCameraType} />
      </View>
      <View style={styles.bottomBar}>
        <IconButton icon="backup-restore" onPress={() => setOverlayUri(null)} />
        <IconButton icon="camera" onPress={onCapture} />
        <IconButton icon="content-save" onPress={() => setSaveOpen(true)} />
      </View>
      <View style={styles.controls}>
        <ColorPicker value={selectedColor} onChange={setSelectedColor} />
        <IntensitySlider value={intensity} onChange={setIntensity} onReset={() => setIntensity(70)} />
        <Button mode="contained" onPress={() => setDrawerOpen(true)}>Choose Product</Button>
      </View>
      <MakeupDrawer
        visible={drawerOpen}
        onDismiss={() => setDrawerOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(c) => setSelectedCategory(c)}
        products={products}
        onTryOn={(p) => { setDrawerOpen(false); tryOnProduct(p); }}
        onSelectColor={(c) => setSelectedColor(c)}
      />
      <SaveLookModal visible={saveOpen} onDismiss={() => setSaveOpen(false)} config={{ color: selectedColor, intensity, productId: products[0].id }} />
      <Toast ref={toastRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  overlay: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: 0.9 },
  topBar: { position: "absolute", top: 12, left: 12, right: 12, flexDirection: "row", justifyContent: "space-between" },
  bottomBar: { position: "absolute", bottom: 24, left: 24, right: 24, flexDirection: "row", justifyContent: "space-between" },
  controls: { position: "absolute", left: 12, right: 12, bottom: 96 }
});
