// src/pages/Home.jsx
import "./Home.css";
import logo from '../assets/logoR.png';
import userImg from '../assets/user.png';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useRef } from "react";
import { API_ENDPOINTS } from "../config/api.js";

export default function Home() {
  // Estados para posts, formularios y menús
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const navigate = useNavigate();
  // Menú de tres puntos para opciones de post (editar/eliminar)
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef();
  // Menú de usuario (cerrar sesión)
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef();
  // Estados para edición de post
  const [editingPostId, setEditingPostId] = useState(null);
  const [editDesc, setEditDesc] = useState("");
  const [editImg, setEditImg] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  
  // Estados para comentarios
  const [showCommentsForPost, setShowCommentsForPost] = useState(null);
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  // Estados para seguimiento de usuarios
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [followLoading, setFollowLoading] = useState({});

  // Estados para búsqueda de usuarios
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef();

  // Función helper para obtener el ID del usuario del post
  const getPostUserId = (post) => {
    if (!post.userId) return null;
    return typeof post.userId === 'object' ? post.userId._id : post.userId;
  };

  // Función helper para verificar si es post propio
  const isOwnPost = (post) => {
    if (!user || !user._id || !post.userId) return false;
    const postUserId = getPostUserId(post);
    return postUserId === user._id;
  };

  // Función helper para verificar si ya sigue al usuario
  const isFollowingUser = (post) => {
    const postUserId = getPostUserId(post);
    return postUserId ? followingUsers.has(postUserId) : false;
  };

  // Cierra el menú de opciones de post si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cierra el menú de usuario si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cierra los resultados de búsqueda si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user._id) {
      navigate("/");
      return;
    }
    
    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(API_ENDPOINTS.GET_TIMELINE_POSTS(user._id));
        setPosts(res.data.timeLinePosts || []);
        setLoading(false);
      } catch {
        setError("Error al cargar los posts. Intenta de nuevo.");
        setLoading(false);
      }
    };

    const fetchUserFollowing = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.GET_USER(user._id));
        if (res.data.user && res.data.user.following) {
          setFollowingUsers(new Set(res.data.user.following));
        }
      } catch (error) {
        console.error("Error al cargar lista de seguidos:", error);
      }
    };

    fetchPosts();
    fetchUserFollowing();
  }, [navigate]);

  // Crear un nuevo post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user._id) {
      setCreateError("Debes estar autenticado para crear un post.");
      setCreating(false);
      return;
    }
    try {
      const res = await axios.post(API_ENDPOINTS.CREATE_POST, {
        userId: user._id,
        desc,
        img,
      });
      // Al crear, agregamos el userId poblado para mostrar username/email de inmediato
      const newPost = {
        ...res.data.newPost,
        userId: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      };
      setPosts((prev) => [newPost, ...prev]);
      setDesc("");
      setImg("");
      setCreating(false);
    } catch {
      setCreateError("Error al crear el post. Intenta de nuevo.");
      setCreating(false);
    }
  };

  const user = JSON.parse(localStorage.getItem("user"));

  // Like/unlike a un post
  const handleLike = async (postId) => {
    if (!user || !user._id) return;
    try {
      await axios.put(API_ENDPOINTS.LIKE_POST(postId), {
        userId: user._id
      });
      setPosts((prev) => prev.map(post => {
        if (post._id === postId) {
          const hasLiked = post.likes.includes(user._id);
          return {
            ...post,
            likes: hasLiked
              ? post.likes.filter(id => id !== user._id)
              : [...post.likes, user._id]
          };
        }
        return post;
      }));
    } catch {
      alert("Error al dar like. Intenta de nuevo.");
    }
  };

  // Eliminar un post propio
  const handleDelete = async (postId) => {
    if (!user || !user._id) return;
    if (!window.confirm("¿Seguro que quieres eliminar este post?")) return;
    try {
      await axios.delete(API_ENDPOINTS.DELETE_POST(postId, user._id));
      setPosts((prev) => prev.filter(post => post._id !== postId));
    } catch {
      alert("Error al eliminar el post. Intenta de nuevo.");
    }
  };

  // Iniciar edición de un post propio
  const startEdit = (post) => {
    setEditingPostId(post._id);
    setEditDesc(post.desc);
    setEditImg(post.img);
    setEditError("");
  };
  // Cancelar edición
  const cancelEdit = () => {
    setEditingPostId(null);
    setEditDesc("");
    setEditImg("");
    setEditError("");
  };
  // Guardar edición de post
  const handleEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      await axios.put(API_ENDPOINTS.UPDATE_POST(editingPostId), {
        userId: user._id,
        desc: editDesc,
        img: editImg,
      });
      setPosts((prev) => prev.map(post =>
        post._id === editingPostId ? { ...post, desc: editDesc, img: editImg } : post
      ));
      cancelEdit();
    } catch {
      setEditError("Error al editar el post. Intenta de nuevo.");
    }
    setEditLoading(false);
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // Buscar usuarios
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

  // Debounce para la búsqueda (esperar 300ms después de que el usuario deje de escribir)
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

  // Navegar al perfil del usuario seleccionado
  const handleSelectUser = (selectedUser) => {
    setShowSearchResults(false);
    setSearchQuery("");
    setSearchResults([]);
    // Aquí puedes navegar al perfil del usuario
    console.log("Usuario seleccionado:", selectedUser);
    // navigate(`/perfil/${selectedUser._id}`);
  };

  // Seguir usuario desde búsqueda
  const handleFollowFromSearch = async (targetUserId, e) => {
    e.stopPropagation(); // Evitar que se ejecute handleSelectUser
    await handleFollowUser(targetUserId);
  };

  // Dejar de seguir usuario desde búsqueda
  const handleUnfollowFromSearch = async (targetUserId, e) => {
    e.stopPropagation(); // Evitar que se ejecute handleSelectUser
    await handleUnfollowUser(targetUserId);
  };

  // Seguir usuario
  const handleFollowUser = async (targetUserId) => {
    if (!user || !user._id || targetUserId === user._id) return;
    
    // Verificar si ya sigue al usuario
    if (followingUsers.has(targetUserId)) {
      console.log("Ya sigues a este usuario");
      return;
    }
    
    setFollowLoading(prev => ({ ...prev, [targetUserId]: true }));
    
    try {
      await axios.put(API_ENDPOINTS.FOLLOW_USER(targetUserId), {
        userId: user._id
      });
      
      // Actualizar estado local
      setFollowingUsers(prev => new Set([...prev, targetUserId]));
      
      // Mostrar mensaje de éxito
      const userName = posts.find(p => getPostUserId(p) === targetUserId);
      const displayName = userName?.userId?.username || userName?.userId?.email || 'usuario';
      console.log(`Ahora sigues a ${displayName}`);
      
    } catch (error) {
      console.error("Error al seguir usuario:", error);
      
      // Manejo de errores específicos
      if (error.response?.status === 400) {
        alert("Ya sigues a este usuario.");
        // Sincronizar estado local con el servidor
        setFollowingUsers(prev => new Set([...prev, targetUserId]));
      } else if (error.response?.status === 404) {
        alert("Usuario no encontrado.");
      } else {
        alert("Error al seguir usuario. Intenta de nuevo.");
      }
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  // Dejar de seguir usuario
  const handleUnfollowUser = async (targetUserId) => {
    if (!user || !user._id || targetUserId === user._id) return;
    
    // Verificar si realmente sigue al usuario
    if (!followingUsers.has(targetUserId)) {
      console.log("No sigues a este usuario");
      return;
    }
    
    setFollowLoading(prev => ({ ...prev, [targetUserId]: true }));
    
    try {
      await axios.put(API_ENDPOINTS.UNFOLLOW_USER(targetUserId), {
        userId: user._id
      });
      
      // Actualizar estado local
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });

      // Mostrar mensaje de éxito
      const userName = posts.find(p => getPostUserId(p) === targetUserId);
      const displayName = userName?.userId?.username || userName?.userId?.email || 'usuario';
      console.log(`Dejaste de seguir a ${displayName}`);
      
    } catch (error) {
      console.error("Error al dejar de seguir usuario:", error);
      
      // Manejo de errores específicos
      if (error.response?.status === 400) {
        alert("No sigues a este usuario.");
        // Sincronizar estado local con el servidor
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(targetUserId);
          return newSet;
        });
      } else if (error.response?.status === 404) {
        alert("Usuario no encontrado.");
      } else {
        alert("Error al dejar de seguir usuario. Intenta de nuevo.");
      }
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  // Mostrar/ocultar comentarios
  const toggleComments = async (postId) => {
    if (showCommentsForPost === postId) {
      setShowCommentsForPost(null);
      return;
    }

    setShowCommentsForPost(postId);
    
    // Si no hemos cargado los comentarios para este post, cargarlos
    if (!comments[postId]) {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      try {
        const res = await axios.get(API_ENDPOINTS.GET_COMMENTS(postId));
        setComments(prev => ({ ...prev, [postId]: res.data.comments || [] }));
      } catch (error) {
        alert("Error al cargar comentarios");
        console.error("Error loading comments:", error);
      } finally {
        setLoadingComments(prev => ({ ...prev, [postId]: false }));
      }
    }
  };

  // Agregar comentario
  const handleAddComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text || !user?._id) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    
    try {
      await axios.post(API_ENDPOINTS.COMMENT_POST(postId), {
        userId: user._id,
        text
      });

      // Actualizar comentarios localmente
      const newComment = {
        _id: Date.now().toString(), // ID temporal
        userId: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture
        },
        text,
        createdAt: new Date().toISOString()
      };

      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));

      // Limpiar el campo de texto
      setCommentText(prev => ({ ...prev, [postId]: "" }));

      // Actualizar el contador de comentarios en el post
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { ...post, comments: [...(post.comments || []), newComment] }
          : post
      ));

    } catch (error) {
      alert("Error al agregar comentario");
      console.error("Error adding comment:", error);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <div className="home-container">
      <header className="navbar">
        <div className="logo-area">
          <img src={logo} alt="RhythMe logo" className="logo1" />
        </div>
        
        {/* Barra de búsqueda con funcionalidad */}
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
            {/* Icono de limpiar búsqueda */}
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowSearchResults(false);
                }}
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
            <div className="search-results" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #ddd',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
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
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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
                      
                      {/* Botones de acción para seguir/dejar de seguir */}
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        {searchUser._id === user?._id ? (
                          <span style={{fontSize: '0.8rem', color: '#999', fontStyle: 'italic'}}>Tú</span>
                        ) : followingUsers.has(searchUser._id) ? (
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
        
        <div className="navbar-icons">
          <span className="icon notif">🔔</span>
          {/* Menú de usuario (cerrar sesión) */}
          <span className="icon user" style={{position: 'relative'}}>
            <button className="action-btn" style={{background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer'}} onClick={() => setUserMenuOpen((v) => !v)}>
              👤
            </button>
            {userMenuOpen && (
              <div ref={userMenuRef} style={{position: 'absolute', top: 30, right: 0, background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '0.5rem', minWidth: 120, zIndex: 10}}>
                <button className="action-btn" style={{width: '100%', textAlign: 'left', color: '#e82c0b'}} onClick={handleLogout}>Cerrar sesión</button>
              </div>
            )}
          </span>
        </div>
      </header>
      <section className="stories">
        <div className="story add">+</div>
        {[...Array(16)].map((_, i) => (
          <div className="story" key={i}>STORY</div>
        ))}
      </section>
      <main className="feed">
        {/* Información del feed */}

        {/* Formulario para crear post */}
        <form onSubmit={handleCreatePost} style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          <textarea
            placeholder="¿Qué estás escuchando o pensando?"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            required
            rows={2}
            style={{resize: 'none', borderRadius: 8, padding: 8, border: '1px solid #eee'}}
            disabled={creating}
          />
          <input
            type="text"
            placeholder="URL de imagen (opcional)"
            value={img}
            onChange={e => setImg(e.target.value)}
            disabled={creating}
            style={{borderRadius: 8, padding: 8, border: '1px solid #eee'}}
          />
          <button type="submit" disabled={creating || !desc} style={{borderRadius: 8, padding: 8, background: 'linear-gradient(90deg, #fb7202, #e82c0b)', color: '#fff', border: 'none', cursor: 'pointer'}}>
            {creating ? 'Publicando...' : 'Publicar'}
          </button>
          {createError && <span style={{color: '#ff3333'}}>{createError}</span>}
        </form>
        {loading && <p>Cargando posts...</p>}
        {error && <p style={{ color: "#ff3333" }}>{error}</p>}
        {!loading && !error && posts.length === 0 && <p>No hay posts para mostrar.</p>}
        {!loading && !error && posts.map((post) => (
          <div className="post-card" key={post._id} style={{position: 'relative'}}>
            <div className="post-header">
              <img src={userImg} alt="user" className="avatar" />
              <div className="post-user">
                <strong>{
                  post.userId && typeof post.userId === 'object'
                    ? (post.userId.username || post.userId.email || `ID: ${post.userId._id?.slice(0, 6)}...`)
                    : (post.username || (post.userId ? `ID: ${post.userId.slice(0, 6)}...` : "Usuario"))
                }</strong>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <span className="time">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}</span>
                  {/* Indicador de tipo de post */}
                  {isOwnPost(post) ? (
                    <span style={{
                      background: '#fb7202',
                      color: 'white',
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>
                      Tu post
                    </span>
                  ) : isFollowingUser(post) ? (
                    <span style={{
                      background: '#28a745',
                      color: 'white',
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>
                      Siguiendo
                    </span>
                  ) : (
                    <span style={{
                      background: '#6c757d',
                      color: 'white',
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>
                      No sigues
                    </span>
                  )}
                </div>
              </div>
              
              {/* Botón de seguir/dejar de seguir SOLO para posts de otros usuarios */}
              {!isOwnPost(post) && (
                <div style={{marginLeft: 'auto', marginRight: '3rem'}}>
                  {isFollowingUser(post) ? (
                    <button 
                      className="following-btn"
                      onClick={() => handleUnfollowUser(getPostUserId(post))}
                      disabled={followLoading[getPostUserId(post)]}
                      title="Haz clic para dejar de seguir"
                    >
                      {followLoading[getPostUserId(post)] 
                        ? '...' 
                        : 'Siguiendo'
                      }
                    </button>
                  ) : (
                    <button 
                      className="follow-btn"
                      onClick={() => handleFollowUser(getPostUserId(post))}
                      disabled={followLoading[getPostUserId(post)]}
                      title="Haz clic para seguir"
                    >
                      {followLoading[getPostUserId(post)] 
                        ? '...' 
                        : 'Seguir'
                      }
                    </button>
                  )}
                </div>
              )}

              {/* Menú de tres puntos solo para el autor */}
              {isOwnPost(post) && (
                <div style={{position: 'absolute', top: 10, right: 10, zIndex: 2}}>
                  <button className="action-btn" onClick={() => setOpenMenuId(openMenuId === post._id ? null : post._id)} title="Opciones">⋮</button>
                  {openMenuId === post._id && (
                    <div ref={menuRef} style={{position: 'absolute', top: 30, right: 0, background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '0.5rem', minWidth: 100}}>
                      {/* Eliminar y editar post propio */}
                      <button className="action-btn" style={{width: '100%', textAlign: 'left', color: '#e82c0b'}} onClick={e => { e.stopPropagation(); setOpenMenuId(null); handleDelete(post._id); }}>🗑️ Eliminar</button>
                      <button className="action-btn" style={{width: '100%', textAlign: 'left'}} onClick={e => { e.stopPropagation(); setOpenMenuId(null); startEdit(post); }}>✏️ Editar</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="post-text">{
              editingPostId === post._id ? (
                <form onSubmit={handleEdit} style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                  {/* Formulario de edición inline */}
                  <textarea
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    required
                    rows={2}
                    style={{resize: 'none', borderRadius: 8, padding: 8, border: '1px solid #eee'}}
                    disabled={editLoading}
                  />
                  <input
                    type="text"
                    placeholder="URL de imagen (opcional)"
                    value={editImg}
                    onChange={e => setEditImg(e.target.value)}
                    disabled={editLoading}
                    style={{borderRadius: 8, padding: 8, border: '1px solid #eee'}}
                  />
                  <div style={{display: 'flex', gap: 8}}>
                    <button type="submit" disabled={editLoading || !editDesc} style={{borderRadius: 8, padding: 8, background: 'linear-gradient(90deg, #fb7202, #e82c0b)', color: '#fff', border: 'none', cursor: 'pointer'}}>
                      {editLoading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" onClick={cancelEdit} style={{borderRadius: 8, padding: 8, background: '#eee', color: '#333', border: 'none', cursor: 'pointer'}}>Cancelar</button>
                  </div>
                  {editError && <span style={{color: '#ff3333'}}>{editError}</span>}
                </form>
              ) : post.desc
            }</p>
            {post.img && editingPostId !== post._id && <img src={post.img} alt="album" className="post-image" />}
            {editingPostId === post._id && editImg && (
              <img src={editImg} alt="album" className="post-image" />
            )}
            <div className="post-actions">
              <button className="action-btn" onClick={() => handleLike(post._id)}>
                {post.likes && post.likes.includes(user?._id) ? "💖" : "❤️"} {post.likes?.length || 0}
              </button>
              <button className="action-btn" onClick={() => toggleComments(post._id)}>
                💬 {(comments[post._id] || post.comments || []).length}
              </button>
            </div>

            {/* Sección de comentarios */}
            {showCommentsForPost === post._id && (
              <div className="comments-section">
                {/* Formulario para agregar comentario */}
                <div className="comment-form">
                  <input
                    type="text"
                    placeholder="Escribe un comentario..."
                    value={commentText[post._id] || ""}
                    onChange={(e) => setCommentText(prev => ({
                      ...prev,
                      [post._id]: e.target.value
                    }))}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !submittingComment[post._id]) {
                        handleAddComment(post._id);
                      }
                    }}
                    disabled={submittingComment[post._id]}
                    className="comment-input"
                  />
                  <button
                    onClick={() => handleAddComment(post._id)}
                    disabled={submittingComment[post._id] || !commentText[post._id]?.trim()}
                    className="comment-submit-btn"
                  >
                    {submittingComment[post._id] ? '...' : 'Enviar'}
                  </button>
                </div>

                {/* Lista de comentarios */}
                {loadingComments[post._id] ? (
                  <div className="comments-loading">Cargando comentarios...</div>
                ) : (
                  <div className="comments-list">
                    {(comments[post._id] || []).length === 0 ? (
                      <div className="comments-empty">
                        No hay comentarios aún. ¡Sé el primero en comentar!
                      </div>
                    ) : (
                      (comments[post._id] || []).map((comment, index) => (
                        <div key={comment._id || index} className="comment-item">
                          <img 
                            src={comment.userId?.profilePicture || userImg} 
                            alt="user" 
                            className="comment-avatar"
                          />
                          <div className="comment-content">
                            <div className="comment-header">
                              <span className="comment-author">
                                {comment.userId?.username || comment.userId?.email || 'Usuario'}
                              </span>
                              <span className="comment-time">
                                {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                              </span>
                            </div>
                            <p className="comment-text">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
