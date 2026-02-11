import * as React from "react";
import { View } from "react-native";
import { TextInput, Button, HelperText, Text, ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "@navigation/types";
import { useTheme } from "../../theme/themeContext";
import { AuthAPI } from "@services/api";

export default function LoginPaper() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const emailError = !!email && !/.+@.+\..+/.test(email);
  const passwordError = !!password && password.length < 6;
  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!email || !password) {
        setError("Please enter both email and password");
        return;
      }
      await AuthAPI.login({ email: email.trim(), password });
      navigation.navigate("MainTabs", { screen: "HomeTab" } as any);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err?.response?.status === 429) {
        setError("Too many login attempts. Please try again later.");
      } else {
        setError(err?.response?.data?.message || err?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.colors.background.elevated }}>
      <Text variant="titleLarge">Login</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ marginTop: 16 }}
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
      <Button mode="contained" onPress={handleLogin} loading={loading} disabled={loading} style={{ marginTop: 16 }}>
        Login
      </Button>
      <Button onPress={() => navigation.navigate("SignUp")} style={{ marginTop: 8 }}>
        Create account
      </Button>
    </View>
  );
}
