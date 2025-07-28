import axios from 'axios';
import querystring from 'querystring';

/**
 * Servicio para manejar la integración con Spotify API
 */

// Configuración de Spotify (se debe configurar en variables de entorno)
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
// Spotify requiere 127.0.0.1 específicamente para redirect URIs
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/callback/spotify';

// Debug: Mostrar variables de entorno cargadas
console.log('🔍 Environment variables check:');
console.log('SPOTIFY_CLIENT_ID exists:', !!process.env.SPOTIFY_CLIENT_ID);
console.log('SPOTIFY_CLIENT_SECRET exists:', !!process.env.SPOTIFY_CLIENT_SECRET);
console.log('SPOTIFY_REDIRECT_URI:', process.env.SPOTIFY_REDIRECT_URI);

// Verificar que las credenciales estén configuradas al iniciar
if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error('❌ Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env file');
    console.error('💡 Current values:', {
        SPOTIFY_CLIENT_ID: SPOTIFY_CLIENT_ID ? 'SET' : 'MISSING',
        SPOTIFY_CLIENT_SECRET: SPOTIFY_CLIENT_SECRET ? 'SET' : 'MISSING'
    });
} else {
    console.log('✅ Spotify credentials configured successfully');
}

// URLs de la API de Spotify
const SPOTIFY_ACCOUNTS_BASE_URL = 'https://accounts.spotify.com';
const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

/**
 * Obtener token de acceso usando Client Credentials Flow
 * Este método permite buscar contenido público sin autenticación de usuario
 */
