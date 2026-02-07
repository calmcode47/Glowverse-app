import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@constants/theme";
import type { RootStackParamList } from "@navigation/types";
import { useApp } from "@context/AppContext";
import { StatCircle } from "@components/ui";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user, setUser } = useApp();

  const logout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("pcAuthToken");
          navigation.navigate("Onboarding");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>
            {(user.name || "G")[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user.name || "Guest"}</Text>
        {user.bio ? (
          <Text style={styles.bio}>{user.bio}</Text>
        ) : null}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate("Settings")}
        >
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <StatCircle value={12} size={56} />
        <StatCircle value={28} size={56} />
        <StatCircle value={7} size={56} />
      </View>
      <View style={styles.statsLabels}>
        <Text style={styles.statsLabel}>Orders</Text>
        <Text style={styles.statsLabel}>Favorites</Text>
        <Text style={styles.statsLabel}>Reviews</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Settings")}
        >
          <MaterialCommunityIcons name="cog-outline" size={22} color={theme.colors.text.primary} />
          <Text style={styles.menuText}>Settings</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.text.muted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Tutorial")}
        >
          <MaterialCommunityIcons name="help-circle-outline" size={22} color={theme.colors.text.primary} />
          <Text style={styles.menuText}>Help & Support</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.text.muted} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={logout}>
          <MaterialCommunityIcons name="logout" size={22} color={theme.colors.error} />
          <Text style={[styles.menuText, { color: theme.colors.error }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingTop: Platform.OS === "ios" ? 56 : 48,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.text.inverse,
  },
  name: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: "700",
    color: theme.colors.text.primary,
    marginTop: 12,
  },
  bio: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.secondary,
    marginTop: 4,
    textAlign: "center",
  },
  editBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: theme.colors.borderOrange,
    borderRadius: theme.radius.round,
  },
  editBtnText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: "600",
    color: theme.colors.orange,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingVertical: 16,
  },
  statsLabels: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingHorizontal: 40,
  },
  statsLabel: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  menu: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuText: {
    flex: 1,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: "500",
    color: theme.colors.text.primary,
    marginLeft: 12,
  },
  bottomPad: {
    height: 24,
  },
});
