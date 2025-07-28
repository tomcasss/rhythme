import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMusic, faUser, faListUl, faCompactDisc, faPlay, faTimes} from '@fortawesome/free-solid-svg-icons';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { API_ENDPOINTS } from '../../config/api.js';
import './SpotifySearch.css';

/**
 * Componente para buscar contenido de Spotify
 */
export default function SpotifySearch({ onSelectContent, isOpen, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({
        tracks: [],
        artists: [],
        playlists: [],
        albums: []
    });
    const [userContent, setUserContent] = useState({
        playlists: [],
        savedTracks: [],
        topArtists: [],
        topTracks: []
    });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('search');
    const [searchTab, setSearchTab] = useState('tracks');
    const [userTab, setUserTab] = useState('playlists');
    const [error, setError] = useState('');
    const [spotifyConnected, setSpotifyConnected] = useState(false);
    // const [currentUser, setCurrentUser] = useState(null);

    /**
     * Cargar contenido de Spotify del usuario
     */
    const loadUserSpotifyContent = useCallback(async (userId) => {
        try {
            const [playlistsRes, savedTracksRes, topArtistsRes, topTracksRes] = await Promise.all([
                axios.get(API_ENDPOINTS.SPOTIFY_USER_PLAYLISTS(userId, 20)),
                axios.get(API_ENDPOINTS.SPOTIFY_USER_SAVED_TRACKS(userId, 20)),
                axios.get(API_ENDPOINTS.SPOTIFY_USER_TOP_ARTISTS(userId, 20)),
                axios.get(API_ENDPOINTS.SPOTIFY_USER_TOP_TRACKS(userId, 20))
            ]);

            // Filtrar elementos null/undefined del contenido de usuario
            const safeUserContent = {
                playlists: (playlistsRes.data.success ? playlistsRes.data.data : []).filter(item => item !== null && item !== undefined),
                savedTracks: (savedTracksRes.data.success ? savedTracksRes.data.data : []).filter(item => item !== null && item !== undefined),
                topArtists: (topArtistsRes.data.success ? topArtistsRes.data.data : []).filter(item => item !== null && item !== undefined),
                topTracks: (topTracksRes.data.success ? topTracksRes.data.data : []).filter(item => item !== null && item !== undefined)
            };

            setUserContent(safeUserContent);
        } catch (error) {
            console.error('Error loading user Spotify content:', error);
        }
    }, []);

    /**
     * Verificar si el usuario tiene Spotify conectado y cargar su contenido
     */
    const checkSpotifyConnection = useCallback(async (userId) => {
        try {
            const response = await axios.get(API_ENDPOINTS.SPOTIFY_CONNECTION_STATUS(userId));
            
            if (response.data.success && response.data.isConnected) {
                setSpotifyConnected(true);
                await loadUserSpotifyContent(userId);
            } else {
                setSpotifyConnected(false);
            }
        } catch (error) {
            console.error('Error checking Spotify connection:', error);
            setSpotifyConnected(false);
        }
    }, [loadUserSpotifyContent]);

    // Obtener usuario actual al abrir el modal
    useEffect(() => {
        if (isOpen) {
            const userData = JSON.parse(localStorage.getItem("user"));
            if (userData) {
                // setCurrentUser(userData);
                checkSpotifyConnection(userData._id);
            }
        }
    }, [isOpen, checkSpotifyConnection]);

    // Función para realizar búsqueda en Spotify
    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError('');

        try {
            console.log('🔍 Starting Spotify search from frontend...', {
                query: searchQuery,
                url: API_ENDPOINTS.SPOTIFY_SEARCH(searchQuery)
            });

            const response = await axios.get(API_ENDPOINTS.SPOTIFY_SEARCH(searchQuery));
            
            console.log('📡 Spotify search response:', {
                status: response.status,
                success: response.data.success,
                dataKeys: Object.keys(response.data),
                hasData: !!response.data.data
            });

            if (response.data.success) {
                console.log('✅ Search successful, setting results:', {
                    tracks: response.data.data.tracks?.length || 0,
                    artists: response.data.data.artists?.length || 0,
                    playlists: response.data.data.playlists?.length || 0,
                    albums: response.data.data.albums?.length || 0
                });
                
                console.log('🔍 Raw response data:', response.data.data);
                
                // Asegurar que todos los arrays existan y filtrar elementos null
                const safeResults = {
                    tracks: (response.data.data.tracks || []).filter(item => item !== null && item !== undefined),
                    artists: (response.data.data.artists || []).filter(item => item !== null && item !== undefined),
                    playlists: (response.data.data.playlists || []).filter(item => item !== null && item !== undefined),
                    albums: (response.data.data.albums || []).filter(item => item !== null && item !== undefined)
                };
                
                console.log('🔍 Safe results after filtering:', safeResults);
                console.log('🔍 Setting searchResults state...');
                
                setSearchResults(safeResults);
                
                // Verificar que el estado se estableció correctamente
                setTimeout(() => {
                    console.log('🔍 Current searchResults state:', safeResults);
                    console.log('🔍 Current searchTab:', searchTab);
                    console.log('🔍 Current tab data:', safeResults[searchTab] || 'undefined');
                }, 100);
            } else {
                console.warn('⚠️ Search response not successful:', response.data);
                setError('Error al buscar contenido de Spotify');
            }
        } catch (error) {
            console.error('❌ Error searching Spotify:', error);
            console.error('🔍 Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            
            // Mensaje de error más específico
            let errorMessage = 'Error al conectar con Spotify. Verifica tu configuración.';
            
            if (!error.response) {
                errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté funcionando.';
            } else if (error.response?.status === 401) {
                errorMessage = 'Error de autenticación con Spotify. Verifica las credenciales.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Error interno del servidor. Revisa los logs del backend.';
            } else if (error.response?.data?.error) {
                errorMessage = `Error: ${error.response.data.error}`;
            } else if (error.response?.data?.details) {
                errorMessage = `Error: ${error.response.data.details}`;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, searchTab]);

    // Debounce para la búsqueda
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults({ tracks: [], artists: [], playlists: [], albums: [] });
            return;
        }

        const delayedSearch = setTimeout(() => {
            handleSearch();
        }, 500);

        return () => clearTimeout(delayedSearch);
    }, [searchQuery, handleSearch]);

    /**
     * Seleccionar contenido para agregar al post
     */
    const handleSelectContent = (content) => {
        onSelectContent(content);
        setSearchQuery('');
        setSearchResults({ tracks: [], artists: [], playlists: [], albums: [] });
        onClose();
    };

    /**
     * Obtener icono según el tipo de contenido
     */
    const getContentIcon = (type) => {
        switch (type) {
            case 'track': return faMusic;
            case 'artist': return faUser;
            case 'playlist': return faListUl;
            case 'album': return faCompactDisc;
            default: return faMusic;
        }
    };

    /**
     * Formatear duración de milisegundos a mm:ss
     */
    const formatDuration = (ms) => {
        if (!ms) return '';
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="spotify-search-overlay">
            <div className="spotify-search-modal">
                <div className="spotify-search-header">
                    <h3>
                        <FontAwesomeIcon icon={faSpotify} style={{ marginRight: '10px', color: '#1DB954' }} />
                        Buscar en Spotify
                    </h3>
                    <button className="close-btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="spotify-search-input">
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar canciones, artistas, playlists o álbumes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="loading-message">
                        Buscando...
                    </div>
                )}

                {/* Tabs principales */}
                <div className="main-tabs">
                    <button 
                        className={`main-tab ${activeTab === 'search' ? 'active' : ''}`}
                        onClick={() => setActiveTab('search')}
                    >
                        Buscar
                    </button>
                    {spotifyConnected && (
                        <button 
                            className={`main-tab ${activeTab === 'user' ? 'active' : ''}`}
                            onClick={() => setActiveTab('user')}
                        >
                            Mi música
                        </button>
                    )}
                </div>

                {/* Contenido según tab activo */}
                {activeTab === 'search' ? (
                    <>
                        {console.log('🔍 Rendering search tab. Current state:', {
                            activeTab,
                            searchTab,
                            searchResultsKeys: Object.keys(searchResults),
                            currentTabLength: searchResults[searchTab]?.length || 0,
                            searchQuery: searchQuery.trim()
                        })}
                        
                        {/* Tabs para diferentes tipos de contenido */}
                        <div className="search-tabs">
                            <button 
                                className={`tab ${searchTab === 'tracks' ? 'active' : ''}`}
                                onClick={() => setSearchTab('tracks')}
                            >
                                Canciones ({searchResults.tracks?.length || 0})
                            </button>
                            <button 
                                className={`tab ${searchTab === 'artists' ? 'active' : ''}`}
                                onClick={() => setSearchTab('artists')}
                            >
                                Artistas ({searchResults.artists?.length || 0})
                            </button>
                            <button 
                                className={`tab ${searchTab === 'playlists' ? 'active' : ''}`}
                                onClick={() => setSearchTab('playlists')}
                            >
                                Playlists ({searchResults.playlists?.length || 0})
                            </button>
                            <button 
                                className={`tab ${searchTab === 'albums' ? 'active' : ''}`}
                                onClick={() => setSearchTab('albums')}
                            >
                                Álbumes ({searchResults.albums?.length || 0})
                            </button>
                        </div>

                        {/* Resultados de búsqueda */}
                        <div 
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                maxHeight: '400px',
                                padding: '0'
                            }}
                        >
                            {(searchResults[searchTab] || []).map((item, index) => (
                                <div 
                                    key={item.spotifyId || item.id || index}
                                    onClick={() => handleSelectContent(item)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '12px 20px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f0f0f0',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        marginRight: '12px',
                                        backgroundColor: '#f0f0f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {item?.image ? (
                                            <img 
                                                src={item.image} 
                                                alt={item.name || 'Spotify content'} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <FontAwesomeIcon icon={getContentIcon(item?.type)} color="#666" />
                                        )}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: '500',
                                            color: '#333',
                                            marginBottom: '4px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {item?.name || 'Unknown'}
                                        </div>
                                        {item?.artist && (
                                            <div style={{
                                                fontSize: '0.9rem',
                                                color: '#666',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {item.artist}
                                            </div>
                                        )}
                                        {item?.duration && (
                                            <div style={{
                                                fontSize: '0.8rem',
                                                color: '#999',
                                                marginTop: '2px'
                                            }}>
                                                {formatDuration(item.duration)}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginLeft: '12px'
                                    }}>
                                        <FontAwesomeIcon 
                                            icon={getContentIcon(item?.type)} 
                                            style={{ color: '#1DB954', fontSize: '0.9rem' }}
                                        />
                                        {item?.previewUrl && (
                                            <FontAwesomeIcon 
                                                icon={faPlay} 
                                                style={{ color: '#666', fontSize: '0.8rem' }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}

                            {searchQuery.trim() && !loading && (searchResults[searchTab]?.length || 0) === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: '#666',
                                    fontSize: '0.9rem'
                                }}>
                                    No se encontraron resultados para "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Tabs para contenido del usuario */}
                        <div className="search-tabs">
                            <button 
                                className={`tab ${userTab === 'playlists' ? 'active' : ''}`}
                                onClick={() => setUserTab('playlists')}
                            >
                                Mis Playlists ({userContent.playlists.length})
                            </button>
                            <button 
                                className={`tab ${userTab === 'savedTracks' ? 'active' : ''}`}
                                onClick={() => setUserTab('savedTracks')}
                            >
                                Guardadas ({userContent.savedTracks.length})
                            </button>
                            <button 
                                className={`tab ${userTab === 'topArtists' ? 'active' : ''}`}
                                onClick={() => setUserTab('topArtists')}
                            >
                                Top Artistas ({userContent.topArtists.length})
                            </button>
                            <button 
                                className={`tab ${userTab === 'topTracks' ? 'active' : ''}`}
                                onClick={() => setUserTab('topTracks')}
                            >
                                Top Canciones ({userContent.topTracks.length})
                            </button>
                        </div>

                        {/* Contenido del usuario */}
                        <div className="search-results">
                            {userContent[userTab].filter(item => item !== null && item !== undefined && item.spotifyId).map((item) => (
                                <div 
                                    key={item.spotifyId} 
                                    className="search-result-item"
                                    onClick={() => handleSelectContent(item)}
                                >
                                    <div className="result-image">
                                        {item?.image ? (
                                            <img src={item.image} alt={item.name || 'Spotify content'} />
                                        ) : (
                                            <div className="placeholder-image">
                                                <FontAwesomeIcon icon={getContentIcon(item?.type)} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="result-info">
                                        <div className="result-name">{item?.name || 'Unknown'}</div>
                                        {item?.artist && (
                                            <div className="result-artist">{item.artist}</div>
                                        )}
                                        {item.duration && (
                                            <div className="result-duration">
                                                {formatDuration(item.duration)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="result-type">
                                        <FontAwesomeIcon icon={getContentIcon(item.type)} />
                                    </div>

                                    {item.previewUrl && (
                                        <div className="result-preview">
                                            <FontAwesomeIcon icon={faPlay} />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {userContent[userTab].length === 0 && (
                                <div className="no-results">
                                    No tienes {
                                        userTab === 'playlists' ? 'playlists' : 
                                        userTab === 'savedTracks' ? 'canciones guardadas' :
                                        userTab === 'topArtists' ? 'artistas top' : 'canciones top'
                                    } disponibles
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
