/**
 * context/ThemeContext.tsx
 * 
 * High-Speed Retail Theme Provider & Context.
 * Enables instant 1-tap switching between Dark Mode and Light Mode,
 * dynamically distributing retail colors across all components.
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeColors, DarkTheme, LightTheme } from '../constants/theme';

export type ThemeMode = 'dark' | 'light';

export interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  colors: LightTheme,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [theme, setTheme] = useState<ThemeMode>('light');

  const isDark = theme === 'dark';
  const colors = useMemo(() => (isDark ? DarkTheme : LightTheme), [isDark]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const value = useMemo(
    () => ({
      theme,
      isDark,
      colors,
      toggleTheme,
      setTheme,
    }),
    [theme, isDark, colors]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to consume active theme colors and toggle actions
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

