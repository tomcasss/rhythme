// src/components/Profile/ProfileContent.jsx
import perfil from '../../assets/perfil.png';

/**
 * Componente ProfileContent - Contenido principal del perfil
 */
export default function ProfileContent() {
  
  /**
   * Manejar click en tarjeta
   */
  const handleCardClick = (type) => {
    console.log(`Clicked on ${type}`);
    // Aquí se puede implementar navegación a diferentes secciones
  };

  return (
    <div className="contenido-musico">
      <div className="galeria-musico">
        <button 
          className="tarjeta tarjeta-btn"
          onClick={() => handleCardClick('albums')}
        >
          <h4>Albums</h4>
          <img src={perfil} alt="Album" />
        </button>

        <button 
          className="tarjeta tarjeta-btn"
          onClick={() => handleCardClick('playlists')}
        >
          <h4>Playlists</h4>
          <img src={perfil} alt="Playlist" />
        </button>

        <button 
          className="tarjeta tarjeta-btn"
          onClick={() => handleCardClick('photos')}
        >
          <h4>Fotos</h4>
          <img src={perfil} alt="Fotos" />
        </button>

        <button 
          className="tarjeta tarjeta-btn"
          onClick={() => handleCardClick('posts')}
        >
          <h4>Posts</h4>
          <img src={perfil} alt="Posts" />
        </button>
      </div>
    </div>
  );
}
