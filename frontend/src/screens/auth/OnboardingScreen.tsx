import React from "react";
import { View, FlatList, Dimensions } from "react-native";
import { Button, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "@navigation/types";
import { useTheme } from "../../theme/themeContext";
import { useApp } from "../../context/AppContext";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const { setOnboardingComplete } = useApp();
  const [index, setIndex] = React.useState(0);
  const listRef = React.useRef<FlatList>(null);
  const items = [
    { key: "one", title: "Welcome" },
    { key: "two", title: "Analyze" },
    { key: "three", title: "Try On" }
  ];
  const next = () => {
    if (index < items.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
      setIndex(index + 1);
    } else {
      complete();
    }
  };
  const skip = () => {
    complete();
  };
  const complete = async () => {
    await setOnboardingComplete(true);
    navigation.navigate("Login");
  };
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.elevated }}>
      <FlatList
        ref={listRef}
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.key}
        renderItem={({ item }) => (
          <View style={{ width, alignItems: "center", justifyContent: "center" }}>
            <Text variant="headlineMedium">{item.title}</Text>
          </View>
        )}
      />
      <View style={{ padding: 16, flexDirection: "row", justifyContent: "space-between" }}>
        <Button onPress={skip}>Skip</Button>
        <Button mode="contained" onPress={next}>Next</Button>
      </View>
    </View>
  );
}
