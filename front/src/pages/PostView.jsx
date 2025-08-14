import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.js';
//import ProfileHeader from "../components/Profile/ProfileHeader";

export default function PostView() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(API_ENDPOINTS.GET_POST(postId));
                setPost(res.data.post);
            } catch (err) {
                console.error("Error al cargar el post:", err);
                setError("Error al cargar el post.");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    if (loading) {
        return (
            <div className="contenedor">
                <ProfileHeader />
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Cargando post...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="contenedor">
                <ProfileHeader />
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'red' }}>{error}</p>
                    <button 
                        onClick={() => navigate('/home')} 
                        style={{
                            padding: '0.6rem 1.2rem',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: '#fb7202',
                            color: '#fff',
                            cursor: 'pointer',
                            marginTop: '1rem'
                        }}
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="contenedor">
                <ProfileHeader />
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Post no encontrado.</p>
                    <button 
                        onClick={() => navigate('/home')} 
                        style={{
                            padding: '0.6rem 1.2rem',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: '#fb7202',
                            color: '#fff',
                            cursor: 'pointer'
                        }}
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="contenedor">
            <ProfileHeader />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
                <div 
                    className="post-card"
                    style={{
                        width: '100%',
                        maxWidth: '800px',
                        border: '1px solid #ddd',
                        borderRadius: '10px',
                        padding: '1.5rem',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                        marginBottom: '1.5rem'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                        <strong style={{ color: '#fb7202', fontSize: '1.1rem' }}>
                            {post.userId?.username || post.userId?.email || 'Usuario'}
                        </strong>
                        <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    {post.desc && (
                        <p style={{ fontSize: '1rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                            {post.desc}
                        </p>
                    )}

                    {post.img && (
                        <img
                            src={post.img}
                            alt="Contenido del post"
                            style={{
                                width: '100%',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                objectFit: 'cover'
                            }}
                        />
                    )}

                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        fontSize: '0.95rem',
                        color: '#6c757d'
                    }}>
                        {post.likes?.length > 0 && <span>❤️ {post.likes.length} likes</span>}
                        {post.comments?.length > 0 && <span>💬 {post.comments.length} comentarios</span>}
                    </div>
                </div>
                <button
                    onClick={() => navigate('/home')}
                    style={{
                        padding: '0.6rem 1.2rem',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: '#fb7202',
                        color: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    Volver al inicio
                </button>
            </div>
        </div>
    );
}
