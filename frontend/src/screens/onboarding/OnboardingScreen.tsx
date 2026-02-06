import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text, Button, useTheme, IconButton } from "react-native-paper";
import { FlatList } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import FadeInView from "@components/animations/FadeInView";
import ScaleInView from "@components/animations/ScaleInView";
import SlideInView from "@components/animations/SlideInView";
import LoadingAnimation from "@components/animations/LoadingAnimation";
import SuccessAnimation from "@components/animations/SuccessAnimation";
import { useApp } from "@context/AppContext";
import { useCamera } from "@hooks/useCamera";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

type Slide = {
  key: string;
  title: string;
  subtitle?: string;
  render: () => React.ReactNode;
};

export default function OnboardingScreen() {
  const theme = useTheme();
  const { setOnboardingComplete } = useApp();
  const { requestPermissions } = useCamera();
  const navigation = useNavigation();
  const [index, setIndex] = React.useState(0);
  const [autoPlay, setAutoPlay] = React.useState(true);
  const [permDone, setPermDone] = React.useState(false);
  const listRef = React.useRef<FlatList>(null);
  const appear = useSharedValue(0);
  React.useEffect(() => {
    appear.value = withTiming(1, { duration: 250 });
  }, []);
  const appearStyle = useAnimatedStyle(() => ({ opacity: appear.value }));

  React.useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => {
      setIndex((i) => {
        const next = Math.min(i + 1, slides.length - 1);
        listRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(id);
  }, [autoPlay]);

  const slides: Slide[] = [
    {
      key: "welcome",
      title: "Welcome to AI Beauty Experience",
      subtitle: "Discover personalized insights",
      render: () => (
        <View style={styles.center}>
          <ScaleInView>
            <Text variant="displaySmall">Glowverse</Text>
          </ScaleInView>
          <FadeInView delay={200}>
            <Text style={{ marginTop: 8, color: theme.colors.outline }}>Your journey starts here</Text>
          </FadeInView>
        </View>
      )
    },
    {
      key: "features",
      title: "Analyze your skin with AI",
      subtitle: "Try on makeup and more",
      render: () => (
        <View style={styles.center}>
          <SlideInView direction="up">
            <LoadingAnimation size="large" />
          </SlideInView>
          <Text style={{ marginTop: 8, color: theme.colors.outline }}>Powerful features at your fingertips</Text>
        </View>
      )
    },
    {
      key: "camera",
      title: "Camera Permission",
      subtitle: "We use the camera for analysis and try-on",
      render: () => (
        <View style={styles.center}>
          {permDone ? (
            <SuccessAnimation />
          ) : (
            <>
              <Text style={{ color: theme.colors.outline, marginBottom: 12 }}>
                Grant camera permission to continue
              </Text>
              <Button
                mode="contained"
                onPress={async () => {
                  const res = await requestPermissions();
                  if (res.camera) setPermDone(true);
                }}
              >
                Allow Camera
              </Button>
            </>
          )}
        </View>
      )
    },
    {
      key: "start",
      title: "Start your journey",
      subtitle: "Get personalized recommendations",
      render: () => (
        <View style={styles.center}>
          <Text style={{ color: theme.colors.outline, marginBottom: 12 }}>
            You're all set
          </Text>
          <Button
            mode="contained"
            onPress={async () => {
              await setOnboardingComplete(true);
              navigation.navigate("MainTabs" as never);
            }}
          >
            Get Started
          </Button>
        </View>
      )
    }
  ];

  return (
    <Animated.View style={[styles.container, appearStyle]}>
      <View style={styles.topBar}>
        <Button onPress={async () => { await setOnboardingComplete(true); navigation.navigate("MainTabs" as never); }} mode="text">Skip</Button>
      </View>
      <FlatList
        ref={listRef as any}
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text variant="titleLarge" style={styles.title}>{item.title}</Text>
            {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
            {item.render()}
          </View>
        )}
        onMomentumScrollEnd={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          setIndex(Math.round(x / width));
          setAutoPlay(false);
        }}
      />
      <View style={styles.controls}>
        <IconButton icon="chevron-left" disabled={index === 0} onPress={() => listRef.current?.scrollToIndex({ index: Math.max(index - 1, 0), animated: true })} />
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, { opacity: i === index ? 1 : 0.4 }]} />
          ))}
        </View>
        <IconButton icon="chevron-right" disabled={index === slides.length - 1} onPress={() => listRef.current?.scrollToIndex({ index: Math.min(index + 1, slides.length - 1), animated: true })} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topBar: { padding: 12, alignItems: "flex-end" },
  slide: { padding: 16, alignItems: "center", justifyContent: "center" },
  title: { marginBottom: 4 },
  subtitle: { marginBottom: 12 },
  center: { alignItems: "center", justifyContent: "center", padding: 16 },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingBottom: 16 },
  dots: { flexDirection: "row", alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#6C5CE7", marginHorizontal: 4 }
});
