import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faUser, faListUl, faCompactDisc, faPlay, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import './SpotifyContent.css';

/**
 * Componente para mostrar contenido de Spotify en los posts
 */
export default function SpotifyContent({ spotifyContent, size = 'normal' }) {
    console.log('🎵 SpotifyContent received:', spotifyContent);
    
    if (!spotifyContent) {
        console.log('⚠️ No Spotify content provided');
        return null;
    }

    const { type, name, artist, image, externalUrl, previewUrl, duration } = spotifyContent;

    /**
     * Obtener icono según el tipo de contenido
     */
    const getContentIcon = () => {
        switch (type) {
            case 'track': return faMusic;
            case 'artist': return faUser;
            case 'playlist': return faListUl;
            case 'album': return faCompactDisc;
            default: return faMusic;
        }
    };

    /**
     * Obtener etiqueta del tipo de contenido
     */
    const getTypeLabel = () => {
        switch (type) {
            case 'track': return 'Canción';
            case 'artist': return 'Artista';
            case 'playlist': return 'Playlist';
            case 'album': return 'Álbum';
            default: return 'Música';
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

    /**
     * Abrir en Spotify
     */
    const openInSpotify = (e) => {
        e.stopPropagation(); // Evitar que se propague el evento al post
        window.open(externalUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className={`spotify-content ${size}`}>
            <div className="spotify-header">
                <FontAwesomeIcon 
                    icon={faMusic} 
                    style={{ color: '#1DB954', marginRight: '8px' }} 
                />
                <span className="spotify-label">Spotify • {getTypeLabel()}</span>
            </div>

            <div className="spotify-card">
                <div className="spotify-image">
                    {image ? (
                        <img src={image} alt={name} />
                    ) : (
                        <div className="placeholder-image">
                            <FontAwesomeIcon icon={getContentIcon()} />
                        </div>
                    )}
                    
                    {/* Botón de reproducir si hay preview */}
                    {previewUrl && (
                        <div className="play-overlay">
                            <FontAwesomeIcon icon={faPlay} />
                        </div>
                    )}
                </div>

                <div className="spotify-info">
                    <div className="spotify-name" title={name}>
                        {name}
                    </div>
                    
                    {artist && (
                        <div className="spotify-artist" title={artist}>
                            {artist}
                        </div>
                    )}
                    
                    {duration && type === 'track' && (
                        <div className="spotify-duration">
                            {formatDuration(duration)}
                        </div>
                    )}
                    
                    <button 
                        className="spotify-open-btn"
                        onClick={openInSpotify}
                        title={`Abrir en Spotify`}
                    >
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                        Abrir en Spotify
                    </button>
                </div>
            </div>

            {/* Audio preview (solo para tracks) */}
            {previewUrl && type === 'track' && (
                <div className="spotify-preview">
                    <audio 
                        controls 
                        preload="none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <source src={previewUrl} type="audio/mpeg" />
                        Tu navegador no soporta el elemento de audio.
                    </audio>
                </div>
            )}
        </div>
    );
}
