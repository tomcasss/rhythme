// Limpieza y reconstrucción completa para eliminar duplicaciones y errores.
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logoR.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBell, faCircleUser} from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from "../../config/api.js";
import "./Navbar.css";
import ThemeToggle from "../ThemeToggle.jsx";

export default function Navbar({
  user,
  followLoading = {},
  onFollowUser = async () => false,
  onUnfollowUser = async () => false,
  isFollowing = () => false,
}) {
  const navigate = useNavigate();

  // Refs
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  // Menú usuario
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]); // usuarios
  const [postResults, setPostResults] = useState([]); // posts
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isPostSearch, setIsPostSearch] = useState(false);

  // Notificaciones
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch notificaciones
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get(
          API_ENDPOINTS.GET_USER_NOTIFICATIONS(user._id)
        );
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Error al obtener notificaciones", err);
      }
    };
    fetchNotifications();
  }, [user]);

  const toggleDropdown = () => setShowDropdown((v) => !v);
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

  // Outside click: user menu
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Outside click: search results
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Handlers búsqueda -----------------------------------------------------
  const handleSearchPosts = useCallback(
    async (query, { invokedByFallback = false } = {}) => {
      if (!query || query.trim() === "") {
        setPostResults([]);
        setShowSearchResults(false);
        return;
      }
      setSearchLoading(true);
      try {
        const res = await axios.get(
          API_ENDPOINTS.SEARCH_POSTS(query.trim())
        );
        setPostResults(res.data.posts || []);
        setSearchResults([]);
        setShowSearchResults(true);
        setIsPostSearch(true);
      } catch (error) {
        console.error("Error al buscar posts:", error);
        setPostResults([]);
        if (invokedByFallback) setIsPostSearch(false);
      } finally {
        setSearchLoading(false);
      }
    },
    []
  );

  const handleSearchUsers = useCallback(
    async (query, { fallbackTried = false } = {}) => {
      if (!query || query.trim() === "") {
        setSearchResults([]);
        setPostResults([]);
        setShowSearchResults(false);
        return;
      }
      setSearchLoading(true);
      try {
        const res = await axios.get(
          API_ENDPOINTS.SEARCH_USERS(query.trim())
        );
        const users = res.data.users || [];
        setSearchResults(users);
        setPostResults([]);
        setShowSearchResults(true);
        if (users.length === 0 && !fallbackTried) {
          await handleSearchPosts(query.trim(), { invokedByFallback: true });
        }
      } catch (error) {
        console.error("Error al buscar usuarios:", error);
        setSearchResults([]);
        setPostResults([]);
        if (!fallbackTried) {
          await handleSearchPosts(query.trim(), { invokedByFallback: true });
        }
      } finally {
        setSearchLoading(false);
      }
    },
    [handleSearchPosts]
  );

  // Debounce --------------------------------------------------------------
  useEffect(() => {
    const id = setTimeout(() => {
      const raw = searchQuery.trim();
      if (!raw) {
        setSearchResults([]);
        setPostResults([]);
        setShowSearchResults(false);
        setIsPostSearch(false);
        return;
      }
      const postPrefix = /^post:\s*/i;
      if (postPrefix.test(raw)) {
        const cleaned = raw.replace(postPrefix, "").trim();
        setIsPostSearch(true);
        handleSearchPosts(cleaned);
      } else if (raw.startsWith("#")) {
        const cleaned = raw.slice(1).trim();
        setIsPostSearch(true);
        handleSearchPosts(cleaned);
      } else {
        setIsPostSearch(false);
        handleSearchUsers(raw);
      }
    }, 150);
    return () => clearTimeout(id);
  }, [searchQuery, handleSearchUsers, handleSearchPosts]);

  // Selección -------------------------------------------------------------
  const handleSelectUser = (selectedUser) => {
    setShowSearchResults(false);
    setSearchQuery("");
    setSearchResults([]);
    navigate(`/profile/${selectedUser._id}`);
  };

  const handleSelectPost = (post) => {
    // Navegar directamente al detalle del post
    navigate(`/post/${post._id}`);
    setShowSearchResults(false);
    setSearchQuery("");
    setPostResults([]);
  };

  // Follow / Unfollow -----------------------------------------------------
  const handleFollowFromSearch = async (targetUserId, e) => {
    e.stopPropagation();
    if (isFollowing(targetUserId)) return;
    const success = await onFollowUser(targetUserId);
    if (success && searchQuery.trim()) {
      setTimeout(() => handleSearchUsers(searchQuery), 200);
    }
  };

  const handleUnfollowFromSearch = async (targetUserId, e) => {
    e.stopPropagation();
    if (!isFollowing(targetUserId)) return;
    const success = await onUnfollowUser(targetUserId);
    if (success && searchQuery.trim()) {
      setTimeout(() => handleSearchUsers(searchQuery), 200);
    }
  };

  // Logout ---------------------------------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // Limpiar búsqueda -----------------------------------------------------
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setPostResults([]);
    setShowSearchResults(false);
    setIsPostSearch(false);
  };

  return (
    <header className="navbar">
      <div className="logo-area" onClick={() => navigate("/home")}>
        <img src={logo} alt="RhythMe logo" className="logo1" />
      </div>

      <div className="search-container" ref={searchRef}>
        <div className="search-input-wrapper" style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Buscar usuarios o escribe 'post: palabra' / '#tag'..."
            className={`search-bar ${searchQuery ? "has-clear" : ""}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = searchQuery.trim();
                if (!q) return;
                const postPrefix = /^post:\s*/i;
                if (postPrefix.test(q)) {
                  const cleaned = q.replace(postPrefix, "").trim();
                  setIsPostSearch(true);
                  handleSearchPosts(cleaned);
                } else if (q.startsWith("#")) {
                  const cleaned = q.slice(1).trim();
                  setIsPostSearch(true);
                  handleSearchPosts(cleaned);
                } else {
                  setIsPostSearch(false);
                  handleSearchUsers(q, { fallbackTried: false });
                }
              }
            }}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="clear-search-btn"
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
        {showSearchResults && (
          <div className="search-results-panel">
            {searchLoading ? (
              <div className="search-panel-loading">
                Buscando {isPostSearch ? "posts" : "usuarios"}...
              </div>
            ) : isPostSearch ? (
              postResults.length > 0 ? (
                <>
                  <div className="search-panel-header">
                    {postResults.length} post
                    {postResults.length !== 1 ? "s" : ""} encontrado
                    {postResults.length !== 1 ? "s" : ""}
                  </div>
                  {postResults.map((p) => (
                    <div
                      key={p._id}
                      className="search-result-item"
                      onClick={() => handleSelectPost(p)}
                    >
                      <div className="search-result-main">
                        <div className="search-result-name">
                          {(p.userId?.username || p.userId?.email || "Autor")} ▸
                          {" "}
                          {p.desc?.slice(0, 60) || "(sin descripción)"}
                        </div>
                        <div className="search-result-email time">
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleString()
                            : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : searchQuery.trim() && !searchLoading ? (
                <div className="search-panel-empty">
                  No se encontraron posts para "{searchQuery}"
                </div>
              ) : null
            ) : searchResults.length > 0 ? (
              <>
                <div className="search-panel-header">
                  {searchResults.length} usuario
                  {searchResults.length !== 1 ? "s" : ""} encontrado
                  {searchResults.length !== 1 ? "s" : ""}
                </div>
                {searchResults.map((searchedUser) => (
                  <div
                    key={searchedUser._id}
                    className="search-result-item"
                    onClick={() => handleSelectUser(searchedUser)}
                  >
                    {searchedUser.profilePicture ? (
                      <img
                        src={searchedUser.profilePicture}
                        alt={searchedUser.username || "usuario"}
                        className="search-result-icon"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faCircleUser} className="search-result-icon" />
                    )}
                    <div className="search-result-main">
                      <div className="search-result-name">
                        {searchedUser.username || searchedUser.name || "Usuario"}
                      </div>
                      <div className="search-result-email">{searchedUser.email}</div>
                      {searchedUser.desc && (
                        <div className="search-result-desc">
                          {searchedUser.desc.length > 50
                            ? `${searchedUser.desc.substring(0, 50)}...`
                            : searchedUser.desc}
                        </div>
                      )}
                    </div>
                    <div className="search-result-actions">
                      {searchedUser._id === user?._id ? (
                        <span className="search-self-pill">Tú</span>
                      ) : isFollowing(searchedUser._id) ? (
                        <button
                          onClick={(e) => handleUnfollowFromSearch(searchedUser._id, e)}
                          disabled={followLoading[searchedUser._id]}
                          className="btn-unfollow"
                        >
                          {followLoading[searchedUser._id] ? "..." : "Dejar de seguir"}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleFollowFromSearch(searchedUser._id, e)}
                          disabled={followLoading[searchedUser._id]}
                          className="btn-follow"
                        >
                          {followLoading[searchedUser._id] ? "..." : "Seguir"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : searchQuery.trim() && !searchLoading ? (
              <div className="search-panel-empty">
                No se encontraron {isPostSearch ? "posts" : "usuarios"} para "
                {searchQuery}"
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div
        className="navbar-icons"
        style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
      >
        <ThemeToggle />
        <span className="icon notif notif-wrapper">
          <button
            onClick={toggleDropdown}
            className="notif-button"
            title="Notificaciones"
          >
            <FontAwesomeIcon icon={faBell} size="lg" />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>
          {showDropdown && (
            <div className="notif-dropdown">
              <div className="notif-title">Notificaciones</div>
              {notifications.length === 0 ? (
                <div className="notif-empty">No tienes notificaciones.</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => markAsRead(n._id)}
                    className={`notif-item ${n.isRead ? "" : "notif-item-unread"}`}
                  >
                    {n.message}
                  </div>
                ))
              )}
            </div>
          )}
        </span>
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
                className="action-btn-menu user-menu-item"
                onClick={() => navigate(`/profile/${user._id}`)}
              >
                Mi Perfil
              </button>
              <button
                className="action-btn-menu user-menu-item"
                onClick={() => navigate("/edit-profile")}
              >
                Editar Perfil
              </button>
              <button
                className="action-btn-menu user-menu-item"
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
