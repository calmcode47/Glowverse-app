import React from "react";
import { View, Image as RNImage, StyleSheet, Animated } from "react-native";
import { transform, lowRes } from "../../utils/cloudinaryTransform";

let FastImage: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  FastImage = require("react-native-fast-image");
} catch { }

type Props = {
  uri: string;
  width?: number | string;
  height?: number | string;
  priority?: "low" | "normal" | "high";
  resizeMode?: "contain" | "cover" | "stretch" | "center";
  placeholder?: string;
  variant?: "thumb" | "detail" | "avatar";
  visible?: boolean;
  alt?: string;
  decorative?: boolean;
  style?: any;
  imageStyle?: any;
};

function hasCloudinaryTransform(u: string): boolean {
  try {
    const url = new URL(u);
    if (!url.hostname.includes("cloudinary")) return false;
    const parts = url.pathname.split("/");
    const idx = parts.findIndex((p) => p === "upload");
    if (idx !== -1 && parts[idx + 1]) {
      return parts[idx + 1].includes("c_");
    }
  } catch { }
  return false;
}

export default function OptimizedImage({ uri, width, height, priority = "normal", resizeMode = "cover", placeholder, variant = "thumb", visible = true, alt, decorative, style, imageStyle }: Props) {
  const [loaded, setLoaded] = React.useState(false);
  const fade = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (loaded) Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [loaded, fade]);

  const containerStyle =
    width !== undefined || height !== undefined
      ? [{ width, height }, style]
      : [{ width: "100%", height: "100%" }, style];

  if (!visible) return <View style={containerStyle as any} />;

  const hi = hasCloudinaryTransform(uri) ? uri : transform(uri, variant);
  const lo = placeholder || lowRes(uri);

  const a11yProps: any = decorative
    ? { accessible: false, accessibilityRole: "none" }
    : { accessible: true, accessibilityRole: "image", accessibilityLabel: alt || "Image" };

  if (FastImage) {
    const Pri: any = { low: FastImage.priority.low, normal: FastImage.priority.normal, high: FastImage.priority.high }[priority];
    return (
      <View style={containerStyle} {...a11yProps}>
        <RNImage source={{ uri: lo }} style={[styles.img, styles.absolute, imageStyle]} blurRadius={2} />
        <Animated.View style={{ opacity: fade }}>
          <FastImage
            source={{ uri: hi, priority: Pri }}
            style={[styles.img, styles.absolute, imageStyle]}
            resizeMode={FastImage.resizeMode[resizeMode] || FastImage.resizeMode.cover}
            onLoadEnd={() => setLoaded(true)}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={containerStyle} {...a11yProps}>
      <RNImage source={{ uri: lo }} style={[styles.img, styles.absolute, imageStyle]} blurRadius={2} />
      <Animated.Image
        source={{ uri: hi }}
        style={[styles.img, styles.absolute, imageStyle, { opacity: fade }]}
        resizeMode={resizeMode}
        onLoadEnd={() => setLoaded(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  img: { borderRadius: 12, backgroundColor: "#e5e7eb" },
  absolute: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }
});
