import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTheme, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const indicatorX = useSharedValue(0);

  React.useEffect(() => {
    indicatorX.value = withTiming(state.index, { duration: 250 });
  }, [state.index]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorX.value * 100 }]
    };
  });

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={[styles.bar, { backgroundColor: theme.colors.surface }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key
            });
          };

          const icon = options.tabBarIcon
            ? options.tabBarIcon({
                color: isFocused ? theme.colors.primary : theme.colors.outline,
                size: 24,
                focused: isFocused
              })
            : null;

          const isCamera = route.name === "CameraTab";

          return (
            <View key={route.key} style={styles.itemWrapper}>
              {isCamera ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Camera"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={[
                    styles.cameraButton,
                    {
                      backgroundColor: theme.colors.primary
                    }
                  ]}
                >
                  <MaterialCommunityIcons name="camera" color={theme.colors.onPrimary} size={28} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={options.title || route.name}
                  accessibilityState={isFocused ? { selected: true } : {}}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.item}
                >
                  {icon}
                  <Text
                    style={{
                      marginTop: 4,
                      color: isFocused ? theme.colors.primary : theme.colors.outline
                    }}
                  >
                    {options.title || route.name}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
        <Animated.View style={[styles.indicator, indicatorStyle]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 24,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  itemWrapper: {
    flex: 1,
    alignItems: "center"
  },
  item: {
    alignItems: "center",
    justifyContent: "center"
  },
  cameraButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -32
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 80,
    height: 2,
    borderRadius: 1,
    backgroundColor: "transparent"
  }
});
