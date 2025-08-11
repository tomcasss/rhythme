// src/components/Home/PostCard.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencil , faCircleUser } from "@fortawesome/free-solid-svg-icons";
import CommentsSection from './CommentsSection';
import SpotifyContent from './SpotifyContent';
import "./PostCard.css";

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
  // Autor del post (cuando viene populado será un objeto en post.userId, si no intentar fallback a post.user)
  const author = typeof post.userId === 'object' ? post.userId : (post.user || null);
  // Resolver avatar: puede venir en author.profilePicture, o si no está poblado intentar coincidir con usuario actual
  let authorAvatar = author?.profilePicture || author?.profileImg || null;
  if (!authorAvatar) {
    // Si el post solo trae un id y corresponde al usuario actual, usar su avatar
    const postUserId = getPostUserId();
    if (!author && user?._id && postUserId === user._id) {
      authorAvatar = user.profilePicture || null;
    }
  }
  const authorName = author?.username || author?.email || 'usuario';

  return (
    <div className="post-card">
      {/* Header del post */}
      <div className="post-header">
        {authorAvatar ? (
          <img
            src={authorAvatar}
            alt={authorName}
            className="avatar avatar-clickable"
            onClick={goToProfile}
          />
        ) : (
          <FontAwesomeIcon icon={faCircleUser} className="avatar avatar-clickable" onClick={goToProfile} />
        )}
 

        <div className="post-user">
          <strong onClick={goToProfile} className="post-user-name">
            {post.userId && typeof post.userId === 'object'
              ? (post.userId.username || post.userId.email || `ID: ${post.userId._id?.slice(0, 6)}...`)
              : (post.username || (post.userId ? `ID: ${post.userId.slice(0, 6)}...` : "Usuario"))
            }
          </strong>
          <div className="post-user-row">
            <span className="time">
              {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
            </span>

            {/* Indicador de tipo de post */}
            {isOwnPost() ? (
              <span className="post-user-status own">
                Tu post
              </span>
            ) : isFollowingUser() ? (
              <span className="post-user-status following">
                Siguiendo
              </span>
            ) : (
              <span className="post-user-status">
                No sigues
              </span>
            )}
          </div>
        </div>

        {/* Botón de seguir/dejar de seguir */}
        {!isOwnPost() && (
          <div className="post-follow-wrapper">
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
          <div className="post-options-wrapper">
            <button
              className="action-btn"
              onClick={() => setOpenMenu(!openMenu)}
              title="Opciones"
            >
              ⋮
            </button>
            {openMenu && (
              <div ref={menuRef} className="post-options-panel">
                <button
                  className="action-btn post-options-item"
                  onClick={handleDelete}
                >
                  <FontAwesomeIcon icon={faTrash} /> Eliminar
                </button>
                <button
                  className="action-btn post-options-item"
                  onClick={startEdit}
                >
                  <FontAwesomeIcon icon={faPencil} /> Editar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contenido del post */}
      <div className="post-content">
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="post-edit-form">
            <textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              required
              rows={2}
              className="post-edit-textarea"
              disabled={editLoading}
            />
            <input
              type="text"
              placeholder="URL de imagen (opcional)"
              value={editImg}
              onChange={e => setEditImg(e.target.value)}
              disabled={editLoading}
              className="post-edit-input"
            />
            <div className="post-edit-actions">
              <button
                type="submit"
                disabled={editLoading || !editDesc}
                className="btn-save"
              >
                {editLoading ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="btn-cancel"
              >
                Cancelar
              </button>
            </div>
            {editError && <span className="edit-error">{editError}</span>}
          </form>
        ) : (
          <>
            <p className="post-text">{post.desc}</p>
            {post.img && <img src={post.img} alt="post content" className="post-image" />}
            {post.spotifyContent && <SpotifyContent spotifyContent={post.spotifyContent} />}
          </>
        )}
      </div>

      {/* Acciones del post */}
      {!isEditing && (
        <div className="post-actions">
          <button className="action-btn" onClick={() => onLike(post._id)}>
            {post.likes && post.likes.includes(user?._id) ? "🎶" : "🎵"} {post.likes?.length || 0}
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
