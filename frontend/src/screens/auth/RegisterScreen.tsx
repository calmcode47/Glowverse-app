import React from "react";
import { View } from "react-native";
import { TextInput, Button, HelperText, Text, ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "@navigation/types";
import { useTheme } from "../../theme/themeContext";
import * as AuthAPI from "../../services/api/auth.api";

export default function RegisterScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const emailError = !!email && !/.+@.+\..+/.test(email);
  const passwordError = !!password && password.length < 6;
  const submit = async () => {
    setError(null);
    if (!email || emailError || !password || passwordError) {
      setError("Check your inputs");
      return;
    }
    try {
      setLoading(true);
      await AuthAPI.register({ email, password, name });
      navigation.navigate("MainTabs", { screen: "HomeTab" } as any);
    } catch (e: any) {
      setError(e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.colors.background.elevated }}>
      <Text variant="titleLarge">Create Account</Text>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={{ marginTop: 16 }}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ marginTop: 8 }}
      />
      <HelperText type="error" visible={emailError}>Invalid email</HelperText>
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginTop: 8 }}
      />
      <HelperText type="error" visible={passwordError}>Minimum 6 characters</HelperText>
      {error ? (
        <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ActivityIndicator />
          <Text>{error}</Text>
        </View>
      ) : null}
      <Button mode="contained" onPress={submit} loading={loading} disabled={loading} style={{ marginTop: 16 }}>
        Sign Up
      </Button>
      <Button onPress={() => navigation.navigate("Login")} style={{ marginTop: 8 }}>
        Back to Login
      </Button>
    </View>
  );
}
