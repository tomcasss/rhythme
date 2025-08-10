import { useTheme } from '../hooks/useTheme';
import { useEffect } from 'react';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme, theme } = useTheme();

  // Avoid hydration mismatch (if SSR later) - here just side effect marker
  useEffect(() => {}, [theme]);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={{
        background: 'var(--gradient-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '0.5rem 0.9rem',
        cursor: 'pointer',
        fontSize: '.85rem',
        fontWeight: 600,
        boxShadow: 'var(--shadow-soft)'
      }}
    >
      {isDark ? '☀️ Claro' : '🌙 Oscuro'}
    </button>
  );
}
