import React from "react";
import { View, Image as RNImage, StyleSheet, Animated } from "react-native";
import { transform, lowRes } from "../../utils/cloudinaryTransform";

let FastImage: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  FastImage = require("react-native-fast-image");
} catch {}

type Props = {
  uri: string;
  width?: number;
  height?: number;
  priority?: "low" | "normal" | "high";
  resizeMode?: "contain" | "cover" | "stretch" | "center";
  placeholder?: string;
  variant?: "thumb" | "detail" | "avatar";
  visible?: boolean;
  alt?: string;
  decorative?: boolean;
};

export default function OptimizedImage({ uri, width, height, priority = "normal", resizeMode = "cover", placeholder, variant = "thumb", visible = true, alt, decorative }: Props) {
  const [loaded, setLoaded] = React.useState(false);
  const fade = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (loaded) Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [loaded, fade]);

  if (!visible) return <View style={{ width, height, backgroundColor: "#e5e7eb", borderRadius: 12 }} />;

  const hi = transform(uri, variant);
  const lo = placeholder || lowRes(uri);

  const a11yProps: any = decorative
    ? { accessible: false, accessibilityRole: "none" }
    : { accessible: true, accessibilityRole: "image", accessibilityLabel: alt || "Image" };

  if (FastImage) {
    const Pri: any = { low: FastImage.priority.low, normal: FastImage.priority.normal, high: FastImage.priority.high }[priority];
    return (
      <View style={{ width, height }} {...a11yProps}>
        <RNImage source={{ uri: lo }} style={[styles.img, { width, height, position: "absolute" }]} blurRadius={2} />
        <Animated.View style={{ opacity: fade }}>
          <FastImage
            source={{ uri: hi, priority: Pri }}
            style={[styles.img, { width, height }]}
            resizeMode={FastImage.resizeMode[resizeMode] || FastImage.resizeMode.cover}
            onLoadEnd={() => setLoaded(true)}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ width, height }} {...a11yProps}>
      <RNImage source={{ uri: lo }} style={[styles.img, { width, height, position: "absolute" }]} blurRadius={2} />
      <Animated.Image
        source={{ uri: hi }}
        style={[styles.img, { width, height, opacity: fade }]}
        resizeMode={resizeMode}
        onLoadEnd={() => setLoaded(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  img: { borderRadius: 12, backgroundColor: "#e5e7eb" }
});
