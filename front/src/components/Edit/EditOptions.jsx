// src/components/Edit/EditOptions.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api.js';
import Swal from 'sweetalert2/dist/sweetalert2.all.js';
import './EditOptions.css';

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
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Estados para los formularios
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    profilePicture: '',
    coverPicture: '',
    desc: '',
    from: '',
    relationship: 1,
    musicPreferences: [],
    privacy: { profile: 'public', posts: 'public', friends: 'public' }, // Objeto de privacidad
    currentPassword: '',
    newPassword: '',
    accountAction: ''
  });

  const ALL_GENRES = [
    'Rock', 'Pop', 'Metal', 'Hip-Hop', 'Rap', 'R&B', 'Reggaeton', 'Trap', 'Salsa', 'Cumbia',
    'Bachata', 'Jazz', 'Blues', 'Country', 'Funk', 'Soul', 'Disco', 'House', 'Techno', 'Trance',
    'EDM', 'Dubstep', 'Drum & Bass', 'Indie', 'Alternative', 'K-Pop', 'J-Pop', 'Lo-Fi', 'Classical',
    'Opera', 'Soundtrack', 'Latin', 'Flamenco', 'Folk', 'Punk', 'Hardcore', 'Ska', 'Gospel', 'Ambient'
  ];

  /**
   * Mostrar modal de edición
   */
  const handleEditOption = (type) => {
    setModalType(type);
    setShowModal(true);
    setError('');
    setUploadError('');
    setDragOver(false);

    // Obtener datos actuales del usuario desde localStorage
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser) {
      const privacyObj = currentUser.privacy && typeof currentUser.privacy === 'object'
        ? {
            profile: currentUser.privacy.profile || 'public',
            posts: currentUser.privacy.posts || 'public',
            friends: currentUser.privacy.friends || 'public'
          }
        : { profile: 'public', posts: 'public', friends: 'public' };

      setFormData(prev => ({
        ...prev,
        username: currentUser.username || '',
        email: currentUser.email || '',
        profilePicture: currentUser.profilePicture || '',
        coverPicture: currentUser.coverPicture || '',
        desc: currentUser.desc || '',
        from: currentUser.from || '',
        relationship: currentUser.relationship || 1,
        musicPreferences: currentUser.musicPreferences || [],
        privacy: privacyObj,
        currentPassword: '',
        newPassword: '',
        accountAction: ''
      }));
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
      let request;

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
        case 'preferences':
          updateData = { musicPreferences: formData.musicPreferences, userId: currentUser._id };
          break;
        case 'privacy': {
          updateData = { privacy: formData.privacy, userId: currentUser._id };
          request = axios.patch(API_ENDPOINTS.UPDATE_PRIVACY(currentUser._id), updateData);
          break;
        }
        case 'password': {
          if (!formData.currentPassword || !formData.newPassword) {
            setError('Debes completar ambos campos');
            return;
          }
          request = axios.patch(API_ENDPOINTS.UPDATE_PASSWORD(currentUser._id), { userId: currentUser._id, currentPassword: formData.currentPassword, newPassword: formData.newPassword });
          break;
        }
        case 'account': {
          if (formData.accountAction === 'deactivate') {
            request = axios.patch(API_ENDPOINTS.DEACTIVATE_ACCOUNT(currentUser._id), { userId: currentUser._id });
          } else if (formData.accountAction === 'reactivate') {
            request = axios.patch(API_ENDPOINTS.REACTIVATE_ACCOUNT(currentUser._id), { userId: currentUser._id });
          } else if (formData.accountAction === 'delete') {
            const confirm = await Swal.fire({ title: 'Eliminar cuenta', text: 'Esta acción es irreversible. ¿Continuar?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar' });
            if (!confirm.isConfirmed) { setLoading(false); return; }
            request = axios.delete(API_ENDPOINTS.DELETE_USER(currentUser._id), { data: { userId: currentUser._id } });
          }
          if (!request) { setLoading(false); return; }
          break;
        }
        default:
          setError("Tipo de edición no válido");
          return;
      }

      if (!request) {
        // Fallback a flujo existente
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
      } else {
        const response = await request;
        if (modalType === 'privacy' && response.data?.user) {
          const updatedUser = { ...currentUser, ...response.data.user };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        // Acciones post-cambio de cuenta
        if (modalType === 'account' && ['deactivate', 'delete'].includes(formData.accountAction)) {
          // Limpiar sesión local y cerrar sesión
            localStorage.removeItem('user');
            if (onLogout) onLogout();
            Swal.fire({ icon: 'success', title: formData.accountAction === 'delete' ? 'Cuenta eliminada' : 'Cuenta desactivada', timer: 1800, showConfirmButton: false });
        } else {
          Swal.fire({ icon: 'success', title: 'Cambios aplicados', timer: 1500, showConfirmButton: false });
        }
        setShowModal(false);
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Operación fallida' });
    } finally {
      setLoading(false);
    }
  };

  // Helpers para imágenes (mismo patrón que CreatePostForm)
  const validateImageFile = (file, setErr) => {
    if (!file.type || !file.type.startsWith('image/')) {
      setErr('Solo se permiten imágenes');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr('La imagen debe ser menor a 5MB');
      return false;
    }
    setErr('');
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
      if (modalType === 'profile-picture') {
        setFormData(prev => ({ ...prev, profilePicture: dataUrl }));
      } else if (modalType === 'cover-picture') {
        setFormData(prev => ({ ...prev, coverPicture: dataUrl }));
      }
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
      if (modalType === 'profile-picture') {
        setFormData(prev => ({ ...prev, profilePicture: dataUrl }));
      } else if (modalType === 'cover-picture') {
        setFormData(prev => ({ ...prev, coverPicture: dataUrl }));
      }
    } catch {
      setUploadError('No se pudo leer la imagen');
    }
  };

  const clearLocalImage = () => {
    if (modalType === 'profile-picture') {
      setFormData(prev => ({ ...prev, profilePicture: '' }));
    } else if (modalType === 'cover-picture') {
      setFormData(prev => ({ ...prev, coverPicture: '' }));
    }
  };

  /**
   * Renderizar contenido del modal según el tipo
   */
  const renderModalContent = () => {
    const chip = (label, selected, onClick) => (
      <button
        key={label}
        type="button"
        onClick={onClick}
        className={`chip ${selected ? 'chip-selected' : ''}`}
      >
        {label}
      </button>
    );

    switch (modalType) {
      case 'profile-picture':
        return (
          <>

            <h3>Editar Foto de Perfil</h3>
            {error && <p className="error-text">{error}</p>}
            <div
              className={`dropzone ${dragOver ? 'dragover' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <p style={{ margin: 0 }}>
                Arrastra y suelta una imagen aquí o
                <label style={{ color: '#fb7202', cursor: 'pointer', marginLeft: 4 }}>
                  selecciónala
                  <input type="file" accept="image/*" onChange={handleFileInputChange} disabled={loading} style={{ display: 'none' }} />
                </label>
              </p>
              <small style={{ color: '#666' }}>Máximo 5MB. Formatos comunes de imagen.</small>
            </div>
            {formData.profilePicture && (
              <div className="create-image-preview" style={{ marginTop: 12 }}>
                <button type="button" className="remove-image-btn" onClick={clearLocalImage} title="Quitar imagen">×</button>
                <img src={formData.profilePicture} alt="Preview" className="preview-image profile" />
              </div>
            )}
            {uploadError && <div className="error-text" style={{ marginTop: 8 }}>{uploadError}</div>}
            <div className="modal-actions">
              <button onClick={handleSaveChanges} className="modal-btn" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setShowModal(false)} className="modal-btn cancel">
                Cancelar
              </button>
            </div>
          </>
        );

      case 'name':
        return (
          <>
            <h3>Editar Nombre</h3>
            {error && <p className="error-text">{error}</p>}
            <div>
              <label>Nombre de usuario:</label>
              <input
                type="text"
                placeholder="Tu nombre de usuario"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="modal-input"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveChanges} className="modal-btn" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setShowModal(false)} className="modal-btn cancel">
                Cancelar
              </button>
            </div>
          </>
        );

      case 'contact':
        return (
          <>
            <h3>Editar Información de Contacto</h3>
            {error && <p className="error-text">{error}</p>}
            <div>
              <label>Email:</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="modal-input"
              />

              <label>Ubicación (from):</label>
              <input
                type="text"
                placeholder="Ciudad, País"
                value={formData.from}
                onChange={(e) => handleInputChange('from', e.target.value)}
                className="modal-input"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveChanges} className="modal-btn" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setShowModal(false)} className="modal-btn cancel">
                Cancelar
              </button>
            </div>
          </>
        );

      case 'cover-picture':
        return (
          <>
            <h3>Editar Foto de Portada</h3>
            {error && <p className="error-text">{error}</p>}
            <div
              className={`dropzone ${dragOver ? 'dragover' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <p style={{ margin: 0 }}>
                Arrastra y suelta una imagen aquí o
                <label style={{ color: '#fb7202', cursor: 'pointer', marginLeft: 4 }}>
                  selecciónala
                  <input type="file" accept="image/*" onChange={handleFileInputChange} disabled={loading} style={{ display: 'none' }} />
                </label>
              </p>
              <small style={{ color: '#666' }}>Máximo 5MB. Formatos comunes de imagen.</small>
            </div>
            {formData.coverPicture && (
              <div className="create-image-preview" style={{ marginTop: 12 }}>
                <button type="button" className="remove-image-btn" onClick={clearLocalImage} title="Quitar imagen">×</button>
                <img src={formData.coverPicture} alt="Preview" className="preview-image cover" />
              </div>
            )}
            {uploadError && <div className="error-text" style={{ marginTop: 8 }}>{uploadError}</div>}
            <div className="modal-actions">
              <button onClick={handleSaveChanges} className="modal-btn" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setShowModal(false)} className="modal-btn cancel">
                Cancelar
              </button>
            </div>
          </>
        );

      case 'bio':
        return (
          <>
            <h3>Editar Biografía</h3>
            {error && <p className="error-text">{error}</p>}
            <div>
              <label>Descripción (máximo 250 caracteres):</label>
              <textarea
                placeholder="Cuéntanos sobre ti..."
                value={formData.desc}
                onChange={(e) => handleInputChange('desc', e.target.value)}
                maxLength={250}
                rows={4}
                className="modal-textarea"
              />
              <small className="text-muted">
                {formData.desc.length}/250 caracteres
              </small>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveChanges} className="modal-btn" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setShowModal(false)} className="modal-btn cancel">
                Cancelar
              </button>
            </div>
          </>
        );

      case 'preferences':
        return (
          <>
            <h3>Mis géneros musicales</h3>
            {error && <p className="error-text">{error}</p>}
            <p className="modal-hint">
              Selecciona tus géneros favoritos. Se usarán para conectar con usuarios con gustos similares y mejorar las recomendaciones.
            </p>
            <div className="chips-container">
              {ALL_GENRES.map((genre) => {
                const selected = formData.musicPreferences.includes(genre);
                return chip(genre, selected, () => {
                  setFormData(prev => ({
                    ...prev,
                    musicPreferences: selected
                      ? prev.musicPreferences.filter(x => x !== genre)
                      : [...prev.musicPreferences, genre]
                  }));
                });
              })}
            </div>

            {formData.musicPreferences.length > 0 && (
              <div className="mt-1">
                <strong>Seleccionados:</strong>
                <div className="chips-selected">
                  {formData.musicPreferences.map(genre => chip(genre, true, () => {
                    setFormData(prev => ({
                      ...prev,
                      musicPreferences: prev.musicPreferences.filter(x => x !== genre)
                    }));
                  }))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button onClick={handleSaveChanges} className="modal-btn" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setShowModal(false)} className="modal-btn cancel">
                Cancelar
              </button>
            </div>
          </>
        );

      case 'relationship':
        return (
          <>
            <h3>Editar intereses:</h3>
            {error && <p className="error-text">{error}</p>}
            <div>
              <label>Tipo de usuario:</label>
              <select
                value={formData.relationship}
                onChange={(e) => handleInputChange('relationship', e.target.value)}
                className="modal-select"
              >
                <option value={1}>Creador de música</option>
                <option value={2}>Promotor</option>
                <option value={3}>Amante de la música</option>
                <option value={4}>Educador</option> 
                <option value={5}>Comunidad y cultura</option> 
                
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveChanges} className="modal-btn" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setShowModal(false)} className="modal-btn cancel">
                Cancelar
              </button>
            </div>
          </>
        );

      case 'privacy':
        return (
          <>
            <h3>Privacidad y visibilidad</h3>
            <p className="modal-hint">Controla quién puede ver tu perfil, tus posts y tu lista de amigos/seguidores.</p>
            <div className="mb-1">
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Perfil</label>
              <select
                className="modal-select"
                value={formData.privacy?.profile || 'public'}
                onChange={e => setFormData(p => ({ ...p, privacy: { ...(p.privacy||{}), profile: e.target.value } }))}
              >
                <option value="public">Público (todos)</option>
                <option value="followers">Solo seguidores</option>
                <option value="private">Solo yo</option>
              </select>
            </div>
            <div className="mb-1">
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Posts</label>
              <select
                className="modal-select"
                value={formData.privacy?.posts || 'public'}
                onChange={e => setFormData(p => ({ ...p, privacy: { ...(p.privacy||{}), posts: e.target.value } }))}
              >
                <option value="public">Público (todos)</option>
                <option value="followers">Solo seguidores</option>
                <option value="private">Solo yo</option>
              </select>
            </div>
            <div className="mb-1">
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Amigos / Seguidores</label>
              <select
                className="modal-select"
                value={formData.privacy?.friends || 'public'}
                onChange={e => setFormData(p => ({ ...p, privacy: { ...(p.privacy||{}), friends: e.target.value } }))}
              >
                <option value="public">Público (todos)</option>
                <option value="followers">Solo seguidores</option>
                <option value="private">Solo yo</option>
              </select>
            </div>
            <small className="text-muted">Los cambios afectan inmediatamente el acceso a tu contenido.</small>
            <div className="modal-actions">
              <button onClick={handleSaveChanges} className="modal-btn" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
              <button onClick={() => setShowModal(false)} className="modal-btn cancel">Cancelar</button>
            </div>
          </>
        );
      case 'password':
        return (
          <>
            <h3>Cambiar contraseña</h3>
            <input type="password" placeholder="Contraseña actual" value={formData.currentPassword||''} onChange={e=>setFormData(p=>({...p,currentPassword:e.target.value}))} />
            <input type="password" placeholder="Nueva contraseña" value={formData.newPassword||''} onChange={e=>setFormData(p=>({...p,newPassword:e.target.value}))} />
            <div className="modal-actions">
              <button onClick={handleSaveChanges} className="modal-btn" disabled={loading}>{loading ? 'Actualizando...' : 'Actualizar'}</button>
              <button onClick={() => setShowModal(false)} className="modal-btn cancel">Cancelar</button>
            </div>
          </>
        );
      case 'account':
        return (
          <>
            <h3>Estado de la cuenta</h3>
            <p>Selecciona una acción:</p>
            <select value={formData.accountAction||''} onChange={e=>setFormData(p=>({...p,accountAction:e.target.value}))}>
              <option value="">-- Seleccionar --</option>
              <option value="deactivate">Desactivar</option>
              <option value="reactivate">Reactivar</option>
              <option value="delete">Eliminar permanentemente</option>
            </select>
            {formData.accountAction === 'delete' && <p style={{color:'#e74c3c'}}>Esta acción no se puede deshacer.</p>}
            <div className="modal-actions">
              <button onClick={handleSaveChanges} className="modal-btn" disabled={loading || !formData.accountAction}>{loading ? 'Procesando...' : 'Confirmar'}</button>
              <button onClick={() => setShowModal(false)} className="modal-btn cancel">Cancelar</button>
            </div>
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
          Tipo de usuario
        </button>

        <hr />

        <button
          className="btn-opcion"
          onClick={() => handleEditOption('privacy')}
        >
          Privacidad y Seguridad
        </button>

        <button
          className="btn-opcion"
          onClick={() => handleEditOption('password')}
        >
          Cambiar contraseña
        </button>

        <button
          className="btn-opcion"
          onClick={() => handleEditOption('account')}
        >
          Configuración de cuenta
        </button>

        <hr />

        <button
          className="btn-opcion"
          onClick={() => handleEditOption('preferences')}
        >
          Mis Preferencias
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
        <div className="modal-overlay">
          <div className="modal-content">
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
}
