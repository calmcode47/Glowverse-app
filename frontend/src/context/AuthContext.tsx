import React from "react";
import * as SecureStore from "expo-secure-store";
import * as AuthAPI from "../services/api/auth.api";
import { client, registerAuthTokenProvider } from "../services/api/client";
import { analytics } from "../services/analytics.service";

type User = { id: string; email: string; name?: string; profile?: Record<string, unknown> };
type RegisterData = { email: string; password: string; name?: string };

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, opts?: { remember?: boolean }) => Promise<void>;
  register: (userData: RegisterData, opts?: { remember?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
};

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => { },
  register: async () => { },
  logout: async () => { },
  refreshAuth: async () => { },
  updateUser: () => { }
});

async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync("pcAuthToken", accessToken);
  await SecureStore.setItemAsync("pcRefreshToken", refreshToken);
}

async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync("pcAuthToken");
  await SecureStore.deleteItemAsync("pcRefreshToken");
}

async function getAccessToken(): Promise<string | null> {
  const v = await SecureStore.getItemAsync("pcAuthToken");
  return v ?? null;
}

async function getRefreshToken(): Promise<string | null> {
  const v = await SecureStore.getItemAsync("pcRefreshToken");
  return v ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    registerAuthTokenProvider({
      getAccessToken,
      getRefreshToken,
      setTokens: async (at, rt) => {
        await setTokens(at, rt);
        setAccessToken(at);
      },
      clearTokens: async () => {
        await clearTokens();
        setAccessToken(null);
      }
    });
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const rt = await getRefreshToken();
        if (rt) {
          await refresh();
          const me = await AuthAPI.getProfile();
          setUser(me.user);
        }
      } catch { }
      setIsLoading(false);
    })();
  }, []);

  async function refresh(): Promise<void> {
    const rt = await getRefreshToken();
    if (!rt) throw new Error("No refresh token");
    const res = await client.post<{ accessToken: string; refreshToken: string }>("/api/v1/auth/refresh", { refreshToken: rt });
    await setTokens(res.data.accessToken, res.data.refreshToken);
    setAccessToken(res.data.accessToken);
  }

  const login = async (email: string, password: string): Promise<void> => {
    const res = await AuthAPI.login({ email, password });
    await setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    setAccessToken(res.tokens.accessToken);
    setUser(res.user);
    try {
      await analytics.setUserId(res.user.id);
      await analytics.setUserProperties({
        email: res.user.email,
        name: res.user.name || ""
      });
    } catch { }
  };

  const register = async (data: RegisterData): Promise<void> => {
    const res = await AuthAPI.register(data);
    await setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    setAccessToken(res.tokens.accessToken);
    setUser(res.user);
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthAPI.logout();
    } catch { }
    await clearTokens();
    setAccessToken(null);
    setUser(null);
  };

  const refreshAuth = async (): Promise<void> => {
    await refresh();
    const me = await AuthAPI.getProfile();
    setUser(me.user);
  };

  const updateUser = (u: Partial<User>): void => {
    setUser((prev) => ({ ...(prev || {}), ...(u as User) }));
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!accessToken,
    isLoading,
    login,
    register,
    logout,
    refreshAuth,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useGlowAuth() {
  return React.useContext(AuthContext);
}

export { useGlowAuth as useAuth };
