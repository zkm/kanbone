export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "kanbone:theme";
const THEMES: Theme[] = ["system", "light", "dark"];

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

export function getTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isTheme(stored) ? stored : "system";
}

/** Applies `theme` to the document root and persists it; "system" clears the override. */
export function setTheme(theme: Theme): void {
  if (theme === "system") {
    localStorage.removeItem(STORAGE_KEY);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.dataset.theme = theme;
  }
}

export function cycleTheme(): Theme {
  const next = THEMES[(THEMES.indexOf(getTheme()) + 1) % THEMES.length];
  setTheme(next);
  return next;
}
