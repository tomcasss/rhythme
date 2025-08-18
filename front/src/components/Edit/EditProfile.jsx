// src/components/Edit/EditProfile.jsx
import React, { useState } from 'react';
import ImageModal from '../common/ImageModal.jsx';
import perfil from '../../assets/perfil.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUsers, faMusic, faImage, faTimes } from '@fortawesome/free-solid-svg-icons';
import './EditOptions.css';
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
  const [localImagePreview, setLocalImagePreview] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false); // modal para actualizar foto
  const [viewImageSrc, setViewImageSrc] = useState(""); // modal de visualización full

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
  const handleQuickPhotoUpdate = () => {
    setUploadError("");
    setLocalImagePreview("");
    setShowPhotoModal(true);
  };

  // Utilidades de validación y lectura de archivo (igual que en posts)
  const validateImageFile = (file, setError) => {
    if (!file.type || !file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB');
      return false;
    }
    setError("");
    return true;
  };

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateImageFile(file, setUploadError)) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setLocalImagePreview(dataUrl);
    } catch {
      setUploadError('No se pudo leer la imagen');
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (!validateImageFile(file, setUploadError)) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setLocalImagePreview(dataUrl);
    } catch {
      setUploadError('No se pudo leer la imagen');
    }
  };

  const handleUploadProfilePhoto = async () => {
    if (!localImagePreview) return;
    setUpdating(true);
    setUpdateMessage('📤 Subiendo foto de perfil...');
    setUploadError("");
    try {
      const result = await onUpdateUser({ profilePicture: localImagePreview, userId: user._id });
      if (result?.success || result?.user) {
        setUpdateMessage('✅ Foto actualizada correctamente');
        setLocalImagePreview("");
        setShowPhotoModal(false);
      } else {
        setUpdateMessage('❌ Error al actualizar la foto');
      }
    } catch {
      setUpdateMessage('❌ Error al actualizar la foto');
    } finally {
      setTimeout(() => setUpdateMessage(""), 3000);
      setUpdating(false);
    }
  };

  const handleRemoveLocalImage = () => {
    setLocalImagePreview("");
    setUploadError("");
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
            onClick={() => user.profilePicture && setViewImageSrc(user.profilePicture)}
            style={{ cursor: user.profilePicture ? 'pointer' : 'default' }}
            title={user.profilePicture ? 'Ver imagen' : undefined}
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
            {user.relationship === 1 && "Creador de música"}
            {user.relationship === 2 && "Promotor"}
            {user.relationship === 3 && "Amante de la música"}
            {user.relationship === 4 && "Educador"}
            {user.relationship === 5 && "Comunidad y cultura"}
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
            onClick={() => setViewImageSrc(user.coverPicture)}
            style={{ cursor: 'pointer' }}
            title="Ver portada"
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
      {showPhotoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Actualizar foto de perfil</h3>
            <div
              className={`dropzone ${dragOver ? 'dragover' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <p style={{ margin: 0 }}>
                <FontAwesomeIcon icon={faImage} /> Arrastra y suelta una imagen aquí o
                <label style={{ color: '#fb7202', cursor: 'pointer', marginLeft: 4 }}>
                  selecciónala
                  <input type="file" accept="image/*" onChange={handleFileInputChange} disabled={updating} style={{ display: 'none' }} />
                </label>
              </p>
              <small style={{ color: '#666' }}>Máximo 5MB. Formatos comunes de imagen.</small>
            </div>
            {localImagePreview && (
              <div className="create-image-preview" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={handleRemoveLocalImage}
                  title="Quitar imagen"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                <img src={localImagePreview} alt="Vista previa" style={{ maxWidth: '100%', borderRadius: 8 }} />
              </div>
            )}
            {uploadError && (
              <div className="update-msg update-err" style={{ marginTop: 12 }}>{uploadError}</div>
            )}
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button onClick={handleUploadProfilePhoto} className="modal-btn" disabled={updating || !localImagePreview}>
                {updating ? 'Subiendo...' : 'Guardar'}
              </button>
              <button onClick={() => { if (!updating) { setShowPhotoModal(false); } }} className="modal-btn cancel">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    {viewImageSrc && (
      <ImageModal src={viewImageSrc} alt="Imagen" onClose={() => setViewImageSrc("")} />
    )}
    </div>
  );
}
