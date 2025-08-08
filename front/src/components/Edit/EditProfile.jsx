// src/components/Edit/EditProfile.jsx
import React, { useState } from 'react';
import perfil from '../../assets/perfil.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUsers, faMusic } from '@fortawesome/free-solid-svg-icons';
import './EditProfile.css';

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
      setUpdateMessage("📤 Subiendo nueva foto...");
      
      try {
        const result = await onUpdateUser({ 
          profilePicture: newPhotoUrl,
          userId: user._id 
        });
        if (result?.success || result?.user) {
          setUpdateMessage("✅ Foto actualizada correctamente");
          setTimeout(() => setUpdateMessage(""), 3000);
        } else {
          setUpdateMessage("❌ Error al actualizar la foto");
          setTimeout(() => setUpdateMessage(""), 3000);
        }
      } catch {
        setUpdateMessage("❌ Error al actualizar la foto");
        setTimeout(() => setUpdateMessage(""), 3000);
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
      // Forzar actualización solicitando datos del servidor
      const result = await onUpdateUser({ 
        userId: user._id,
        refresh: true 
      });
      if (result?.success || result?.user) {
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
    <div className="edit-actions-row">
        <h2>Mi Cuenta</h2>
        <button 
          onClick={handleRefreshData}
          disabled={updating}
      className="btn-primary"
        >
          {updating ? '🔄' : '↻'} Actualizar
        </button>
      </div>

      {/* Mensaje de actualización */}
      {updateMessage && (
        <div className={`update-msg ${updateMessage.includes('✅') ? 'update-ok' : updateMessage.includes('❌') ? 'update-err' : 'update-warn'}`}>
          {updateMessage}
        </div>
      )}
      
      <div className="perfil">
    <div className="photo-wrapper">
          <img
            src={user.profilePicture || perfil}
            alt="Foto de perfil"
            className="foto-perfil"
          />
          <button
            onClick={handleQuickPhotoUpdate}
            disabled={updating}
      className="quick-photo-btn"
            title="Cambiar foto rápidamente"
          >
            <FontAwesomeIcon icon={faCamera} />
          </button>
        </div>
        <div className="info-usuario">
          <h3>{user.username || user.email}</h3>
          <p className="rol">{user.isAdmin ? "Administrador" : "Usuario"}</p>
          <p>{user.from || "Ubicación no especificada"}</p>
          <p>{user.email}</p>
          {user.desc && <p className="descripcion">{user.desc}</p>}
          <p className="relacion">
            {user.relationship === 1 && "Soltero/a"}
            {user.relationship === 2 && "En una relación"}
            {user.relationship === 3 && "Casado/a"}
          </p>
        </div>
      </div>

      {/* Foto de portada si existe */}
      {user.coverPicture && (
        <div className="portada cover-wrapper">
          <h4>Foto de portada:</h4>
          <img 
            src={user.coverPicture} 
            alt="Portada" 
            className="cover-image"
          />
        </div>
      )}

      {/* Estadísticas del usuario */}
      <div className="estadisticas-usuario user-stats">
        <h4>Estadísticas:</h4>
        <div className="user-stats-row">
          <span><FontAwesomeIcon icon={faUsers} /> {user.followers?.length || 0} seguidores</span>
          <span><FontAwesomeIcon icon={faMusic} /> {user.following?.length || 0} siguiendo</span>
        </div>
      </div>

     
    </div>
  );
}
