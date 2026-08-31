import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_THEME, THEMES, type Theme } from '@/theme/themes';

type ThemeContextValue = {
  theme: Theme;
  setThemeId: (id: string) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setThemeId: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(DEFAULT_THEME.id);

  const value = useMemo(
    () => ({
      theme: THEMES.find((t) => t.id === themeId) ?? DEFAULT_THEME,
      setThemeId,
    }),
    [themeId],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** The active theme. Components build their styles from this. */
export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}

export function useThemeControls(): ThemeContextValue {
  return useContext(ThemeContext);
}
