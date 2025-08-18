// src/components/Home/PostCard.jsx
import { useState, useRef, useEffect, useMemo } from "react";
import React, { lazy, Suspense } from 'react';
import ImageModal from "../common/ImageModal.jsx";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencil, faCircleUser } from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2/dist/sweetalert2.all.js';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api.js';
const CommentsSection = lazy(() => import('./CommentsSection'));
const SpotifyContent = lazy(() => import('./SpotifyContent'));
import "./PostCard.css";
const prefetchComments = () => import('./CommentsSection');
//const prefetchSpotify = () => import('./SpotifyContent');

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
function PostCard({
  post,
  user,
  followLoading,
  onLike,
  onDelete,
  onEdit,
  onFollow,
  onUnfollow,
  isFollowing,
  full = false // modo de detalle para mostrar contenido completo
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
  const [showImgModal, setShowImgModal] = useState(false);

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

  //ID del autor del post
  const postUserId = useMemo(() => {
    const uid = post?.userId;
    if (!uid) return null;
    const raw = typeof uid === 'object' ? uid._id : uid;
    return raw ? String(raw) : null;
  }, [post?.userId]);

  // Es el post del usuario actual?
  const isOwn = useMemo(() => {
    return Boolean(user?._id && postUserId && String(postUserId) === String(user._id));
  }, [user?._id, postUserId]);

  // Esta siguiendo al autor del post?
  const isFollowingPostUser = useMemo(() => {
    return postUserId ? isFollowing(String(postUserId)) : false;
  }, [isFollowing, postUserId]);

  // Objeto del autor (cuando viene populado vs Fallback)
  const author = useMemo(() => {
    return typeof post.userId === 'object' ? post.userId : (post.user || null);
  }, [post.userId, post.user]);

  // Resolver avatar
  const authorAvatar = useMemo(() => {
    let avatar = author?.profilePicture || author?.profileImg || null;
    if (!avatar && !author && user?._id && postUserId === user._id) {
      avatar = user.profilePicture || null;
    }
    return avatar;
  }, [author, user?._id, user?.profilePicture, postUserId]);

  // Desplegar autor nombre/email
  const authorName = useMemo(() => {
    return author?.username || author?.email || 'usuario';
  }, [author]);

  // Formato a createdAt
  const createdAtLabel = useMemo(() => {
    return post.createdAt ? new Date(post.createdAt).toLocaleString() : '';
  }, [post.createdAt]);

  // Computar likes
  const isLiked = useMemo(() => {
    return !!user?._id && Array.isArray(post.likes) && post.likes.includes(user._id);
  }, [post.likes, user?._id]);

  // Contador de comentarios (en tiempo real)
  const commentsCount = useMemo(() => {
    if (typeof post.commentsCount === 'number') return post.commentsCount;
    return Array.isArray(post.comments) ? post.comments.length : 0;
  }, [post.commentsCount, post.comments]);

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
    const uid = postUserId;
    if (uid) {
      navigate(`/profile/${uid}`);
    }
  };
  
  
  return (
    <div className="post-card">
      {/* Header del post */}
      <div className="post-header">
        {authorAvatar ? (
          <img
            src={authorAvatar}
            alt={authorName}
            className="avatar avatar-clickable"
            loading="lazy"
            decoding="async"
            onClick={goToProfile}
          />
        ) : (
          <FontAwesomeIcon icon={faCircleUser} className="avatar avatar-clickable" onClick={goToProfile} />
        )}


        <div className="post-user">
          <strong onClick={goToProfile} className="post-user-name">
            {authorName}
          </strong>
          <div className="post-user-row">
            <span className="time">
              {createdAtLabel}
            </span>

            {/* Indicador de tipo de post */}
            {isOwn ? (
              <span className="post-user-status own">
                Tu post
              </span>
            ) : isFollowingPostUser ? (
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
        {!isOwn && (
          <div className="post-follow-wrapper">
            {isFollowingPostUser ? (
              <button
                className="following-btn"
                onClick={() => onUnfollow(postUserId)}
                disabled={followLoading[postUserId]}
                title="Haz clic para dejar de seguir"
              >
                {followLoading[postUserId] ? '...' : 'Siguiendo'}
              </button>
            ) : (
              <button
                className="follow-btn"
                onClick={() => onFollow(postUserId)}
                disabled={followLoading[postUserId]}
                title="Haz clic para seguir"
              >
                {followLoading[postUserId] ? '...' : 'Seguir'}
              </button>
            )}
          </div>
        )}

        {/* Menú de opciones (propios: editar/eliminar, ajenos: reportar) */}
        <div className="post-options-wrapper">
          <button
            className="action-btn-options"
            onClick={() => setOpenMenu(!openMenu)}
            title="Opciones"
          >
            ⋮
          </button>
          {openMenu && (
            <div ref={menuRef} className="post-options-panel">
              {isOwn ? (
                <>
                  <button
                    className="action-btn-options post-options-item"
                    onClick={handleDelete}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Eliminar
                  </button>
                  <button
                    className="action-btn-options post-options-item"
                    onClick={startEdit}
                  >
                    <FontAwesomeIcon icon={faPencil} /> Editar
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="action-btn-options post-options-item"
                    onClick={async () => {
                      setOpenMenu(false);
                      const { value: reason } = await Swal.fire({
                        title: 'Reportar post',
                        input: 'text',
                        inputLabel: 'Motivo breve',
                        inputPlaceholder: 'Spam, abuso, etc.',
                        showCancelButton: true,
                        confirmButtonText: 'Enviar',
                        cancelButtonText: 'Cancelar'
                      });
                      if (!reason) return;
                      try {
                        await axios.post(API_ENDPOINTS.REPORT_USER(postUserId), { userId: user?._id, reason, postId: post._id });
                        Swal.fire('Enviado', 'Reporte registrado', 'success');
                      } catch (e) {
                        if (e?.response?.status === 429) {
                          Swal.fire('Ya enviado', 'Ya reportaste este usuario en las últimas 24h', 'info');
                        } else {
                          Swal.fire('Error', 'No se pudo enviar el reporte', 'error');
                        }
                      }
                    }}
                  >
                    🚩 Reportar
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contenido del post */}
      <div className={`post-content ${full ? 'post-content-full' : ''}`}>
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
            <p className={`post-text ${full ? 'post-text-full' : ''}`}>{post.desc}</p>
            {post.img && (
                <img
                  src={post.img}
                  alt="post content"
                  className={`post-image ${full ? 'post-image-full' : ''} post-image-clickable`}
                  onClick={() => setShowImgModal(true)}
                  title="Ver imagen"
                  loading="lazy"
                  decoding="async"
                />
            )}
            {post.spotifyContent && (
              <Suspense fallback={null}>
                <SpotifyContent spotifyContent={post.spotifyContent} />
              </Suspense>)}
          </>
        )}
      </div>

      {/* Acciones del post */}
      {!isEditing && (
        <div className="post-actions">
          <button className="action-btn-inter" onClick={() => onLike(post._id)}>
            {isLiked ? "🎶" : "🎵"} {post.likes?.length || 0}
          </button>
          <button className="action-btn-inter"
            onMouseEnter={prefetchComments}
            onClick={toggleComments}>
            💬 {commentsCount}
          </button>
        </div>
      )}

      {/* Sección de comentarios */}
      {showComments && !isEditing && (
        <Suspense fallback={null}>
          <CommentsSection postId={post._id} user={user} />
        </Suspense>

      )}
      {showImgModal && (
        <ImageModal src={post.img} alt="Imagen del post" onClose={() => setShowImgModal(false)} />
      )}
    </div>
  );
}
function areEqual(prev, next){
    const currentPost = prev.post, nextPost = next.post;
    if (currentPost._id !== nextPost._id) return false;
    if (currentPost.desc !== nextPost.desc) return false;
    if (currentPost.img !== nextPost.img) return false;
    const plc = typeof currentPost.commentsCount === 'number' ? currentPost.commentsCount : (Array.isArray(currentPost.comments) ? currentPost.comments.length : 0);
    const nlc = typeof nextPost.commentsCount === 'number' ? nextPost.commentsCount : (Array.isArray(nextPost.comments) ? nextPost.comments.length : 0);
    if (plc !== nlc) return false;
    const pl = Array.isArray(currentPost.likes) ? currentPost.likes.length : 0;
    const nl = Array.isArray(nextPost.likes) ? nextPost.likes.length : 0;
    if (pl !== nl)return false;
    if (prev.user?._id !== next.user?._id) return false;
    return true;
  }
export default React.memo(PostCard, areEqual);
