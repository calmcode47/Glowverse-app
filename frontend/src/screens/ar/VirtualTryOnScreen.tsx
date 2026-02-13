import * as React from "react";
import { View, StyleSheet, Image, Linking, TouchableOpacity, PanResponder, Share } from "react-native";
import { useTheme, IconButton, Button, Text, ActivityIndicator } from "react-native-paper";
import { Camera, CameraView } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCamera } from "@hooks/useCamera";
import MakeupDrawer from "@components/ar/MakeupDrawer";
import ColorPicker from "@components/ar/ColorPicker";
import IntensitySlider from "@components/ar/IntensitySlider";
import SaveLookModal from "@components/ar/SaveLookModal";
import * as TryOnAPI from "@services/api/tryon.api";
import Toast, { ToastRef } from "@components/common/Toast";
import { useCameraContext } from "@context/CameraContext";
import ShadeSelector from "@components/ar/ShadeSelector";
import CompareControl from "@components/ar/CompareControl";
import CaptureButton from "@components/ar/CaptureButton";
import * as ProductsAPI from "@services/api/products.api";
import * as CartAPI from "@services/api/cart.api";
import { analytics } from "@services/analytics.service";

export default function VirtualTryOnScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { capturePhoto, cameraType, toggleCameraType, requestPermissions } = useCamera();
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
  const [processing, setProcessing] = React.useState(false);
  const pollRef = React.useRef<number | null>(null);
  const [hasPerm, setHasPerm] = React.useState<boolean | null>(null);
  const [product, setProduct] = React.useState<any>(null);
  const [productLoading, setProductLoading] = React.useState(false);
  const [reveal, setReveal] = React.useState<number>(1); // 0..1 reveal overlay height for compare
  const backoffRef = React.useRef<number>(1000);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = React.useRef<number | null>(null);

  const categories = ["Lipstick", "Eyeshadow", "Blush", "Foundation"];
  const products = [
    { id: "lip-rose", image: "https://images.unsplash.com/photo-1606311805150-739bb665792b?w=640&q=80", name: "Rose", brand: "Glowverse", price: "$19", colors: ["#E91E63", "#9C27B0", "#F06292"] },
    { id: "lip-ruby", image: "https://images.unsplash.com/photo-1542382257-80dedb725818?w=640&q=80", name: "Ruby", brand: "Glowverse", price: "$21", colors: ["#C62828", "#AD1457", "#FF5252"] },
    { id: "eye-sky", image: "https://images.unsplash.com/photo-1541643600914-78b0843f6b42?w=640&q=80", name: "Sky", brand: "Glowverse", price: "$17", colors: ["#3F51B5", "#2196F3", "#00BCD4"] }
  ];

  const pollForResults = async (tryOnId: string, startedAt = Date.now()) => {
    try {
      const res = await TryOnAPI.getTryOn(tryOnId);
      const t = res.tryOn;
      if (t.status === "COMPLETED") {
        setOverlayUri(t.resultImageUrl || null);
        setProcessing(false);
        toastRef.current?.show({ title: "Applied", variant: "success" });
        backoffRef.current = 1000;
        return;
      }
      if (t.status === "FAILED") {
        setProcessing(false);
        setOverlayUri(null);
        toastRef.current?.show({ title: "Try-on failed", variant: "error" });
        backoffRef.current = 1000;
        return;
      }
      if (Date.now() - startedAt > 60000) {
        setProcessing(false);
        toastRef.current?.show({ title: "Try-on timeout", variant: "error" });
        backoffRef.current = 1000;
        return;
      }
      const delay = Math.min(backoffRef.current, 30000);
      backoffRef.current = Math.min(backoffRef.current * 2, 30000);
      timeoutRef.current && clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => pollForResults(tryOnId, startedAt), delay);
    } catch (err: any) {
      setProcessing(false);
      toastRef.current?.show({ title: err?.message || "Network error", variant: "error" });
      backoffRef.current = 1000;
    }
  };

  const tryOnProduct = async (prod: { id: string }) => {
    const result = await capturePhoto(cameraRef.current as any);
    if (!result?.uri) return;
    try {
      setProcessing(true);
      toastRef.current?.show({ title: "Analyzing face...", variant: "info" });
      const created = await TryOnAPI.createTryOn(
        { uri: result.uri, name: "tryon.jpg", type: "image/jpeg" },
        { type: "FULL_MAKEUP", productId: prod.id, intensity: Math.min(Math.max(intensity / 100, 0), 1) }
      );
      const tryOnId = created.tryOn.id;
      addImage({ uri: result.uri, timestamp: Date.now(), mode: "makeup" } as any);
      toastRef.current?.show({ title: "Applying makeup...", variant: "info" });
      backoffRef.current = 1000;
      startRef.current = Date.now();
      await pollForResults(tryOnId);
      if (startRef.current) {
        const duration = (Date.now() - startRef.current) / 1000;
        await analytics.logTryOnComplete(tryOnId, duration);
      }
    } catch (error) {
      console.error("Try-on error:", error);
      setProcessing(false);
      toastRef.current?.show({ title: "Failed to apply makeup", variant: "error" });
    }
  };

  const onCapture = async () => {
    const result = await capturePhoto(cameraRef.current as any);
    if (result?.uri) {
      addImage({ uri: result.uri, timestamp: Date.now(), mode: "makeup" } as any);
      toastRef.current?.show({ title: "Captured", variant: "info" });
    }
  };

  React.useEffect(() => {
    (async () => {
      const res = await requestPermissions();
      setHasPerm(res.camera);
    })();
  }, []);

  React.useEffect(() => {
    const pid = route.params?.productId as string | undefined;
    if (!pid) return;
    (async () => {
      try {
        setProductLoading(true);
        const p = await ProductsAPI.getProductById(pid);
        setProduct(p);
        if (p.colors?.length) setSelectedColor(p.colors[0]);
        if (p) await analytics.logTryOnStart(p as any);
      } finally {
        setProductLoading(false);
      }
    })();
  }, [route.params?.productId]);

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => compare,
      onPanResponderMove: (_, gesture) => {
        if (!compare) return;
        const h = Math.max(0, Math.min(1, 1 - gesture.dy / 400));
        setReveal(h);
      }
    })
  ).current;

  if (hasPerm === false) {
    return (
      <View style={styles.permContainer}>
        <Text style={{ color: theme.colors.text.primary, fontWeight: "800", fontSize: 16, marginBottom: 8 }}>Camera Access Needed</Text>
        <Text style={{ color: theme.colors.text.secondary, textAlign: "center", marginBottom: 12 }}>
          We use your camera to render virtual try-on. You can upload a photo instead, or enable access in Settings.
        </Text>
        <Button mode="contained" onPress={() => Linking.openSettings?.() || Linking.openURL("app-settings:")}>Open Settings</Button>
        <Button style={{ marginTop: 8 }} onPress={() => setDrawerOpen(true)}>Upload Photo</Button>
      </View>
    );
  }

  if (hasPerm === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: theme.colors.text.secondary }}>Initializing camera…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {(() => {
        const CameraViewAny = CameraView as any;
        return <CameraViewAny ref={(r: any) => (cameraRef.current = r)} style={styles.camera} facing={cameraType as any} />;
      })()}
      {overlayUri ? (
        compare ? (
          <View style={[styles.overlayMask, { height: `${Math.round(reveal * 100)}%` }]}>
            <Image source={{ uri: overlayUri }} style={styles.overlay} />
          </View>
        ) : (
          <Image source={{ uri: overlayUri }} style={styles.overlay} />
        )
      ) : null}
      <View style={styles.topBar}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <IconButton icon={compare ? "eye-off-outline" : "eye-outline"} onPress={() => setCompare((v: boolean) => !v)} />
        <IconButton icon="camera-switch" onPress={toggleCameraType} />
      </View>
      {/* Product overlay */}
      <View style={styles.productOverlay}>
        {productLoading ? (
          <ActivityIndicator />
        ) : product ? (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <Text style={{ color: "#fff", fontWeight: "800" }}>{product.name}</Text>
              <Text style={{ color: "#ffffffcc" }}>{selectedColor} • ${product.price?.toFixed?.(2) || product.price}</Text>
            </View>
            <Button compact mode="contained-tonal" onPress={() => setDrawerOpen(true)}>Change Shade</Button>
          </View>
        ) : null}
      </View>
      <View style={styles.bottomBar}>
        <IconButton icon="backup-restore" onPress={() => setOverlayUri(null)} disabled={processing} />
        <CaptureButton onPress={onCapture} />
        <IconButton icon="share-variant" onPress={async () => {
          try {
            const uri = overlayUri;
            if (!uri) return;
            const perm = await MediaLibrary.requestPermissionsAsync();
            if (perm.status !== "granted") {
              toastRef.current?.show({ title: "Media permission required to save", variant: "error" });
              return;
            }
            await MediaLibrary.createAssetAsync(uri);
            await Share.share({ url: uri, message: `Check this look: ${product?.name || "Makeup"}` });
          } catch (e: any) {
            toastRef.current?.show({ title: e?.message || "Share failed", variant: "error" });
          }
        }} disabled={processing} />
      </View>
      <View style={styles.controls}>
        <ColorPicker value={selectedColor} onChange={setSelectedColor} />
        <IntensitySlider value={intensity} onChange={setIntensity} onReset={() => setIntensity(70)} />
        <ShadeSelector shades={product?.colors || products[0].colors || []} value={selectedColor} onChange={(c) => { setSelectedColor(c); if (product) tryOnProduct({ id: product.id }); }} />
        <CompareControl enabled={compare} onToggle={() => setCompare((v) => !v)} />
        <Button mode="contained" onPress={() => product && CartAPI.addItem({ productId: product.id, quantity: 1 })} disabled={!product || processing}>Add to Cart</Button>
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
  overlayMask: { position: "absolute", left: 0, right: 0, bottom: 0, overflow: "hidden" },
  topBar: { position: "absolute", top: 12, left: 12, right: 12, flexDirection: "row", justifyContent: "space-between" },
  bottomBar: { position: "absolute", bottom: 24, left: 24, right: 24, flexDirection: "row", justifyContent: "space-between" },
  controls: { position: "absolute", left: 12, right: 12, bottom: 96, gap: 8 },
  productOverlay: { position: "absolute", top: 56, left: 12, right: 12, padding: 8, backgroundColor: "#00000066", borderRadius: 10 },
  permContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16, gap: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" }
});
