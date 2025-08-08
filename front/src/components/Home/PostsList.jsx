// src/components/Home/PostsList.jsx
import PostCard from './PostCard';
import './PostsList.css';

/**
 * Componente PostsList - Lista de posts del timeline
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.posts - Lista de posts
 * @param {boolean} props.loading - Estado de carga
 * @param {string} props.error - Mensaje de error
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
export default function PostsList({ 
  posts, 
  loading, 
  error, 
  user, 
  followingUsers, 
  followLoading, 
  onLike, 
  onDelete, 
  onEdit, 
  onFollow, 
  onUnfollow,
  isFollowing
}) {
  // Estados de carga y error
  if (loading) return <p className="posts-loading">Cargando posts...</p>;
  if (error) return <p className="posts-error">{error}</p>;
  if (posts.length === 0) return <p className="posts-empty">No hay posts para mostrar.</p>;

  return (
    <>
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          user={user}
          followingUsers={followingUsers}
          followLoading={followLoading}
          onLike={onLike}
          onDelete={onDelete}
          onEdit={onEdit}
          onFollow={onFollow}
          onUnfollow={onUnfollow}
          isFollowing={isFollowing}
        />
      ))}
    </>
  );
}
