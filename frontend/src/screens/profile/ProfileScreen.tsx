import React from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text, Button, useTheme, List, Dialog, Portal, TextInput, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "@navigation/types";
import { useApp } from "@context/AppContext";
import { useCameraContext } from "@context/CameraContext";
import AvatarPicker from "@components/profile/AvatarPicker";
import StatsCard from "@components/profile/StatsCard";
import HistoryGrid from "@components/profile/HistoryGrid";
import SettingItem from "@components/profile/SettingItem";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const { user, setUser, updatePreferences } = useApp();
  const { capturedImages, removeImage } = useCameraContext();
  const [editOpen, setEditOpen] = React.useState(false);
  const [name, setName] = React.useState(user.name || "");
  const [bio, setBio] = React.useState(user.bio || "");

  const analysesCount = capturedImages.length;
  const productsTried = 0;
  const favoritesSaved = 0;

  const saveProfile = () => {
    setUser({ name, bio });
    setEditOpen(false);
  };

  const logout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("pcAuthToken");
          navigation.navigate("Onboarding");
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <AvatarPicker />
        <Text variant="titleLarge" style={{ marginTop: 8 }}>{user.name || "Guest"}</Text>
        {user.bio ? <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>{user.bio}</Text> : null}
        <Button style={{ marginTop: 8 }} mode="outlined" onPress={() => setEditOpen(true)}>Edit Profile</Button>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium">Stats</Text>
        <View style={styles.statsRow}>
          <StatsCard icon="chart-box" label="Analyses" value={analysesCount} />
          <StatsCard icon="lipstick" label="Products Tried" value={productsTried} />
          <StatsCard icon="heart" label="Favorites" value={favoritesSaved} />
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium">History</Text>
        <HistoryGrid
          items={capturedImages.map((i) => ({ uri: i.uri, timestamp: i.timestamp, type: "analysis" }))}
          onPress={(uri) => navigation.navigate("Results", { imageUri: uri })}
          onDelete={(uri) => removeImage(uri)}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium">Settings</Text>
        <List.Section>
          <SettingItem icon="account" label="Account settings" type="navigation" onPress={() => navigation.navigate("Settings")} />
          <SettingItem icon="bell-outline" label="Notifications" type="toggle" value={user.preferences.notifications} onPress={() => updatePreferences({ notifications: !user.preferences.notifications })} />
          <SettingItem icon="shield-lock-outline" label="Privacy" type="navigation" onPress={() => navigation.navigate("Settings")} />
          <SettingItem icon="camera-outline" label="Camera settings" type="navigation" onPress={() => navigation.navigate("Settings")} />
          <SettingItem icon="theme-light-dark" label="App theme" type="select" value={user.preferences.theme} onPress={() => updatePreferences({ theme: user.preferences.theme === "light" ? "dark" : "light" })} />
          <SettingItem icon="translate" label="Language" type="select" value={user.preferences.language} onPress={() => updatePreferences({ language: user.preferences.language === "en" ? "es" : "en" })} />
          <SettingItem icon="lifebuoy" label="Help & Support" type="navigation" onPress={() => navigation.navigate("Tutorial")} />
          <SettingItem icon="information-outline" label="About app" type="navigation" onPress={() => navigation.navigate("Settings")} />
          <Divider />
          <SettingItem icon="logout" label="Logout" type="navigation" onPress={logout} />
        </List.Section>
      </View>

      <Portal>
        <Dialog visible={editOpen} onDismiss={() => setEditOpen(false)}>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Name" value={name} onChangeText={setName} />
            <TextInput label="Bio" value={bio} onChangeText={setBio} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditOpen(false)}>Cancel</Button>
            <Button onPress={saveProfile}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { alignItems: "center", padding: 16 },
  section: { padding: 16 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 }
});
