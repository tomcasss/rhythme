// src/components/Home/PostCard.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userImg from '../../assets/user.png';
import CommentsSection from './CommentsSection';

/**
 * Componente PostCard - Tarjeta individual de post
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.post - Datos del post
 * @param {Object} props.user - Usuario actual
 * @param {Set} props.followingUsers - Set de usuarios seguidos
 * @param {Object} props.followLoading - Estado de carga de seguimiento
 * @param {Function} props.onLike - Función para dar/quitar like
 * @param {Function} props.onDelete - Función para eliminar post
 * @param {Function} props.onEdit - Función para editar post
 * @param {Function} props.onFollow - Función para seguir usuario
 * @param {Function} props.onUnfollow - Función para dejar de seguir usuario
 * @param {Function} props.isFollowing - Función para verificar si sigue a un usuario
 */
export default function PostCard({ 
  post, 
  user, 
  followLoading, 
  onLike, 
  onDelete, 
  onEdit, 
  onFollow, 
  onUnfollow,
  isFollowing 
}) {
  const navigate = useNavigate();
  
  // Estados para menú de opciones
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef();

  // Estados para edición
  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(post.desc);
  const [editImg, setEditImg] = useState(post.img);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Estados para comentarios
  const [showComments, setShowComments] = useState(false);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Obtener ID del usuario del post
   */
  const getPostUserId = () => {
    if (!post.userId) return null;
    return typeof post.userId === 'object' ? post.userId._id : post.userId;
  };

  /**
   * Verificar si es post propio
   */
  const isOwnPost = () => {
    if (!user || !user._id || !post.userId) return false;
    const postUserId = getPostUserId();
    return postUserId === user._id;
  };

  /**
   * Verificar si sigue al usuario del post
   */
  const isFollowingUser = () => {
    const postUserId = getPostUserId();
    return postUserId ? isFollowing(postUserId) : false;
  };

  /**
   * Iniciar edición del post
   */
  const startEdit = () => {
    setIsEditing(true);
    setEditDesc(post.desc);
    setEditImg(post.img);
    setEditError("");
    setOpenMenu(false);
  };

  /**
   * Cancelar edición
   */
  const cancelEdit = () => {
    setIsEditing(false);
    setEditDesc(post.desc);
    setEditImg(post.img);
    setEditError("");
  };

  /**
   * Guardar edición del post
   */
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");

    try {
      await onEdit(post._id, { desc: editDesc, img: editImg });
      setIsEditing(false);
    } catch {
      setEditError("Error al editar el post. Intenta de nuevo.");
    } finally {
      setEditLoading(false);
    }
  };

  /**
   * Manejar eliminación del post
   */
  const handleDelete = () => {
    setOpenMenu(false);
    if (window.confirm("¿Seguro que quieres eliminar este post?")) {
      onDelete(post._id);
    }
  };

  /**
   * Alternar comentarios
   */
  const toggleComments = () => {
    setShowComments(!showComments);
  };

  /**
   * Navegar al perfil del usuario del post
   */
  const goToProfile = () => {
    const postUserId = getPostUserId();
    if (postUserId) {
      navigate(`/profile/${postUserId}`);
    }
  };

  return (
    <div className="post-card" style={{position: 'relative'}}>
      {/* Header del post */}
      <div className="post-header">
        <img 
          src={userImg} 
          alt="user" 
          className="avatar" 
          onClick={goToProfile}
          style={{ cursor: 'pointer' }}
        />
        <div className="post-user">
          <strong 
            onClick={goToProfile}
            style={{ cursor: 'pointer', color: '#fb7202' }}
          >
            {post.userId && typeof post.userId === 'object'
              ? (post.userId.username || post.userId.email || `ID: ${post.userId._id?.slice(0, 6)}...`)
              : (post.username || (post.userId ? `ID: ${post.userId.slice(0, 6)}...` : "Usuario"))
            }
          </strong>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <span className="time">
              {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
            </span>
            
            {/* Indicador de tipo de post */}
            {isOwnPost() ? (
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
            ) : isFollowingUser() ? (
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
        
        {/* Botón de seguir/dejar de seguir */}
        {!isOwnPost() && (
          <div style={{marginLeft: 'auto', marginRight: '3rem'}}>
            {isFollowingUser() ? (
              <button 
                className="following-btn"
                onClick={() => onUnfollow(getPostUserId())}
                disabled={followLoading[getPostUserId()]}
                title="Haz clic para dejar de seguir"
              >
                {followLoading[getPostUserId()] ? '...' : 'Siguiendo'}
              </button>
            ) : (
              <button 
                className="follow-btn"
                onClick={() => onFollow(getPostUserId())}
                disabled={followLoading[getPostUserId()]}
                title="Haz clic para seguir"
              >
                {followLoading[getPostUserId()] ? '...' : 'Seguir'}
              </button>
            )}
          </div>
        )}

        {/* Menú de opciones para posts propios */}
        {isOwnPost() && (
          <div style={{position: 'absolute', top: 10, right: 10, zIndex: 2}}>
            <button 
              className="action-btn" 
              onClick={() => setOpenMenu(!openMenu)} 
              title="Opciones"
            >
              ⋮
            </button>
            {openMenu && (
              <div 
                ref={menuRef} 
                style={{
                  position: 'absolute', 
                  top: 30, 
                  right: 0, 
                  background: '#fff', 
                  border: '1px solid #eee', 
                  borderRadius: 8, 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
                  padding: '0.5rem', 
                  minWidth: 100
                }}
              >
                <button 
                  className="action-btn" 
                  style={{width: '100%', textAlign: 'left', color: '#e82c0b'}} 
                  onClick={handleDelete}
                >
                  🗑️ Eliminar
                </button>
                <button 
                  className="action-btn" 
                  style={{width: '100%', textAlign: 'left'}} 
                  onClick={startEdit}
                >
                  ✏️ Editar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contenido del post */}
      <div className="post-content">
        {isEditing ? (
          <form onSubmit={handleEditSubmit} style={{display: 'flex', flexDirection: 'column', gap: 8}}>
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
              <button 
                type="submit" 
                disabled={editLoading || !editDesc} 
                style={{
                  borderRadius: 8, 
                  padding: 8, 
                  background: 'linear-gradient(90deg, #fb7202, #e82c0b)', 
                  color: '#fff', 
                  border: 'none', 
                  cursor: 'pointer'
                }}
              >
                {editLoading ? 'Guardando...' : 'Guardar'}
              </button>
              <button 
                type="button" 
                onClick={cancelEdit} 
                style={{
                  borderRadius: 8, 
                  padding: 8, 
                  background: '#eee', 
                  color: '#333', 
                  border: 'none', 
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
            {editError && <span style={{color: '#ff3333'}}>{editError}</span>}
          </form>
        ) : (
          <>
            <p className="post-text">{post.desc}</p>
            {post.img && <img src={post.img} alt="post content" className="post-image" />}
          </>
        )}
      </div>

      {/* Acciones del post */}
      {!isEditing && (
        <div className="post-actions">
          <button className="action-btn" onClick={() => onLike(post._id)}>
            {post.likes && post.likes.includes(user?._id) ? "💖" : "❤️"} {post.likes?.length || 0}
          </button>
          <button className="action-btn" onClick={toggleComments}>
            💬 {post.comments?.length || 0}
          </button>
        </div>
      )}

      {/* Sección de comentarios */}
      {showComments && !isEditing && (
        <CommentsSection postId={post._id} user={user} />
      )}
    </div>
  );
}
