// src/components/Profile/MusicPreferencesChips.jsx

/**
 * Lista de chips con los géneros musicales del usuario.
 * Acepta un arreglo de strings y los muestra como chips.
 */
export default function MusicPreferencesChips({ musicPreferences }) {
  const prefs = Array.isArray(musicPreferences)
    ? musicPreferences.filter((g) => typeof g === 'string' && g.trim() !== '')
    : [];

  if (prefs.length === 0) return null;

  return (
    <div className="genre-chips" aria-label="Géneros musicales">
      {prefs.map((g, idx) => (
        <span key={`${g}-${idx}`} className="genre-chip">
          {g}
        </span>
      ))}
    </div>
  );
}
