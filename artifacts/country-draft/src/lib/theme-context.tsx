import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { flushSync } from "react-dom";

type ThemeContextType = {
  isLight: boolean;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  isLight: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isLight, setIsLight] = useState<boolean>(() => {
    return localStorage.getItem("geoDraftsTheme") === "light";
  });

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("geoDraftsTheme", isLight ? "light" : "dark");
  }, [isLight]);

  const toggleTheme = useCallback(() => {
    if (!document.startViewTransition) {
      setIsLight((prev) => !prev);
      return;
    }
    
    document.documentElement.classList.add("transition-theme-switch");
    
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setIsLight((prev) => !prev);
      });
    });
    
    transition.finished.finally(() => {
      document.documentElement.classList.remove("transition-theme-switch");
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isLight, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
