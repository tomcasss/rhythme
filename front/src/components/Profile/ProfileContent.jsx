
// src/components/Profile/ProfileContent.jsx
import { useState } from 'react';
import axios from 'axios';
import perfil from '../../assets/perfil.png';
import { API_ENDPOINTS } from '../../config/api.js';

/**
 * Componente ProfileContent - Contenido principal del perfil
 * @param {Object} props - Propiedades del componente
 * @param {string} props.userId - ID del usuario del perfil
 */
export default function ProfileContent({ userId }) {
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
    };

    return (
        
            <div className="contenido-musico">
                <div className="profile-buttons-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem',
                    width: '100%'
                }}>


                    <button
                        className={`tarjeta tarjeta-btn ${selectedSection === 'photos' ? 'active' : ''}`}
                        onClick={() => handleCardClick('photos')}
                        style={{
                            minHeight: '150px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem'
                        }}
                    >
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>Fotos</h4>
                        <img src={perfil} alt="Fotos" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                    </button>

                    <button
                        className={`tarjeta tarjeta-btn ${selectedSection === 'posts' ? 'active' : ''}`}
                        onClick={() => handleCardClick('posts')}
                        style={{
                            minHeight: '150px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem'
                        }}
                    >
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>Posts</h4>
                        <img src={perfil} alt="Posts" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                    </button>
                </div>

                {/* Contenido que se muestra debajo de todos los botones */}
                <div className="profile-content-sections" style={{ width: '100%', clear: 'both' }}>
                    {selectedSection === 'posts' && (
                        <div className="posts-section">
                            <h3>Posts del usuario</h3>

                            {postsLoading && (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <p>Cargando posts...</p>
                                </div>
                            )}

                            {postsError && (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#e74c3c' }}>
                                    <p>{postsError}</p>
                                </div>
                            )}

                            {!postsLoading && !postsError && userPosts.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                                    <p>Este usuario no tiene posts aún.</p>
                                </div>
                            )}

                            {!postsLoading && !postsError && userPosts.length > 0 && (
                                <div className="posts-grid">
                                    {userPosts.map(post => (
                                        <div key={post._id} className="post-card" style={{
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            padding: '1rem',
                                            margin: '1rem 0',
                                            backgroundColor: '#fff'
                                        }}>
                                            <div className="post-header" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <strong style={{ color: '#fb7202' }}>
                                                    {post.userId?.username || post.userId?.email || 'Usuario'}
                                                </strong>
                                                <span style={{
                                                    marginLeft: 'auto',
                                                    fontSize: '0.8rem',
                                                    color: '#6c757d'
                                                }}>
                                                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                                                </span>
                                            </div>

                                            {post.desc && (
                                                <p style={{ margin: '0.5rem 0' }}>{post.desc}</p>
                                            )}

                                            {post.img && (
                                                <img
                                                    src={post.img}
                                                    alt="Post content"
                                                    style={{
                                                        width: '100%',
                                                        maxHeight: '400px',
                                                        objectFit: 'cover',
                                                        borderRadius: '4px',
                                                        marginTop: '0.5rem'
                                                    }}
                                                />
                                            )}

                                            <div className="post-stats" style={{
                                                marginTop: '0.5rem',
                                                fontSize: '0.9rem',
                                                color: '#6c757d'
                                            }}>
                                                {post.likes?.length > 0 && (
                                                    <span>❤️ {post.likes.length} likes</span>
                                                )}
                                                {post.comments?.length > 0 && (
                                                    <span style={{ marginLeft: '1rem' }}>
                                                        💬 {post.comments.length} comentarios
                                                    </span>
                                                )}
                                            </div>
                                        </div>
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
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                                <p>Funcionalidad de fotos próximamente...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

    );
}
