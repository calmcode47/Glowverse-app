import React from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";
import { FlatList } from "react-native-gesture-handler";

type Banner = {
  image: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  onPress?: () => void;
};

type Props = {
  items: Banner[];
  autoPlay?: boolean;
};

const { width } = Dimensions.get("window");

export default function HeroBanner({ items, autoPlay = true }: Props) {
  const theme = useTheme();
  const [index, setIndex] = React.useState(0);
  const listRef = React.useRef<FlatList>(null);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => {
      const next = (index + 1) % items.length;
      setIndex(next);
      listRef.current?.scrollToIndex({ index: next, animated: true });
      opacity.value = withTiming(0.8, { duration: 200 }, () => {
        opacity.value = withTiming(1, { duration: 200 });
      });
    }, 3500);
    return () => clearInterval(id);
  }, [index, items.length, autoPlay]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef as any}
        data={items}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Animated.View style={[styles.overlay, overlayStyle]}>
              <Text variant="titleLarge" style={styles.title}>{item.title}</Text>
              {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
              {item.ctaText ? (
                <Button mode="contained" onPress={item.onPress}>{item.ctaText}</Button>
              ) : null}
            </Animated.View>
          </View>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          setIndex(Math.round(x / width));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 180 },
  slide: { width: width, height: 180 },
  image: { width: "100%", height: "100%" },
  overlay: { position: "absolute", left: 16, right: 16, bottom: 16 },
  title: { color: "#fff", marginBottom: 6 },
  subtitle: { color: "#fff", marginBottom: 12 }
});
