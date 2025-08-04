import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { faLink, faUnlink, faMusic, faUser, faListUl } from '@fortawesome/free-solid-svg-icons';
import { API_ENDPOINTS } from '../../config/api.js';
import './SpotifyConnection.css';

/**
 * Componente para manejar la conexión con Spotify en el perfil del usuario
 */
export default function SpotifyConnection({ userId, isCurrentUser = false }) {
    // Debug: log de los props recibidos

    const [spotifyStatus, setSpotifyStatus] = useState({
        isConnected: false,
        spotifyProfile: null
    });
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [userContent, setUserContent] = useState({
        playlists: [],
        topArtists: [],
        topTracks: []
    });
    const [showContent, setShowContent] = useState(false);
    const [activeTab, setActiveTab] = useState('playlists');

    /**
     * Cargar contenido personalizado del usuario de Spotify
     */
    const loadUserContent = useCallback(async () => {
        // Validar userId antes de hacer llamadas
        if (!userId) {
            console.error('loadUserContent: userId is missing');
            return;
        }

        try {
            const [playlistsRes, topArtistsRes, topTracksRes] = await Promise.all([
                axios.get(API_ENDPOINTS.SPOTIFY_USER_PLAYLISTS(userId, 50)).catch(() => ({ data: { success: false, data: [] } })),
                axios.get(API_ENDPOINTS.SPOTIFY_USER_TOP_ARTISTS(userId, 50)).catch(() => ({ data: { success: false, data: [] } })),
                axios.get(API_ENDPOINTS.SPOTIFY_USER_TOP_TRACKS(userId, 50)).catch(() => ({ data: { success: false, data: [] } }))
            ]);

            setUserContent({
                playlists: playlistsRes.data.success ? playlistsRes.data.data : [],
                topArtists: topArtistsRes.data.success ? topArtistsRes.data.data : [],
                topTracks: topTracksRes.data.success ? topTracksRes.data.data : []
            });
        } catch (error) {
            console.error('Error loading user Spotify content:', error);
            // En caso de error completo, asegurar que el contenido esté vacío
            setUserContent({
                playlists: [],
                topArtists: [],
                topTracks: []
            });
        }
    }, [userId]);

    /**
     * Verificar estado de conexión con Spotify
     */
    const checkSpotifyConnection = useCallback(async () => {
        // Validar userId antes de hacer llamadas
        if (!userId) {
            console.error('checkSpotifyConnection: userId is missing');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(API_ENDPOINTS.SPOTIFY_CONNECTION_STATUS(userId));
            
            if (response.data.success) {
                setSpotifyStatus({
                    isConnected: response.data.isConnected,
                    spotifyProfile: response.data.spotifyProfile
                });

                // Si está conectado, cargar contenido del usuario
                if (response.data.isConnected) {
                    await loadUserContent();
                }
            } else {
                // Si la respuesta indica fallo, resetear estado
                setSpotifyStatus({ isConnected: false, spotifyProfile: null });
            }
        } catch (error) {
            console.error('Error checking Spotify connection:', error);
            setSpotifyStatus({ isConnected: false, spotifyProfile: null });
        } finally {
            setLoading(false);
        }
    }, [userId, loadUserContent]);

    useEffect(() => {
        // Solo ejecutar si tenemos userId
        if (!userId) {
            console.log('SpotifyConnection: No userId provided, skipping initialization');
            setLoading(false);
            return;
        }
        
        console.log('SpotifyConnection: Initializing with userId:', userId);
        checkSpotifyConnection();
    }, [checkSpotifyConnection, userId]);

    /**
     * Conectar con Spotify
     */
    const connectSpotify = async () => {
        if (!userId) {
            console.error('connectSpotify: userId is missing');
            return;
        }

        try {
            setConnecting(true);
            
            // Obtener URL de autorización pasando el userId
            const response = await axios.get(`${API_ENDPOINTS.SPOTIFY_AUTH_URL}?userId=${userId}`);
            
            if (response.data.success) {
                // La URL ya incluye el userId en el state
                const authUrl = response.data.authUrl;
                
                // Convertir la URL para usar 127.0.0.1 (requerido por Spotify)
                const spotifyAuthUrl = authUrl.replace('localhost', '127.0.0.1');
                
                // Abrir ventana de autorización
                const popup = window.open(
                    spotifyAuthUrl,
                    'spotify-auth',
                    'width=500,height=600,scrollbars=yes,resizable=yes'
                );

                if (!popup) {
                    console.error('Failed to open popup window');
                    setConnecting(false);
                    return;
                }

                // Escuchar mensajes del popup
                const handleMessage = (event) => {
                    if (event.data.type === 'SPOTIFY_AUTH_SUCCESS') {
                        setConnecting(false);
                        popup.close();
                        checkSpotifyConnection();
                        window.removeEventListener('message', handleMessage);
                    } else if (event.data.type === 'SPOTIFY_AUTH_ERROR') {
                        setConnecting(false);
                        popup.close();
                        console.error('Spotify authorization failed');
                        window.removeEventListener('message', handleMessage);
                    }
                };
                
                window.addEventListener('message', handleMessage);

                // Escuchar el callback (fallback)
                const checkClosed = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(checkClosed);
                        setConnecting(false);
                        window.removeEventListener('message', handleMessage);
                        // Verificar conexión después de cerrar la ventana
                        setTimeout(() => {
                            checkSpotifyConnection();
                        }, 1000);
                    }
                }, 1000);
            } else {
                console.error('Failed to get Spotify auth URL:', response.data);
                setConnecting(false);
            }
        } catch (error) {
            console.error('Error connecting to Spotify:', error);
            setConnecting(false);
        }
    };

    /**
     * Desconectar de Spotify
     */
    const disconnectSpotify = async () => {
        if (!userId) {
            console.error('disconnectSpotify: userId is missing');
            return;
        }

        try {
            const response = await axios.delete(API_ENDPOINTS.SPOTIFY_DISCONNECT(userId));
            
            if (response.data.success) {
                setSpotifyStatus({ isConnected: false, spotifyProfile: null });
                setUserContent({ playlists: [], topArtists: [], topTracks: [] });
                setShowContent(false);
            } else {
                console.error('Failed to disconnect Spotify:', response.data);
            }
        } catch (error) {
            console.error('Error disconnecting Spotify:', error);
        }
    };

    /**
     * Renderizar elementos de contenido
     */
    const renderContentItems = (items, type) => {
        // Validar que items sea un array
        if (!Array.isArray(items)) {
            console.warn('renderContentItems: items is not an array', items);
            return [];
        }

        return items.map((item) => {
            // Validar que el item tenga las propiedades necesarias
            if (!item || !item.spotifyId) {
                console.warn('renderContentItems: invalid item', item);
                return null;
            }

            return (
                <div key={item.spotifyId} className="content-item">
                    <div className="content-image">
                        {item.image ? (
                            <img src={item.image} alt={item.name || 'Spotify content'} />
                        ) : (
                            <div className="placeholder-image">
                                <FontAwesomeIcon icon={type === 'playlists' ? faListUl : type === 'artists' ? faUser : faMusic} />
                            </div>
                        )}
                    </div>
                    <div className="content-info">
                        <div className="content-name" title={item.name || 'Sin nombre'}>{item.name || 'Sin nombre'}</div>
                        {item.artist && <div className="content-artist">{item.artist}</div>}
                    </div>
                </div>
            );
        }).filter(Boolean); // Filtrar items null
    };

    if (loading) {
        return (
            <div className="spotify-connection loading">
                <div className="loading-spinner"></div>
                <span>Verificando conexión con Spotify...</span>
            </div>
        );
    }

    // Validación de userId después de cargar
    if (!userId) {
        return (
            <div className="spotify-connection error">
                <div className="spotify-header">
                    <FontAwesomeIcon icon={faSpotify} className="spotify-icon" />
                    <h3>Spotify</h3>
                </div>
                <div className="error-message">
                    <p>Error: No se pudo cargar la información de Spotify para este usuario.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="spotify-connection">
            <div className="spotify-header">
                <FontAwesomeIcon icon={faSpotify} className="spotify-icon" />
                <h3>Spotify</h3>
                
                {isCurrentUser && (
                    <div className="spotify-actions">
                        {spotifyStatus.isConnected ? (
                            <button 
                                className="disconnect-btn"
                                onClick={disconnectSpotify}
                                title="Desconectar Spotify"
                            >
                                <FontAwesomeIcon icon={faUnlink} />
                                Desconectar
                            </button>
                        ) : (
                            <button 
                                className="connect-btn"
                                onClick={connectSpotify}
                                disabled={connecting}
                                title="Conectar con Spotify"
                            >
                                <FontAwesomeIcon icon={faLink} />
                                {connecting ? 'Conectando...' : 'Conectar'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {spotifyStatus.isConnected ? (
                <div className="spotify-connected">
                    <div className="spotify-profile">
                        <div className="profile-info">
                            <span className="connected-badge">
                                <FontAwesomeIcon icon={faLink} />
                                Conectado como: {spotifyStatus.spotifyProfile?.displayName}
                            </span>
                            <span className="last-connected">
                                Última conexión: {new Date(spotifyStatus.spotifyProfile?.lastConnected).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <button 
                            className="toggle-content-btn"
                            onClick={() => setShowContent(!showContent)}
                        >
                            {showContent ? 'Ocultar contenido' : 'Ver contenido musical'}
                        </button>
                    </div>

                    {showContent && (
                        <div className="spotify-content">
                            <div className="content-tabs">
                                <button 
                                    className={`tab ${activeTab === 'playlists' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('playlists')}
                                >
                                    <FontAwesomeIcon icon={faListUl} />
                                    Playlists ({(userContent.playlists || []).length})
                                </button>
                                <button 
                                    className={`tab ${activeTab === 'artists' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('artists')}
                                >
                                    <FontAwesomeIcon icon={faUser} />
                                    Top Artistas ({(userContent.topArtists || []).length})
                                </button>
                                <button 
                                    className={`tab ${activeTab === 'tracks' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('tracks')}
                                >
                                    <FontAwesomeIcon icon={faMusic} />
                                    Top Canciones ({(userContent.topTracks || []).length})
                                </button>
                            </div>

                            <div className="content-list">
                                {activeTab === 'playlists' && renderContentItems(userContent.playlists || [], 'playlists')}
                                {activeTab === 'artists' && renderContentItems(userContent.topArtists || [], 'artists')}
                                {activeTab === 'tracks' && renderContentItems(userContent.topTracks || [], 'tracks')}
                                
                                {(() => {
                                    const currentContent = activeTab === 'artists' ? 
                                        (userContent.topArtists || []) : 
                                        activeTab === 'tracks' ? 
                                        (userContent.topTracks || []) : 
                                        (userContent.playlists || []);
                                    
                                    return currentContent.length === 0 && (
                                        <div className="no-content">
                                            No hay {activeTab === 'playlists' ? 'playlists' : activeTab === 'artists' ? 'artistas' : 'canciones'} disponibles
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="spotify-disconnected">
                    <div className="disconnected-message">
                        <FontAwesomeIcon icon={faSpotify} className="large-icon" />
                        <p>
                            {isCurrentUser 
                                ? 'Conecta tu cuenta de Spotify para compartir tu música favorita en tus posts'
                                : 'Este usuario no ha conectado su cuenta de Spotify'
                            }
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
