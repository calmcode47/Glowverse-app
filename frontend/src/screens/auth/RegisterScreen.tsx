import React from "react";
import { View } from "react-native";
import { TextInput, Button, HelperText, Text, ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "@navigation/types";
import { useTheme } from "../../theme/themeContext";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const { register } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [acceptTos, setAcceptTos] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const emailError = !!email && !/.+@.+\..+/.test(email);
  const passwordError = !!password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  const confirmError = !!confirmPassword && confirmPassword !== password;
  const submit = async () => {
    setError(null);
    if (!name || name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (!email || emailError) {
      setError("Enter a valid email");
      return;
    }
    if (!password || passwordError) {
      setError("Password must be 8+ chars with upper, lower and number");
      return;
    }
    if (confirmError) {
      setError("Passwords do not match");
      return;
    }
    if (!acceptTos) {
      setError("Please accept the Terms of Service");
      return;
    }
    try {
      setLoading(true);
      await register({ email, password, name });
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
      <HelperText type="error" visible={passwordError}>8+ chars, upper, lower, number</HelperText>
      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={{ marginTop: 8 }}
      />
      <HelperText type="error" visible={confirmError}>Passwords do not match</HelperText>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
        <Button mode={acceptTos ? "contained-tonal" : "outlined"} onPress={() => setAcceptTos(!acceptTos)}>
          {acceptTos ? "Accepted" : "Accept Terms"}
        </Button>
        <Text style={{ marginLeft: 8 }}>Agree to Terms of Service</Text>
      </View>
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
