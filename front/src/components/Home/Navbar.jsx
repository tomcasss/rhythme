// src/components/Home/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from '../../assets/logoR.png';
import userImg from '../../assets/user.png';
import { API_ENDPOINTS } from "../../config/api.js";

/**
 * Componente Navbar - Barra de navegación con búsqueda de usuarios
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.user - Usuario actual
 * @param {Set} props.followingUsers - Set de usuarios que sigue el usuario actual
 * @param {Object} props.followLoading - Estado de carga de seguimiento por usuario
 * @param {Function} props.onFollowUser - Función para seguir usuario
 * @param {Function} props.onUnfollowUser - Función para dejar de seguir usuario
 * @param {Function} props.isFollowing - Función para verificar si sigue a un usuario
 */
export default function Navbar({ 
  user, 
  followLoading, 
  onFollowUser, 
  onUnfollowUser,
  isFollowing
}) {
  const navigate = useNavigate();
  
  // Estados para el menú de usuario
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef();
  
  // Estados para búsqueda de usuarios
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef();

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar resultados de búsqueda al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Búsqueda de usuarios con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearchUsers(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  /**
   * Buscar usuarios en la base de datos
   */
  const handleSearchUsers = async (query) => {
    if (!query || query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.SEARCH_USERS(query.trim()));
      setSearchResults(res.data.users || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  /**
   * Seleccionar usuario de los resultados de búsqueda
   */
  const handleSelectUser = (selectedUser) => {
    setShowSearchResults(false);
    setSearchQuery("");
    setSearchResults([]);
    console.log("Usuario seleccionado:", selectedUser);
    // Aquí puedes navegar al perfil del usuario
    // navigate(`/perfil/${selectedUser._id}`);
  };

  /**
   * Seguir usuario desde los resultados de búsqueda
   */
  const handleFollowFromSearch = async (targetUserId, e) => {
    e.stopPropagation();
    
    // Verificar si ya está siguiendo al usuario usando la función isFollowing
    if (isFollowing(targetUserId)) {
      console.log("Ya sigues a este usuario");
      return;
    }
    
    const success = await onFollowUser(targetUserId);
    
    // Solo recargar resultados si la operación fue exitosa
    if (success && searchQuery.trim()) {
      setTimeout(() => {
        handleSearchUsers(searchQuery);
      }, 200);
    }
  };

  /**
   * Dejar de seguir usuario desde los resultados de búsqueda
   */
  const handleUnfollowFromSearch = async (targetUserId, e) => {
    e.stopPropagation();
    
    // Verificar si realmente sigue al usuario usando la función isFollowing
    if (!isFollowing(targetUserId)) {
      console.log("No sigues a este usuario");
      return;
    }
    
    const success = await onUnfollowUser(targetUserId);
    
    // Solo recargar resultados si la operación fue exitosa
    if (success && searchQuery.trim()) {
      setTimeout(() => {
        handleSearchUsers(searchQuery);
      }, 200);
    }
  };

  /**
   * Cerrar sesión del usuario
   */
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  /**
   * Limpiar búsqueda
   */
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  return (
    <header className="navbar">
      {/* Logo */}
      <div className="logo-area">
        <img src={logo} alt="RhythMe logo" className="logo1" />
      </div>
      
      {/* Barra de búsqueda */}
      <div className="search-container" style={{position: 'relative', flex: 1, maxWidth: '500px'}} ref={searchRef}>
        <div style={{position: 'relative'}}>
          <input
            type="text"
            placeholder="Buscar usuarios..."
            className="search-bar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
            style={{paddingRight: searchQuery ? '2.5rem' : '1rem'}}
          />
          
          {/* Botón limpiar búsqueda */}
          {searchQuery && (
            <button
              onClick={clearSearch}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: '#999',
                padding: '0.25rem'
              }}
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Resultados de búsqueda */}
        {showSearchResults && (
          <div className="search-results">
            {searchLoading ? (
              <div style={{padding: '1rem', textAlign: 'center', color: '#666'}}>
                Buscando usuarios...
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div style={{padding: '0.5rem 1rem', background: '#f8f9fa', borderBottom: '1px solid #eee', fontSize: '0.9rem', color: '#666'}}>
                  {searchResults.length} usuario{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                </div>
                {searchResults.map((searchUser) => (
                  <div 
                    key={searchUser._id} 
                    className="search-result-item"
                    onClick={() => handleSelectUser(searchUser)}
                  >
                    <img 
                      src={searchUser.profilePicture || userImg} 
                      alt="avatar" 
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: '600', color: '#333'}}>
                        {searchUser.username || searchUser.name || 'Usuario'}
                      </div>
                      <div style={{fontSize: '0.85rem', color: '#666'}}>
                        {searchUser.email}
                      </div>
                      {searchUser.desc && (
                        <div style={{fontSize: '0.8rem', color: '#999', marginTop: '0.25rem'}}>
                          {searchUser.desc.length > 50 ? `${searchUser.desc.substring(0, 50)}...` : searchUser.desc}
                        </div>
                      )}
                    </div>
                    
                    {/* Botones de seguir/dejar de seguir */}
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      {searchUser._id === user?._id ? (
                        <span style={{fontSize: '0.8rem', color: '#999', fontStyle: 'italic'}}>Tú</span>
                      ) : isFollowing(searchUser._id) ? (
                        <button
                          onClick={(e) => handleUnfollowFromSearch(searchUser._id, e)}
                          disabled={followLoading[searchUser._id]}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          {followLoading[searchUser._id] ? '...' : 'Dejar de seguir'}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleFollowFromSearch(searchUser._id, e)}
                          disabled={followLoading[searchUser._id]}
                          style={{
                            background: 'linear-gradient(90deg, #fb7202, #e82c0b)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          {followLoading[searchUser._id] ? '...' : 'Seguir'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : searchQuery.trim() && !searchLoading ? (
              <div style={{padding: '1rem', textAlign: 'center', color: '#666'}}>
                No se encontraron usuarios para "{searchQuery}"
              </div>
            ) : null}
          </div>
        )}
      </div>
      
      {/* Iconos de navegación */}
      <div className="navbar-icons">
        <span className="icon notif">🔔</span>
        
        {/* Menú de usuario */}
        <span className="icon user" style={{position: 'relative'}}>
          <button 
            className="action-btn" 
            style={{background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer'}} 
            onClick={() => setUserMenuOpen((v) => !v)}
          >
            👤
          </button>
          {userMenuOpen && (
            <div 
              ref={userMenuRef} 
              style={{
                position: 'absolute', 
                top: 30, 
                right: 0, 
                background: '#fff', 
                border: '1px solid #eee', 
                borderRadius: 8, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
                padding: '0.5rem', 
                minWidth: 120, 
                zIndex: 10
              }}
            >
              <button 
                className="action-btn" 
                style={{width: '100%', textAlign: 'left', color: '#e82c0b'}} 
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </span>
      </div>
    </header>
  );
}
