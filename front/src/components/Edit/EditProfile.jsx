// src/components/Edit/EditProfile.jsx
import React, { useState } from 'react';
import perfil from '../../assets/perfil.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUsers, faMusic } from '@fortawesome/free-solid-svg-icons';

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
        <div className="portada" style={{ marginTop: '1rem', width: '30%' }}>
          <h4>Foto de portada:</h4>
          <img 
            src={user.coverPicture} 
            alt="Portada" 
            style={{ 
              width: '100%', 
              height: '150px', 
              objectFit: 'cover', 
              borderRadius: '10px',
              border: '1px solid #ddd'
            }} 
          />
        </div>
      )}

      {/* Estadísticas del usuario */}
      <div className="estadisticas-usuario" style={{ marginTop: '1rem' }}>
        <h4>Estadísticas:</h4>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#6c757d' }}>
          <span><FontAwesomeIcon icon={faUsers} /> {user.followers?.length || 0} seguidores</span>
          <span><FontAwesomeIcon icon={faMusic} /> {user.following?.length || 0} siguiendo</span>
        </div>
      </div>

     
    </div>
  );
}
