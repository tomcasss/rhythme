// src/components/Edit/EditOptions.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api.js';
import Swal from 'sweetalert2';

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
    profilePicture: '',
    coverPicture: '',
    desc: '',
    from: '',
    relationship: 1
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
        profilePicture: currentUser.profilePicture || '',
        coverPicture: currentUser.coverPicture || '',
        desc: currentUser.desc || '',
        from: currentUser.from || '',
        relationship: currentUser.relationship || 1
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
          updateData = { username: formData.username, userId: currentUser._id };
          break;
        case 'contact':
          updateData = { 
            email: formData.email,
            from: formData.from,
            userId: currentUser._id
          };
          break;
        case 'profile-picture':
          updateData = { profilePicture: formData.profilePicture, userId: currentUser._id };
          break;
        case 'cover-picture':
          updateData = { coverPicture: formData.coverPicture, userId: currentUser._id };
          break;
        case 'bio':
          updateData = { desc: formData.desc, userId: currentUser._id };
          break;
        case 'relationship':
          updateData = { relationship: parseInt(formData.relationship), userId: currentUser._id };
          break;
        default:
          setError("Tipo de edición no válido");
          return;
      }

      // Llamar al backend
      const response = await axios.put(API_ENDPOINTS.UPDATE_USER(currentUser._id), updateData);
      
      if (response.data && response.data.user) {
        // Actualizar localStorage con los datos del usuario completo del backend
        const updatedUser = { ...currentUser, ...response.data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Llamar callback del componente padre
        if (onUpdateUser) {
          await onUpdateUser(response.data.user);
        }
        
        // Cerrar modal
        setShowModal(false);
        Swal.fire({
          icon: 'success',
          title: 'Perfil actualizado',
          text: '¡Perfil actualizado exitosamente!',
        });
      } else {
        setError("Error: Respuesta inválida del servidor");
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
      marginBottom: '1rem',
      color: '#333',
      backgroundColor: '#fff'
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
              
              <label>Ubicación (from):</label>
              <input
                type="text"
                placeholder="Ciudad, País"
                value={formData.from}
                onChange={(e) => handleInputChange('from', e.target.value)}
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

      case 'cover-picture':
        return (
          <>
            <h3>Editar Foto de Portada</h3>
            {error && <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>}
            <div>
              <label>URL de la imagen de portada:</label>
              <input
                type="url"
                placeholder="https://ejemplo.com/mi-portada.jpg"
                value={formData.coverPicture}
                onChange={(e) => handleInputChange('coverPicture', e.target.value)}
                style={inputStyle}
              />
              {formData.coverPicture && (
                <div style={{ marginBottom: '1rem' }}>
                  <p>Vista previa:</p>
                  <img 
                    src={formData.coverPicture} 
                    alt="Preview" 
                    style={{ width: '200px', height: '100px', objectFit: 'cover', borderRadius: '10px' }}
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

      case 'bio':
        return (
          <>
            <h3>Editar Biografía</h3>
            {error && <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>}
            <div>
              <label>Descripción (máximo 250 caracteres):</label>
              <textarea
                placeholder="Cuéntanos sobre ti..."
                value={formData.desc}
                onChange={(e) => handleInputChange('desc', e.target.value)}
                maxLength={250}
                rows={4}
                style={{...inputStyle, resize: 'vertical'}}
              />
              <small style={{color: '#6c757d'}}>
                {formData.desc.length}/250 caracteres
              </small>
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

      case 'relationship':
        return (
          <>
            <h3>Editar Estado de Relación</h3>
            {error && <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>}
            <div>
              <label>Estado de relación:</label>
              <select
                value={formData.relationship}
                onChange={(e) => handleInputChange('relationship', e.target.value)}
                style={inputStyle}
              >
                <option value={1}>Soltero/a</option>
                <option value={2}>En una relación</option>
                <option value={3}>Casado/a</option>
              </select>
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
          onClick={() => handleEditOption('cover-picture')}
        >
          Editar foto de portada
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
          onClick={() => handleEditOption('bio')}
        >
          Editar biografía
        </button>
        
        <button 
          className="btn-opcion"
          onClick={() => handleEditOption('relationship')}
        >
          Estado de relación
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
