/**
 * context/ThemeContext.tsx
 * 
 * High-Speed Retail Theme Provider & Context.
 * Enables instant 1-tap switching between Dark Mode and Light Mode,
 * dynamically distributing retail colors across all components.
 */

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { Appearance } from 'react-native';
import { ThemeColors, DarkTheme, LightTheme } from '../constants/theme';
import { storageService } from '../services/storageService';

export type ThemeMode = 'dark' | 'light';

export interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const getInitialTheme = (): ThemeMode => {
  const systemScheme = Appearance.getColorScheme();
  return systemScheme === 'dark' ? 'dark' : 'light';
};

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
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  // Load persisted theme preference on app start or track system theme
  useEffect(() => {
    let isMounted = true;
    storageService.loadTheme().then((saved) => {
      if (!isMounted) return;
      if (saved) {
        setThemeState(saved);
      } else {
        const currentSystem = Appearance.getColorScheme();
        if (currentSystem) {
          setThemeState(currentSystem === 'dark' ? 'dark' : 'light');
        }
      }
    });

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      storageService.loadTheme().then((saved) => {
        if (!saved && colorScheme) {
          setThemeState(colorScheme === 'dark' ? 'dark' : 'light');
        }
      });
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    storageService.saveTheme(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      storageService.saveTheme(next);
      return next;
    });
  }, []);

  const isDark = theme === 'dark';
  const colors = useMemo(() => (isDark ? DarkTheme : LightTheme), [isDark]);

  const value = useMemo(
    () => ({
      theme,
      isDark,
      colors,
      toggleTheme,
      setTheme,
    }),
    [theme, isDark, colors, toggleTheme, setTheme]
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

