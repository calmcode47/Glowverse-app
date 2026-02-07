import React, { createContext, useContext, useState } from 'react';

type Mode = 'light' | 'dark';

const ThemeModeContext = createContext<{ mode: Mode; setMode: (m: Mode) => void }>({ mode: 'dark', setMode: () => {} });

export const ThemeModeProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>('dark');
  return <ThemeModeContext.Provider value={{ mode, setMode }}>{children}</ThemeModeContext.Provider>;
};

export const useThemeMode = () => useContext(ThemeModeContext);
