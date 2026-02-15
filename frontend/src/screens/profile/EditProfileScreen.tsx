import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import { useTheme } from "../../theme/themeContext";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Cloudinary from "../../services/cloudinary.service";
import * as UserAPI from "../../services/api/user.api";
import { useAuth } from "../../context/AuthContext";

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [name, setName] = React.useState(user?.name || "");
  const [email] = React.useState(user?.email || "");
  const [phone, setPhone] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [avatar, setAvatar] = React.useState<string | undefined>((user as any)?.avatar);
  const [saving, setSaving] = React.useState(false);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permission required", "Please grant media library access.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (res.canceled || !res.assets?.length) return;
    const img = res.assets[0];
    const crop = await ImageManipulator.manipulateAsync(img.uri, [{ resize: { width: 512, height: 512 } }], { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG });
    setAvatar(crop.uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permission required", "Please grant camera access.");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (res.canceled || !res.assets?.length) return;
    const img = res.assets[0];
    const crop = await ImageManipulator.manipulateAsync(img.uri, [{ resize: { width: 512, height: 512 } }], { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG });
    setAvatar(crop.uri);
  };

  const save = async () => {
    try {
      setSaving(true);
      let avatarUrl: string | undefined = undefined;
      if (avatar && !avatar.startsWith("http")) {
        const uploaded = await Cloudinary.uploadImage({ uri: avatar, type: "image/jpeg", name: "avatar.jpg" });
        avatarUrl = uploaded.url;
      }
      if (user?.id) {
        await UserAPI.updateUser(user.id, { name, phoneNumber: phone, dateOfBirth: dob, gender, ...(avatarUrl ? { avatar: avatarUrl } : {}) });
      } else {
        await UserAPI.updateProfile({ name, phoneNumber: phone, dateOfBirth: dob, gender });
        if (avatarUrl) await UserAPI.uploadAvatar({ uri: avatarUrl, type: "image/jpeg", name: "avatar.jpg" });
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickPhoto} style={styles.avatarWrap} accessibilityRole="button" accessibilityLabel="Choose profile photo" accessibilityHint="Opens gallery to select a photo">
        {avatar ? <Image source={{ uri: avatar }} style={styles.avatar} /> : <View style={[styles.avatar, { backgroundColor: theme.colors.background.secondary }]} />}
        <Text style={styles.link}>Choose Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={takePhoto} accessibilityRole="button" accessibilityLabel="Take profile photo"><Text style={styles.link}>Take Photo</Text></TouchableOpacity>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} accessibilityLabel="Name" />
      <TextInput style={[styles.input, { opacity: 0.8 }]} editable={false} placeholder="Email" value={email} accessibilityLabel="Email (read only)" />
      <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} accessibilityLabel="Phone number" keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Birthday (YYYY-MM-DD)" value={dob} onChangeText={setDob} accessibilityLabel="Birthday" />
      <TextInput style={styles.input} placeholder="Gender" value={gender} onChangeText={setGender} accessibilityLabel="Gender" />
      <Button mode="contained" onPress={save} loading={saving} disabled={saving} accessibilityLabel="Save profile changes" accessibilityRole="button">Save Changes</Button>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary, padding: 16, gap: 10 },
    avatarWrap: { alignItems: "center", gap: 6 },
    avatar: { width: 96, height: 96, borderRadius: 48 },
    link: { color: theme.colors.accent.emerald, fontWeight: "800" },
    input: { borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: theme.colors.text.primary }
  });
}
