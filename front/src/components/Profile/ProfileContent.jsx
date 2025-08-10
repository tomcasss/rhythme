
// src/components/Profile/ProfileContent.jsx
import { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api.js';
import './ProfileContent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard, faImage } from '@fortawesome/free-solid-svg-icons';
import PostCard from '../Home/PostCard';

/**
 * Componente ProfileContent - Contenido principal del perfil
 * @param {Object} props - Propiedades del componente
 * @param {string} props.userId - ID del usuario del perfil
 * @param {Object} props.viewerUser - Usuario que está viendo el perfil (para permisos y acciones)
 * @param {Object} props.followLoading - Estado de carga de follow
 * @param {Function} props.isFollowing - Función para saber si el viewer sigue a otro usuario
 * @param {Function} props.onFollow - Seguir usuario
 * @param {Function} props.onUnfollow - Dejar de seguir usuario
 */
export default function ProfileContent({ userId, viewerUser, followLoading = {}, isFollowing = () => false, onFollow = () => {}, onUnfollow = () => {} }) {
    const [selectedSection, setSelectedSection] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [postsError, setPostsError] = useState("");

    /**
     * Obtener posts del usuario
     */
    const fetchUserPosts = async () => {
        if (!userId) return;

        setPostsLoading(true);
        setPostsError("");

        try {
            const response = await axios.get(API_ENDPOINTS.GET_USER_POSTS(userId));
            setUserPosts(response.data.posts || []);
        } catch (error) {
            console.error("Error al obtener posts del usuario:", error);
            setPostsError("No se pudieron cargar los posts del usuario");
            setUserPosts([]);
        } finally {
            setPostsLoading(false);
        }
    };

    const handleCardClick = (type) => {
        setSelectedSection(type);
        console.log(`Clicked on ${type}`);

        // Si se hace clic en posts, obtener los posts del usuario
        if (type === 'posts') {
            fetchUserPosts();
        }
        if (type === 'photos') {
            fetchUserPosts();
        }
    };

    // Acciones mínimas para PostCard
    const handleLike = async (postId) => {
        try {
            await axios.put(API_ENDPOINTS.LIKE_POST(postId), { userId: viewerUser?._id });
            setUserPosts(prev => prev.map(p => {
                if (p._id !== postId) return p;
                const hasLiked = p.likes?.includes(viewerUser?._id);
                return {
                    ...p,
                    likes: hasLiked ? p.likes.filter(id => id !== viewerUser._id) : [...(p.likes || []), viewerUser._id]
                };
            }));
        } catch (e) {
            console.error('Error al dar like:', e);
        }
    };

    const handleDelete = async (postId) => {
        const target = userPosts.find(p => p._id === postId);
        if (!target) return;
        const isOwner = (viewerUser && (target.userId?._id === viewerUser._id || target.userId === viewerUser._id));
        if (!isOwner) return;
        if (!window.confirm('¿Eliminar este post?')) return;
        try {
            await axios.delete(API_ENDPOINTS.DELETE_POST(postId, viewerUser._id));
            setUserPosts(prev => prev.filter(p => p._id !== postId));
        } catch (e) {
            console.error('Error al eliminar post:', e);
        }
    };

    const handleEdit = async (postId, data) => {
        try {
            await axios.put(API_ENDPOINTS.UPDATE_POST(postId), { ...data, userId: viewerUser?._id });
            setUserPosts(prev => prev.map(p => p._id === postId ? { ...p, ...data } : p));
        } catch (e) {
            console.error('Error al editar post:', e);
        }
    };

    return (

        <div className="contenido-musico">
            <div className="profile-buttons-grid">
                <button
                    className={`tarjeta tarjeta-btn ${selectedSection === 'photos' ? 'active' : ''}`}
                    onClick={() => handleCardClick('photos')}
                >
                    <div className="tarjeta-btn-content">
                        <h4 className="profile-card-title">Fotos</h4>
                        <FontAwesomeIcon icon={faImage} className="profile-card-icon" />
                    </div>
                </button>

                <button
                    className={`tarjeta tarjeta-btn ${selectedSection === 'posts' ? 'active' : ''}`}
                    onClick={() => handleCardClick('posts')}
                >
                    <div className="tarjeta-btn-content">
                        <h4 className="profile-card-title">Posts</h4>
                        <FontAwesomeIcon icon={faClipboard} className="profile-card-icon" />
                    </div>
                </button>
            </div>

            {/* Contenido que se muestra debajo de todos los botones */}
            <div className="profile-content-sections" style={{ width: '100%', clear: 'both' }}>
                {selectedSection === 'posts' && (
                    <div className="posts-section">
                        <h3>Posts del usuario</h3>

                        {postsLoading && (
                            <div className="posts-section-loading">
                                <p>Cargando posts...</p>
                            </div>
                        )}

                        {postsError && (
                            <div className="posts-section-error">
                                <p>{postsError}</p>
                            </div>
                        )}

                        {!postsLoading && !postsError && userPosts.length === 0 && (
                            <div className="posts-section-empty">
                                <p>Este usuario no tiene posts aún.</p>
                            </div>
                        )}

                        {!postsLoading && !postsError && userPosts.length > 0 && (
                            <div className="posts-grid posts-grid-wrapper">
                                {userPosts.map(post => (
                                    <PostCard
                                        key={post._id}
                                        post={post}
                                        user={viewerUser}
                                        followLoading={followLoading}
                                        onLike={handleLike}
                                        onDelete={handleDelete}
                                        onEdit={handleEdit}
                                        onFollow={onFollow}
                                        onUnfollow={onUnfollow}
                                        isFollowing={isFollowing}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Placeholder para otras secciones */}
                {selectedSection === 'albums' && (
                    <div className="albums-section">
                        <h3>Albums del usuario</h3>
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                            <p>Funcionalidad de albums próximamente...</p>
                        </div>
                    </div>
                )}

                {selectedSection === 'playlists' && (
                    <div className="playlists-section">
                        <h3>Playlists del usuario</h3>
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                            <p>Funcionalidad de playlists próximamente...</p>
                        </div>
                    </div>
                )}

                {selectedSection === 'photos' && (
                    <div className="photos-section">
                        <h3>Fotos del usuario</h3>
                        {!postsLoading && !postsError && (
                            <div className="photos-grid">
                                {userPosts.filter(p => !!p.img).length === 0 && (
                                    <div className="posts-section-empty">
                                        <p>Este usuario no ha subido fotos aún.</p>
                                    </div>
                                )}
                                {userPosts.filter(p => !!p.img).map(p => (
                                    <div key={p._id} className="photo-item">
                                        <img src={p.img} alt="Foto" className="photo-img" />
                                    </div>
                                ))}
                            </div>
                        )}
                        {postsLoading && (
                            <div className="posts-section-loading">
                                <p>Cargando fotos...</p>
                            </div>
                        )}
                        {postsError && (
                            <div className="posts-section-error">
                                <p>{postsError}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

    );
}