export const getSpotifyAccessToken = async () => {
    try {
        console.log('🔐 Requesting Spotify access token with Client Credentials Flow...');
        console.log('📋 Request details:', {
            url: `${SPOTIFY_ACCOUNTS_BASE_URL}/api/token`,
            grant_type: 'client_credentials',
            client_id: SPOTIFY_CLIENT_ID ? 'SET' : 'MISSING',
            client_secret: SPOTIFY_CLIENT_SECRET ? 'SET' : 'MISSING'
        });

        const response = await axios({
            method: 'post',
            url: `${SPOTIFY_ACCOUNTS_BASE_URL}/api/token`,
            data: querystring.stringify({
                grant_type: 'client_credentials'
            }),
            headers: {
                'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('✅ Successfully obtained Spotify access token');
        console.log('📋 Token details:', {
            access_token: response.data.access_token ? 'RECEIVED' : 'MISSING',
            token_type: response.data.token_type,
            expires_in: response.data.expires_in
        });

        return response.data.access_token;
    } catch (error) {
        console.error('❌ Error obtaining Spotify access token:', error.response?.data || error.message);
        console.error('🔍 Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        throw new Error('Failed to obtain Spotify access token');
    }
};

/**
 * Generar URL de autorización para que el usuario se conecte con Spotify
 */
export const getSpotifyAuthUrl = (userId = null) => {
    // Validar que las credenciales estén configuradas
    if (!SPOTIFY_CLIENT_ID) {
        console.error('❌ SPOTIFY_CLIENT_ID is not configured');
        throw new Error('SPOTIFY_CLIENT_ID is not configured');
    }

    const scopes = [
        'user-read-private',
        'user-read-email', 
        'playlist-read-private',
        'playlist-read-collaborative',
        'user-library-read',
        'user-top-read'
    ].join(' ');

    // Usar userId como state si se proporciona, sino generar uno aleatorio
    const state = userId || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: scopes,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        state: state
    });

    const authUrl = `${SPOTIFY_ACCOUNTS_BASE_URL}/authorize?${params.toString()}`;
    
    console.log('🎵 Generated Spotify Auth URL successfully');
    console.log('🔗 Auth URL:', authUrl);
    console.log('📋 Params:', {
        client_id: SPOTIFY_CLIENT_ID,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        scope: scopes,
        state: state
    });
    
    return authUrl;
};

/**
 * Intercambiar código de autorización por tokens de acceso
 */
export const exchangeCodeForTokens = async (code) => {
    try {
        console.log('🔄 Exchanging Spotify authorization code for tokens...');
        console.log('📋 Exchange params:', {
            grant_type: 'authorization_code',
            code: code.substring(0, 10) + '...', // Solo mostrar inicio del código por seguridad
            redirect_uri: SPOTIFY_REDIRECT_URI
        });

        const response = await axios({
            method: 'post',
            url: `${SPOTIFY_ACCOUNTS_BASE_URL}/api/token`,
            data: querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: SPOTIFY_REDIRECT_URI
            }),
            headers: {
                'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('✅ Successfully exchanged authorization code for tokens');
        return response.data;
    } catch (error) {
        console.error('❌ Error exchanging code for tokens:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('📊 Spotify error details:', error.response.data);
        }
        throw new Error('Failed to exchange authorization code');
    }
};

/**
 * Buscar contenido en Spotify (tracks, artists, playlists, albums)
 */
export const searchSpotify = async (query, type = 'track,artist,playlist,album', limit = 20) => {
    try {
        console.log('🔍 Starting Spotify search...');
        console.log('📋 Search parameters:', { query, type, limit });

        const accessToken = await getSpotifyAccessToken();
        
        if (!accessToken) {
            throw new Error('No access token received');
        }

        console.log('🎵 Making search request to Spotify API...');
        const searchUrl = `${SPOTIFY_API_BASE_URL}/search`;
        const searchParams = {
            q: query,
            type: type,
            limit: limit,
            market: 'US' // Mercado por defecto
        };

        console.log('📋 Search request details:', {
            url: searchUrl,
            params: searchParams,
            headers: {
                Authorization: `Bearer ${accessToken.substring(0, 10)}...`
            }
        });

        const response = await axios({
            method: 'get',
            url: searchUrl,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: searchParams
        });

        console.log('✅ Spotify search successful');
        console.log('📋 Response details:', {
            status: response.status,
            statusText: response.statusText,
            dataKeys: Object.keys(response.data),
            tracksCount: response.data.tracks?.items?.length || 0,
            artistsCount: response.data.artists?.items?.length || 0,
            playlistsCount: response.data.playlists?.items?.length || 0,
            albumsCount: response.data.albums?.items?.length || 0
        });

        return response.data;
    } catch (error) {
        console.error('❌ Error searching Spotify:', error.response?.data || error.message);
        console.error('🔍 Search error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            params: error.config?.params
        });
        throw new Error('Failed to search Spotify content');
    }
};

/**
 * Obtener detalles de una canción específica
 */
export const getTrackDetails = async (trackId) => {
    try {
        const accessToken = await getSpotifyAccessToken();
        
        const response = await axios({
            method: 'get',
            url: `${SPOTIFY_API_BASE_URL}/tracks/${trackId}`,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error getting track details:', error.response?.data || error.message);
        throw new Error('Failed to get track details');
    }
};

/**
 * Obtener detalles de un artista específico
 */
export const getArtistDetails = async (artistId) => {
    try {
        const accessToken = await getSpotifyAccessToken();
        
        const response = await axios({
            method: 'get',
            url: `${SPOTIFY_API_BASE_URL}/artists/${artistId}`,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error getting artist details:', error.response?.data || error.message);
        throw new Error('Failed to get artist details');
    }
};

/**
 * Obtener detalles de una playlist específica
 */
export const getPlaylistDetails = async (playlistId) => {
    try {
        const accessToken = await getSpotifyAccessToken();
        
        const response = await axios({
            method: 'get',
            url: `${SPOTIFY_API_BASE_URL}/playlists/${playlistId}`,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error getting playlist details:', error.response?.data || error.message);
        throw new Error('Failed to get playlist details');
    }
};

/**
 * Obtener detalles de un álbum específico
 */
export const getAlbumDetails = async (albumId) => {
    try {
        const accessToken = await getSpotifyAccessToken();
        
        const response = await axios({
            method: 'get',
            url: `${SPOTIFY_API_BASE_URL}/albums/${albumId}`,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error getting album details:', error.response?.data || error.message);
        throw new Error('Failed to get album details');
    }
};

/**
 * Formatear datos de Spotify para el esquema de la base de datos
 */
export const formatSpotifyContent = (spotifyItem, type) => {
    // Validar que el item de Spotify no sea null o undefined
    if (!spotifyItem || typeof spotifyItem !== 'object') {
        // Solo mostrar warning si es inesperado (no para playlists que comúnmente pueden ser null)
        if (type !== 'playlist') {
            console.warn('⚠️ Invalid Spotify item received:', { type, item: spotifyItem });
        }
        return null;
    }

    // Validar propiedades básicas requeridas
    if (!spotifyItem.id || !spotifyItem.name) {
        console.warn('⚠️ Spotify item missing required properties:', {
            id: spotifyItem.id,
            name: spotifyItem.name,
            type: type
        });
        return null;
    }

    const baseContent = {
        type: type,
        spotifyId: spotifyItem.id,
        name: spotifyItem.name,
        externalUrl: spotifyItem.external_urls?.spotify || ''
    };

    switch (type) {
        case 'track':
            return {
                ...baseContent,
                artist: spotifyItem.artists?.map(artist => artist?.name).filter(name => name).join(', ') || 'Unknown Artist',
                image: spotifyItem.album?.images?.[0]?.url || '',
                previewUrl: spotifyItem.preview_url || null,
                duration: spotifyItem.duration_ms || 0
            };
        
        case 'artist':
            return {
                ...baseContent,
                image: spotifyItem.images?.[0]?.url || ''
            };
        
        case 'playlist':
            return {
                ...baseContent,
                image: spotifyItem.images?.[0]?.url || ''
            };
        
        case 'album':
            return {
                ...baseContent,
                artist: spotifyItem.artists?.map(artist => artist?.name).filter(name => name).join(', ') || 'Unknown Artist',
                image: spotifyItem.images?.[0]?.url || ''
            };
        
        default:
            return baseContent;
    }
};

/**
 * Obtener información del perfil de usuario de Spotify usando su access token
 */
export const getSpotifyUserProfile = async (accessToken) => {
    try {
        const response = await axios({
            method: 'get',
            url: `${SPOTIFY_API_BASE_URL}/me`,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error getting Spotify user profile:', error.response?.data || error.message);
        throw new Error('Failed to get Spotify user profile');
    }
};

/**
 * Refrescar access token usando refresh token
 */
export const refreshSpotifyAccessToken = async (refreshToken) => {
    try {
        const response = await axios({
            method: 'post',
            url: `${SPOTIFY_ACCOUNTS_BASE_URL}/api/token`,
            data: querystring.stringify({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            }),
            headers: {
                'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error refreshing Spotify access token:', error.response?.data || error.message);
        throw new Error('Failed to refresh Spotify access token');
    }
};

/**
 * Verificar si un access token de Spotify es válido
 */
export const validateSpotifyToken = async (accessToken) => {
    try {
        await getSpotifyUserProfile(accessToken);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Obtener playlists del usuario autenticado
 */
export const getUserPlaylists = async (accessToken, limit = 20, offset = 0) => {
    try {
        const response = await axios({
            method: 'get',
            url: `${SPOTIFY_API_BASE_URL}/me/playlists`,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                limit: limit,
                offset: offset
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error getting user playlists:', error.response?.data || error.message);
        throw new Error('Failed to get user playlists');
    }
};

/**
 * Obtener canciones guardadas del usuario
 */
export const getUserSavedTracks = async (accessToken, limit = 20, offset = 0) => {
    try {
        const response = await axios({
            method: 'get',
            url: `${SPOTIFY_API_BASE_URL}/me/tracks`,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                limit: limit,
                offset: offset
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error getting user saved tracks:', error.response?.data || error.message);
        throw new Error('Failed to get user saved tracks');
    }
};

/**
 * Obtener top artistas del usuario
 */
export const getUserTopArtists = async (accessToken, limit = 20, timeRange = 'medium_term') => {
    try {
        const response = await axios({
            method: 'get',
            url: `${SPOTIFY_API_BASE_URL}/me/top/artists`,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                limit: limit,
                time_range: timeRange // short_term, medium_term, long_term
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error getting user top artists:', error.response?.data || error.message);
        throw new Error('Failed to get user top artists');
    }
};

/**
 * Obtener top canciones del usuario
 */
export const getUserTopTracks = async (accessToken, limit = 20, timeRange = 'medium_term') => {
    try {
        const response = await axios({
            method: 'get',
            url: `${SPOTIFY_API_BASE_URL}/me/top/tracks`,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                limit: limit,
                time_range: timeRange // short_term, medium_term, long_term
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error getting user top tracks:', error.response?.data || error.message);
        throw new Error('Failed to get user top tracks');
    }
};
