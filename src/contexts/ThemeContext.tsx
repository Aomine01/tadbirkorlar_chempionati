import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
      root.setAttribute("data-theme", "dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const applyTransitionThenToggle = (newTheme: Theme) => {
    const root = document.documentElement;
    // Add transitioning class to activate global CSS transition
    root.classList.add("theme-transitioning");
    setThemeState(newTheme);
    // Remove transitioning class after animation completes (550ms)
    const timer = window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 550);
    return timer;
  };

  const toggleTheme = () => {
    applyTransitionThenToggle(theme === "dark" ? "light" : "dark");
  };

  const setTheme = (newTheme: Theme) => {
    applyTransitionThenToggle(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
};
