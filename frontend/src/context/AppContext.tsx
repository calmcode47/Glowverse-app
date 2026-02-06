import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserPreferences = {
  theme: "light" | "dark";
  language: "en" | "es" | "fr";
  notifications: boolean;
};

export type UserData = {
  name?: string;
  avatarUri?: string;
  bio?: string;
  preferences: UserPreferences;
  history: { recentImages: string[] };
};

export type AppSettings = {
  theme: "light" | "dark";
  language: "en" | "es" | "fr";
  notifications: boolean;
};

export type AppContextState = {
  user: UserData;
  settings: AppSettings;
  onboardingComplete: boolean;
  setUser: (u: Partial<UserData>) => void;
  updatePreferences: (p: Partial<UserPreferences>) => void;
  setOnboardingComplete: (v: boolean) => Promise<void>;
  addRecentImage: (uri: string) => void;
};

const defaultPreferences: UserPreferences = {
  theme: "light",
  language: "en",
  notifications: true
};

const initialState: AppContextState = {
  user: { name: undefined, avatarUri: undefined, bio: undefined, preferences: defaultPreferences, history: { recentImages: [] } },
  settings: { theme: "light", language: "en", notifications: true },
  onboardingComplete: false,
  setUser: () => {},
  updatePreferences: () => {},
  setOnboardingComplete: async () => {},
  addRecentImage: () => {}
};

const AppContext = React.createContext<AppContextState>(initialState);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AppContextState>(initialState);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const onboarding = await AsyncStorage.getItem("onboardingComplete");
      const prefs = await AsyncStorage.getItem("userPreferences");
      const parsedPrefs = prefs ? (JSON.parse(prefs) as UserPreferences) : defaultPreferences;
      setState((s) => ({
        ...s,
        onboardingComplete: onboarding === "true",
        user: { ...s.user, preferences: parsedPrefs },
        settings: { ...s.settings, ...parsedPrefs }
      }));
      setHydrated(true);
    })();
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem("userPreferences", JSON.stringify(state.user.preferences));
  }, [hydrated, state.user.preferences]);

  const setUser = (u: Partial<UserData>) => {
    setState((s) => ({ ...s, user: { ...s.user, ...u } }));
  };

  const updatePreferences = (p: Partial<UserPreferences>) => {
    setState((s) => ({
      ...s,
      user: { ...s.user, preferences: { ...s.user.preferences, ...p } },
      settings: { ...s.settings, ...p }
    }));
  };

  const setOnboardingComplete = async (v: boolean) => {
    await AsyncStorage.setItem("onboardingComplete", v ? "true" : "false");
    setState((s) => ({ ...s, onboardingComplete: v }));
  };

  const addRecentImage = (uri: string) => {
    setState((s) => ({
      ...s,
      user: {
        ...s.user,
        history: {
          recentImages: [uri, ...s.user.history.recentImages].slice(0, 20)
        }
      }
    }));
  };

  const value: AppContextState = {
    ...state,
    setUser,
    updatePreferences,
    setOnboardingComplete,
    addRecentImage
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return React.useContext(AppContext);
}
