// src/components/Home/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logoR.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBell } from "@fortawesome/free-solid-svg-icons";
import userImg from "../../assets/user.png";
import { API_ENDPOINTS } from "../../config/api.js";
import "./Navbar.css";

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
  isFollowing,
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

    // ---------------------- notificaciones
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);


  // Cargar notificaciones al montar el componente
useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.GET_USER_NOTIFICATIONS(user._id));
      setNotifications(res.data);
    } catch (err) {
      console.error("Error al obtener notificaciones", err);
    }
  };

  if (user?._id) fetchNotifications();
}, [user]);

const toggleDropdown = () => {
  setShowDropdown(!showDropdown);
};

const markAsRead = async (notifId) => {
  try {
    await axios.put(API_ENDPOINTS.MARK_NOTIFICATION_AS_READ(notifId));
    setNotifications((prev) =>
      prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
    );
  } catch (err) {
    console.error("Error al marcar notificación como leída", err);
  }
};

const unreadCount = notifications.filter((n) => !n.isRead).length;

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
    if (!query || query.trim() === "") {
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
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  

  return (
    <header className="navbar">
      {/* Logo */}
  <div className="logo-area" onClick={() => navigate("/home")}> 
        <img src={logo} alt="RhythMe logo" className="logo1" />
      </div>

      {/* Barra de búsqueda */}
      <div className="search-container" ref={searchRef}>
  <div className="search-input-wrapper" style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Buscar usuarios..."
            className={`search-bar ${searchQuery ? 'has-clear' : ''}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
          />

          {/* Botón limpiar búsqueda */}
          {searchQuery && (
            <button onClick={clearSearch} className="clear-search-btn" title="Limpiar búsqueda">
              ✕
            </button>
          )}
        </div>

        {/* Resultados de búsqueda */}
        {showSearchResults && (
          <div className="search-results-panel">
            {searchLoading ? (
              <div className="search-panel-loading" style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
                Buscando usuarios...
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="search-panel-header">
                  {searchResults.length} usuario
                  {searchResults.length !== 1 ? "s" : ""} encontrado
                  {searchResults.length !== 1 ? "s" : ""}
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
                      className="search-result-avatar"
                    />
                    <div className="search-result-main">
                      <div className="search-result-name">
                        {searchUser.username || searchUser.name || "Usuario"}
                      </div>
                      <div className="search-result-email">
                        {searchUser.email}
                      </div>
                      {searchUser.desc && (
                        <div className="search-result-desc">
                          {searchUser.desc.length > 50
                            ? `${searchUser.desc.substring(0, 50)}...`
                            : searchUser.desc}
                        </div>
                      )}
                    </div>

                    {/* Botones de seguir/dejar de seguir */}
                    <div className="search-result-actions">
                      {searchUser._id === user?._id ? (
                        <span className="search-self-pill" style={{ fontSize: "0.8rem", color: "#999", fontStyle: "italic" }}>
                          Tú
                        </span>
                      ) : isFollowing(searchUser._id) ? (
                        <button
                          onClick={(e) =>
                            handleUnfollowFromSearch(searchUser._id, e)
                          }
                          disabled={followLoading[searchUser._id]}
                          className="btn-unfollow"
                        >
                          {followLoading[searchUser._id]
                            ? "..."
                            : "Dejar de seguir"}
                        </button>
                      ) : (
                        <button
                          onClick={(e) =>
                            handleFollowFromSearch(searchUser._id, e)
                          }
                          disabled={followLoading[searchUser._id]}
                          className="btn-follow"
                        >
                          {followLoading[searchUser._id] ? "..." : "Seguir"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : searchQuery.trim() && !searchLoading ? (
              <div className="search-panel-empty" style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
                No se encontraron usuarios para "{searchQuery}"
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Iconos de navegación */}
      <div className="navbar-icons">
        <span className="icon notif notif-wrapper">
  <button
    onClick={toggleDropdown}
    className="notif-button"
    title="Notificaciones"
  >
    <FontAwesomeIcon icon={faBell} size="lg" />
    {unreadCount > 0 && (
      <span className="notif-badge">
        {unreadCount}
      </span>
    )}
  </button>

  {showDropdown && (
    <div className="notif-dropdown">
      <div className="notif-title">
        Notificaciones
      </div>
      {notifications.length === 0 ? (
        <div className="notif-empty">
          No tienes notificaciones.
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            onClick={() => markAsRead(n._id)}
            className={`notif-item ${n.isRead ? '' : 'notif-item-unread'}`}
          >
            {n.message}
          </div>
        ))
      )}
    </div>
  )}
</span>


        {/* Menú de usuario */}
    <span className="icon user user-menu-wrapper">
          <button
      className="action-btn user-menu-button"
            onClick={() => setUserMenuOpen((v) => !v)}
          >
            <FontAwesomeIcon icon={faUser} className="user-menu-icon" />
          </button>
          {userMenuOpen && (
      <div ref={userMenuRef} className="user-menu-panel">
              <button
        className="action-btn user-menu-item"
                onClick={() => navigate(`/profile/${user._id}`)}
              >
                Mi Perfil
              </button>
              <button
        className="action-btn user-menu-item"
                onClick={() => navigate('/edit-profile')}
              >
                Editar Perfil
              </button>
              <button
        className="action-btn user-menu-item"
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
