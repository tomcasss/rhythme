// src/components/Edit/EditProfile.jsx
import React, { useState } from 'react';
import perfil from '../../assets/perfil.png';
import spotify from '../../assets/spotify.png';
import soundcloud from '../../assets/soundcloud.png';
import apple from '../../assets/apple.png';
import youtube from '../../assets/youtube.png';

/**
 * Componente EditProfile - Muestra la información del perfil del usuario
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.user - Datos del usuario
 * @param {Function} props.onUpdateUser - Función para actualizar datos del usuario
 */
export default function EditProfile({ user, onUpdateUser }) {
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  if (!user) {
    return (
      <div className="columna-izquierda">
        <h2>Mi Cuenta</h2>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
          <p>No se pudieron cargar los datos del usuario</p>
        </div>
      </div>
    );
  }

  /**
   * Manejar actualización rápida de foto de perfil
   */
  const handleQuickPhotoUpdate = async () => {
    const newPhotoUrl = prompt("Ingresa la URL de tu nueva foto de perfil:", user.profilePicture || "");
    
    if (newPhotoUrl !== null && newPhotoUrl !== user.profilePicture) {
      setUpdating(true);
      setUpdateMessage("");
      
      try {
        const result = await onUpdateUser({ profilePicture: newPhotoUrl });
        if (result?.success) {
          setUpdateMessage("✅ Foto actualizada correctamente");
          setTimeout(() => setUpdateMessage(""), 3000);
        } else {
          setUpdateMessage("❌ Error al actualizar la foto");
        }
      } catch {
        setUpdateMessage("❌ Error al actualizar la foto");
      } finally {
        setUpdating(false);
      }
    }
  };

  /**
   * Recargar datos del usuario
   */
  const handleRefreshData = async () => {
    setUpdating(true);
    setUpdateMessage("🔄 Actualizando datos...");
    
    try {
      // Utilizar onUpdateUser para forzar una actualización de datos
      const result = await onUpdateUser({});
      if (result?.success) {
        setUpdateMessage("✅ Datos actualizados");
      } else {
        setUpdateMessage("✅ Datos refrescados");
      }
      setTimeout(() => setUpdateMessage(""), 2000);
    } catch {
      setUpdateMessage("❌ Error al actualizar datos");
      setTimeout(() => setUpdateMessage(""), 3000);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="columna-izquierda">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Mi Cuenta</h2>
        <button 
          onClick={handleRefreshData}
          disabled={updating}
          style={{
            background: '#ff7a00',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            cursor: updating ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            opacity: updating ? 0.6 : 1
          }}
        >
          {updating ? '🔄' : '↻'} Actualizar
        </button>
      </div>

      {/* Mensaje de actualización */}
      {updateMessage && (
        <div style={{
          padding: '0.5rem 1rem',
          marginBottom: '1rem',
          borderRadius: '5px',
          backgroundColor: updateMessage.includes('✅') ? '#d4edda' : updateMessage.includes('❌') ? '#f8d7da' : '#d1ecf1',
          color: updateMessage.includes('✅') ? '#155724' : updateMessage.includes('❌') ? '#721c24' : '#0c5460',
          fontSize: '0.9rem'
        }}>
          {updateMessage}
        </div>
      )}
      
      <div className="perfil">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={user.profilePicture || perfil}
            alt="Foto de perfil"
            className="foto-perfil"
          />
          <button
            onClick={handleQuickPhotoUpdate}
            disabled={updating}
            style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              background: '#ff7a00',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: updating ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: updating ? 0.6 : 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
            title="Cambiar foto rápidamente"
          >
            📷
          </button>
        </div>
        <div className="info-usuario">
          <h3>{user.username || user.nombre || user.email}</h3>
          <p className="rol">{user.rol || "Usuario"}</p>
          <p>{user.location || "Ubicación no especificada"}</p>
          <p>{user.email}</p>
          <p>{user.phone || "(sin número)"}</p>
        </div>
      </div>

      {/* Géneros musicales */}
      {user.generos && user.generos.length > 0 && (
        <div className="generos">
          <h4>Géneros favoritos:</h4>
          {user.generos.map((genero, index) => (
            <p key={index} className="genero-tag">{genero}</p>
          ))}
        </div>
      )}

      {/* Redes sociales */}
      <div className="redes">
        <h4>Redes sociales:</h4>
        <div className="redes-iconos">
          {user.spotify ? (
            <a href={user.spotify} target="_blank" rel="noopener noreferrer">
              <img src={spotify} alt="Spotify" />
            </a>
          ) : (
            <img src={spotify} alt="Spotify" style={{ opacity: 0.3 }} />
          )}
          
          {user.soundcloud ? (
            <a href={user.soundcloud} target="_blank" rel="noopener noreferrer">
              <img src={soundcloud} alt="SoundCloud" />
            </a>
          ) : (
            <img src={soundcloud} alt="SoundCloud" style={{ opacity: 0.3 }} />
          )}
          
          {user.applemusic ? (
            <a href={user.applemusic} target="_blank" rel="noopener noreferrer">
              <img src={apple} alt="Apple Music" />
            </a>
          ) : (
            <img src={apple} alt="Apple Music" style={{ opacity: 0.3 }} />
          )}
          
          {user.youtube ? (
            <a href={user.youtube} target="_blank" rel="noopener noreferrer">
              <img src={youtube} alt="YouTube" />
            </a>
          ) : (
            <img src={youtube} alt="YouTube" style={{ opacity: 0.3 }} />
          )}
        </div>
      </div>

      {/* Estadísticas del usuario */}
      <div className="estadisticas-usuario" style={{ marginTop: '1rem' }}>
        <h4>Estadísticas:</h4>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#6c757d' }}>
          <span>👥 {user.followers?.length || 0} seguidores</span>
          <span>🎵 {user.following?.length || 0} siguiendo</span>
        </div>
      </div>
    </div>
  );
}
