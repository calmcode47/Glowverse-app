import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PCAIInferenceResponse, PCError } from "../../types/perfectcorp";

export type ApiHistoryItem = {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  timestamp: string;
  status: "success" | "error";
};

export type AIContextState = {
  results: PCAIInferenceResponse[];
  loading: boolean;
  error: string | null;
  history: ApiHistoryItem[];
  addResult: (r: PCAIInferenceResponse) => void;
  setLoading: (l: boolean) => void;
  setError: (e: string | null) => void;
  addHistory: (h: ApiHistoryItem) => void;
  clearResults: () => void;
};

const initialState: AIContextState = {
  results: [],
  loading: false,
  error: null,
  history: [],
  addResult: () => {},
  setLoading: () => {},
  setError: () => {},
  addHistory: () => {},
  clearResults: () => {}
};

const AIContext = React.createContext<AIContextState>(initialState);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AIContextState>(initialState);

  React.useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("aiHistory");
      if (stored) {
        setState((s) => ({ ...s, history: JSON.parse(stored) as ApiHistoryItem[] }));
      }
    })();
  }, []);

  React.useEffect(() => {
    AsyncStorage.setItem("aiHistory", JSON.stringify(state.history));
  }, [state.history]);

  const addResult = (r: PCAIInferenceResponse) => {
    setState((s) => ({ ...s, results: [r, ...s.results].slice(0, 50) }));
  };
  const setLoading = (l: boolean) => {
    setState((s) => ({ ...s, loading: l }));
  };
  const setError = (e: string | null) => {
    setState((s) => ({ ...s, error: e }));
  };
  const addHistory = (h: ApiHistoryItem) => {
    setState((s) => ({ ...s, history: [h, ...s.history].slice(0, 200) }));
  };
  const clearResults = () => {
    setState((s) => ({ ...s, results: [] }));
  };

  const value: AIContextState = {
    ...state,
    addResult,
    setLoading,
    setError,
    addHistory,
    clearResults
  };
  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAI() {
  return React.useContext(AIContext);
}
