import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

type BiometricService = {
  isAvailable(): Promise<boolean>;
  authenticate(): Promise<boolean>;
  saveBiometricPreference(enabled: boolean): Promise<void>;
  getBiometricPreference(): Promise<boolean>;
};

const PREF_KEY = "biometricEnabled";

async function isAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();
  return hasHardware && supported.length > 0;
}

async function authenticate(): Promise<boolean> {
  const ok = await isAvailable();
  if (!ok) return false;
  const res = await LocalAuthentication.authenticateAsync({
    promptMessage: "Authenticate",
    fallbackLabel: "Use Passcode"
  });
  return res.success;
}

async function saveBiometricPreference(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(PREF_KEY, enabled ? "true" : "false");
}

async function getBiometricPreference(): Promise<boolean> {
  const v = await SecureStore.getItemAsync(PREF_KEY);
  return v === "true";
}

const Biometrics: BiometricService = {
  isAvailable,
  authenticate,
  saveBiometricPreference,
  getBiometricPreference
};

export default Biometrics;
