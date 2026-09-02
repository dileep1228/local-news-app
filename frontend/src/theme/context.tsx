import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_THEME, THEMES, type Theme } from '@/theme/themes';

/**
 * The chosen theme, kept in a one-line file in the app's document directory.
 *
 * expo-file-system rather than AsyncStorage: it already ships with expo and is
 * already compiled into the dev client, where AsyncStorage would be a new
 * native module and so a new build. Required lazily and wrapped, so a missing
 * native module costs the remembered theme and not the launch.
 */
function themeFile() {
  const { File, Paths } = require('expo-file-system') as typeof import('expo-file-system');
  return new File(Paths.document, 'theme.txt');
}

function readStoredTheme(): string | null {
  try {
    const file = themeFile();
    return file.exists ? file.textSync().trim() || null : null;
  } catch {
    return null;
  }
}

function writeStoredTheme(id: string) {
  try {
    const file = themeFile();
    file.create({ overwrite: true });
    file.write(id);
  } catch {
    // Losing the preference is not worth interrupting a theme change over.
  }
}

type ThemeContextValue = {
  theme: Theme;
  setThemeId: (id: string) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setThemeId: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  /*
    Read synchronously in a lazy initialiser, so the first paint is already the
    remembered theme - loading it in an effect would show the default for a
    frame and then swap. The function form matters: passing readStoredTheme()
    directly would touch the filesystem on every render and use only the first
    result.
  */
  const [themeId, setThemeId] = useState(() => readStoredTheme() ?? DEFAULT_THEME.id);

  const chooseTheme = useCallback((id: string) => {
    setThemeId(id);
    writeStoredTheme(id);
  }, []);

  const value = useMemo(
    () => ({
      // An id from an older build may no longer exist; the fallback covers it.
      theme: THEMES.find((t) => t.id === themeId) ?? DEFAULT_THEME,
      setThemeId: chooseTheme,
    }),
    [themeId, chooseTheme],
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
