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
    fetchPosts();
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
        <input
          type="text"
          placeholder="Busca música, artistas, playlist..."
          className="search-bar"
        />
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
                <span className="time">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}</span>
              </div>
              {/* Menú de tres puntos solo para el autor */}
              {post.userId && ((typeof post.userId === 'object' && post.userId._id === user._id) || post.userId === user._id) && (
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
