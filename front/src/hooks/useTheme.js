import { useEffect, useState, useCallback } from 'react';

// Key for localStorage
const STORAGE_KEY = 'rhythme.theme';

// Resolve initial theme: explicit storage -> system preference -> light
function resolveInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore storage read errors
  }
  if (typeof window !== 'undefined') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  return 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState(resolveInitialTheme);

  // Apply theme to <html> dataset
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
  try { localStorage.setItem(STORAGE_KEY, theme); } catch {
      // ignore storage write errors
    }
  }, [theme]);

  // Listen for system preference changes if user hasn't explicitly chosen
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const isDark = theme === 'dark';

  return { theme, isDark, setTheme, toggleTheme };
}
