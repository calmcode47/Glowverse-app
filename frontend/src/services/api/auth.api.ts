import { client } from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Tokens = { accessToken: string; refreshToken: string };
type User = { id: string; email: string; name?: string; profile?: Record<string, unknown> };

export async function register(data: { email: string; password: string; name?: string }): Promise<{ user: User; tokens: Tokens }> {
  const res = await client.post<{ user: User; tokens: Tokens }>("/api/v1/auth/register", data);
  await AsyncStorage.setItem("pcAuthToken", res.data.tokens.accessToken);
  await AsyncStorage.setItem("pcRefreshToken", res.data.tokens.refreshToken);
  return res.data;
}

export async function login(data: { email: string; password: string }): Promise<{ user: User; tokens: Tokens }> {
  const res = await client.post<{ user: User; tokens: Tokens }>("/api/v1/auth/login", data);
  await AsyncStorage.setItem("pcAuthToken", res.data.tokens.accessToken);
  await AsyncStorage.setItem("pcRefreshToken", res.data.tokens.refreshToken);
  return res.data;
}

export async function refresh(refreshToken?: string): Promise<Tokens> {
  const rt = refreshToken || (await AsyncStorage.getItem("pcRefreshToken")) || "";
  const res = await client.post<Tokens>("/api/v1/auth/refresh", { refreshToken: rt });
  await AsyncStorage.setItem("pcAuthToken", res.data.accessToken);
  await AsyncStorage.setItem("pcRefreshToken", res.data.refreshToken);
  return res.data;
}

export async function logout(refreshToken?: string): Promise<void> {
  const rt = refreshToken || (await AsyncStorage.getItem("pcRefreshToken")) || "";
  await client.post("/api/v1/auth/logout", { refreshToken: rt });
  await AsyncStorage.removeItem("pcAuthToken");
  await AsyncStorage.removeItem("pcRefreshToken");
}

export async function logoutAll(): Promise<void> {
  await client.post("/api/v1/auth/logout-all");
  await AsyncStorage.removeItem("pcAuthToken");
  await AsyncStorage.removeItem("pcRefreshToken");
}

export async function getProfile(): Promise<{ user: User }> {
  const res = await client.get<{ user: User }>("/api/v1/auth/me");
  return res.data;
}

export async function changePassword(data: { oldPassword: string; newPassword: string }): Promise<{ message: string }> {
  const res = await client.post<{ message: string }>("/api/v1/auth/change-password", data);
  return res.data;
}

export async function deleteAccount(data: { password: string }): Promise<{ message: string }> {
  const res = await client.delete<{ message: string }>("/api/v1/auth/account", { data });
  return res.data;
}
