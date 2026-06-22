import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { flushSync } from "react-dom";

export type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  isLight: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  isLight: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("geoDraftsTheme");
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
    return "system";
  });

  const getIsSystemDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [isLight, setIsLight] = useState<boolean>(() => {
    if (theme === "system") {
      return !getIsSystemDark();
    }
    return theme === "light";
  });

  const applyTheme = useCallback((newTheme: Theme, useTransition: boolean) => {
    const resolveIsLight = (t: Theme) => {
      if (t === "system") {
        return !window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return t === "light";
    };

    const targetIsLight = resolveIsLight(newTheme);

    const updateDOM = () => {
      flushSync(() => {
        setIsLight(targetIsLight);
        setThemeState(newTheme);
        if (targetIsLight) {
          document.documentElement.classList.add("light");
        } else {
          document.documentElement.classList.remove("light");
        }
      });
      localStorage.setItem("geoDraftsTheme", newTheme);
    };

    if (useTransition && document.startViewTransition) {
      document.documentElement.classList.add("transition-theme-switch");
      const transition = document.startViewTransition(updateDOM);
      transition.finished.finally(() => {
        document.documentElement.classList.remove("transition-theme-switch");
      });
    } else {
      updateDOM();
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    applyTheme(newTheme, true);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const nextTheme = isLight ? "dark" : "light";
    applyTheme(nextTheme, true);
  }, [isLight, applyTheme]);

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      applyTheme("system", false);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme, applyTheme]);

  useEffect(() => {
    const targetIsLight = theme === "system" ? !getIsSystemDark() : theme === "light";
    setIsLight(targetIsLight);
    if (targetIsLight) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isLight, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

