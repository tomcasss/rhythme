// src/components/Edit/EditOptions.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api.js';

/**
 * Componente EditOptions - Opciones de edición y configuración del usuario
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onLogout - Función para cerrar sesión
 * @param {Function} props.onUpdateUser - Función para actualizar datos del usuario
 */
export default function EditOptions({ onLogout, onUpdateUser }) {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para los formularios
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    profilePicture: '',
    spotify: '',
    soundcloud: '',
    applemusic: '',
    youtube: ''
  });

  /**
   * Mostrar modal de edición
   */
  const handleEditOption = (type) => {
    setModalType(type);
    setShowModal(true);
    setError('');
    
    // Obtener datos actuales del usuario desde localStorage
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        profilePicture: currentUser.profilePicture || '',
        spotify: currentUser.spotify || '',
        soundcloud: currentUser.soundcloud || '',
        applemusic: currentUser.applemusic || '',
        youtube: currentUser.youtube || ''
      });
    }
  };

  /**
   * Manejar cambios en los inputs
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Guardar cambios en el backend
   */
  const handleSaveChanges = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser?._id) {
      setError("Error: Usuario no encontrado");
      return;
    }

    setLoading(true);
    setError('');

    try {
      let updateData = {};
      
      // Preparar datos según el tipo de edición
      switch (modalType) {
        case 'name':
          updateData = { username: formData.username };
          break;
        case 'contact':
          updateData = { 
            email: formData.email,
            phone: formData.phone,
            location: formData.location
          };
          break;
        case 'profile-picture':
          updateData = { profilePicture: formData.profilePicture };
          break;
        case 'social-media':
          updateData = {
            spotify: formData.spotify,
            soundcloud: formData.soundcloud,
            applemusic: formData.applemusic,
            youtube: formData.youtube
          };
          break;
        default:
          setError("Tipo de edición no válido");
          return;
      }

      // Llamar al backend
      const response = await axios.put(API_ENDPOINTS.UPDATE_USER(currentUser._id), updateData);
      
      if (response.data) {
        // Actualizar localStorage
        const updatedUser = { ...currentUser, ...updateData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Llamar callback del componente padre
        if (onUpdateUser) {
          await onUpdateUser(updateData);
        }
        
        // Cerrar modal
        setShowModal(false);
        alert("¡Perfil actualizado exitosamente!");
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      setError(error.response?.data?.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renderizar contenido del modal según el tipo
   */
  const renderModalContent = () => {
    const inputStyle = {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #ddd',
      borderRadius: '5px',
      fontSize: '1rem',
      marginBottom: '1rem'
    };

    const buttonStyle = {
      background: '#ff7a00',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '1rem',
      marginRight: '0.5rem'
    };

    const cancelButtonStyle = {
      ...buttonStyle,
      background: '#6c757d'
    };

    switch (modalType) {
      case 'profile-picture':
        return (
          <>
            <h3>Editar Foto de Perfil</h3>
            {error && <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>}
            <div>
              <label>URL de la imagen:</label>
              <input
                type="url"
                placeholder="https://ejemplo.com/mi-foto.jpg"
                value={formData.profilePicture}
                onChange={(e) => handleInputChange('profilePicture', e.target.value)}
                style={inputStyle}
              />
              {formData.profilePicture && (
                <div style={{ marginBottom: '1rem' }}>
                  <p>Vista previa:</p>
                  <img 
                    src={formData.profilePicture} 
                    alt="Preview" 
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
                    onError={() => setError('URL de imagen no válida')}
                  />
                </div>
              )}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button onClick={handleSaveChanges} style={buttonStyle} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setShowModal(false)} style={cancelButtonStyle}>
                Cancelar
              </button>
            </div>
          </>
        );

      case 'name':
        return (
          <>
            <h3>Editar Nombre</h3>
            {error && <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>}
            <div>
              <label>Nombre de usuario:</label>
              <input
                type="text"
                placeholder="Tu nombre de usuario"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button onClick={handleSaveChanges} style={buttonStyle} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setShowModal(false)} style={cancelButtonStyle}>
                Cancelar
              </button>
            </div>
          </>
        );

      case 'contact':
        return (
          <>
            <h3>Editar Información de Contacto</h3>
            {error && <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>}
            <div>
              <label>Email:</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={inputStyle}
              />
              
              <label>Teléfono:</label>
              <input
                type="tel"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={inputStyle}
              />
              
              <label>Ubicación:</label>
              <input
                type="text"
                placeholder="Ciudad, País"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button onClick={handleSaveChanges} style={buttonStyle} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setShowModal(false)} style={cancelButtonStyle}>
                Cancelar
              </button>
            </div>
          </>
        );

      case 'social-media':
        return (
          <>
            <h3>Editar Redes Sociales</h3>
            {error && <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>}
            <div>
              <label>Spotify:</label>
              <input
                type="url"
                placeholder="https://open.spotify.com/user/..."
                value={formData.spotify}
                onChange={(e) => handleInputChange('spotify', e.target.value)}
                style={inputStyle}
              />
              
              <label>SoundCloud:</label>
              <input
                type="url"
                placeholder="https://soundcloud.com/..."
                value={formData.soundcloud}
                onChange={(e) => handleInputChange('soundcloud', e.target.value)}
                style={inputStyle}
              />
              
              <label>Apple Music:</label>
              <input
                type="url"
                placeholder="https://music.apple.com/..."
                value={formData.applemusic}
                onChange={(e) => handleInputChange('applemusic', e.target.value)}
                style={inputStyle}
              />
              
              <label>YouTube:</label>
              <input
                type="url"
                placeholder="https://youtube.com/..."
                value={formData.youtube}
                onChange={(e) => handleInputChange('youtube', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button onClick={handleSaveChanges} style={buttonStyle} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setShowModal(false)} style={cancelButtonStyle}>
                Cancelar
              </button>
            </div>
          </>
        );

      default:
        return (
          <>
            <h3>Funcionalidad en desarrollo</h3>
            <p>La opción "{modalType}" estará disponible próximamente.</p>
            <button onClick={() => setShowModal(false)} style={buttonStyle}>
              Cerrar
            </button>
          </>
        );
    }
  };

  /**
   * Confirmar logout
   */
  const handleLogoutConfirm = () => {
    if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      onLogout();
    }
  };

  return (
    <div className="columna-derecha">
      <div className="opciones">
        <h3>Editar mi información</h3>
        
        <button 
          className="btn-opcion"
          onClick={() => handleEditOption('profile-picture')}
        >
          Editar mi foto de perfil
        </button>
        
        <button 
          className="btn-opcion"
          onClick={() => handleEditOption('name')}
        >
          Editar mi nombre
        </button>
        
        <button 
          className="btn-opcion"
          onClick={() => handleEditOption('contact')}
        >
          Editar mi contacto
        </button>
        
        <button 
          className="btn-opcion"
          onClick={() => handleEditOption('social-media')}
        >
          Editar redes sociales
        </button>
        
        <hr />
        
        <button 
          className="btn-opcion"
          onClick={() => handleEditOption('privacy')}
        >
          Privacidad y Seguridad
        </button>
        
        <hr />
        
        <button 
          className="btn-opcion"
          onClick={() => handleEditOption('preferences')}
        >
          Mis Preferencias
        </button>
        
        <hr />
        
        <button 
          className="btn-opcion"
          onClick={() => handleEditOption('activity')}
        >
          Mi Actividad
        </button>
        
        <hr />
        
        <div className="acciones">
          <button 
            className="reporte"
            onClick={() => handleEditOption('report')}
          >
            Reportar un problema
          </button>
          
          <button 
            className="cerrar-sesion"
            onClick={handleLogoutConfirm}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Modal funcional para edición */}
      {showModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
}
