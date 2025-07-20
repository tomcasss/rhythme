// src/components/Home/Stories.jsx

/**
 * Componente Stories - Sección de historias/stories de la aplicación
 */
export default function Stories() {
  return (
    <section className="stories">
      <div className="story add">+</div>
      {[...Array(16)].map((_, i) => (
        <div className="story" key={i}>STORY</div>
      ))}
    </section>
  );
}
