import { 
    searchSpotify, 
    getTrackDetails, 
    getArtistDetails, 
    getPlaylistDetails, 
    getAlbumDetails,
    getSpotifyAuthUrl,
    exchangeCodeForTokens,
    formatSpotifyContent,
    getSpotifyUserProfile,
    refreshSpotifyAccessToken,
    validateSpotifyToken,
    getUserPlaylists,
    getUserSavedTracks,
    getUserTopArtists,
    getUserTopTracks
} from '../services/spotify.service.js';
import userModel from '../models/user.model.js';

/**
 * Controlador para la búsqueda de contenido en Spotify
 */
export const searchSpotifyContent = async (req, res) => {
    try {
        const { query, type, limit } = req.query;
        
        console.log('🔍 Spotify search request:', { query, type, limit });
        
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        console.log('📡 Calling Spotify search service...');
        const results = await searchSpotify(query, type, limit);
        console.log('✅ Spotify search results received:', Object.keys(results));
        
        // Formatear los resultados para que sean consistentes con nuestro esquema
        // Filtrar los resultados null que puedan surgir de items inválidos
        const formattedResults = {
            tracks: results.tracks?.items?.map(track => formatSpotifyContent(track, 'track')).filter(item => item !== null) || [],
            artists: results.artists?.items?.map(artist => formatSpotifyContent(artist, 'artist')).filter(item => item !== null) || [],
            playlists: results.playlists?.items?.map(playlist => formatSpotifyContent(playlist, 'playlist')).filter(item => item !== null) || [],
            albums: results.albums?.items?.map(album => formatSpotifyContent(album, 'album')).filter(item => item !== null) || []
        };

        console.log('🎵 Formatted search results:', {
            tracks: formattedResults.tracks.length,
            artists: formattedResults.artists.length,
            playlists: formattedResults.playlists.length,
            albums: formattedResults.albums.length
        });

        res.status(200).json({
            success: true,
            data: formattedResults
        });
    } catch (error) {
        console.error('Error in searchSpotifyContent:', error);
        res.status(500).json({ 
            error: 'Failed to search Spotify content',
            details: error.message 
        });
    }
};

/**
 * Obtener detalles específicos de un elemento de Spotify
 */
export const getSpotifyItemDetails = async (req, res) => {
    try {
        const { type, id } = req.params;
        
        let details;
        
        switch (type) {
            case 'track':
                details = await getTrackDetails(id);
                break;
            case 'artist':
                details = await getArtistDetails(id);
                break;
            case 'playlist':
                details = await getPlaylistDetails(id);
                break;
            case 'album':
                details = await getAlbumDetails(id);
                break;
            default:
                return res.status(400).json({ error: 'Invalid type. Must be track, artist, playlist, or album' });
        }

        const formattedDetails = formatSpotifyContent(details, type);
        
        res.status(200).json({
            success: true,
            data: formattedDetails
        });
    } catch (error) {
        console.error('Error in getSpotifyItemDetails:', error);
        res.status(500).json({ 
            error: 'Failed to get Spotify item details',
            details: error.message 
        });
    }
};

/**
 * Obtener URL de autorización de Spotify
 */
export const getSpotifyAuthorizationUrl = async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        const authUrl = getSpotifyAuthUrl(userId);
        
        res.status(200).json({
            success: true,
            authUrl: authUrl
        });
    } catch (error) {
        console.error('Error in getSpotifyAuthorizationUrl:', error);
        res.status(500).json({ 
            error: 'Failed to generate Spotify authorization URL',
            details: error.message 
        });
    }
};

/**
 * Intercambiar código de autorización por tokens
 */
export const handleSpotifyCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        
        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        if (!state) {
            return res.status(400).json({ error: 'State parameter (userId) is required' });
        }

        // El state contiene el userId
        const userId = state;
        
        console.log('🎵 Processing Spotify callback for user:', userId);

        const tokens = await exchangeCodeForTokens(code);
        
        // Obtener información del perfil de Spotify
        const spotifyProfile = await getSpotifyUserProfile(tokens.access_token);
        
        // Calcular fecha de expiración del token
        const tokenExpiry = new Date(Date.now() + (tokens.expires_in * 1000));
        
        // Actualizar usuario con información de Spotify
        await userModel.findByIdAndUpdate(userId, {
            'spotifyAccount.isConnected': true,
            'spotifyAccount.spotifyId': spotifyProfile.id,
            'spotifyAccount.displayName': spotifyProfile.display_name,
            'spotifyAccount.accessToken': tokens.access_token,
            'spotifyAccount.refreshToken': tokens.refresh_token,
            'spotifyAccount.tokenExpiry': tokenExpiry,
            'spotifyAccount.lastConnected': new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Spotify account connected successfully',
            spotifyProfile: {
                id: spotifyProfile.id,
                displayName: spotifyProfile.display_name,
                images: spotifyProfile.images
            }
        });
    } catch (error) {
        console.error('Error in handleSpotifyCallback:', error);
        res.status(500).json({ 
            error: 'Failed to connect Spotify account',
            details: error.message 
        });
    }
};

/**
 * Desconectar cuenta de Spotify del usuario
 */
export const disconnectSpotifyAccount = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Limpiar información de Spotify del usuario
        await userModel.findByIdAndUpdate(userId, {
            'spotifyAccount.isConnected': false,
            'spotifyAccount.spotifyId': '',
            'spotifyAccount.displayName': '',
            'spotifyAccount.accessToken': '',
            'spotifyAccount.refreshToken': '',
            'spotifyAccount.tokenExpiry': null,
            'spotifyAccount.lastConnected': null
        });

        res.status(200).json({
            success: true,
            message: 'Spotify account disconnected successfully'
        });
    } catch (error) {
        console.error('Error in disconnectSpotifyAccount:', error);
        res.status(500).json({ 
            error: 'Failed to disconnect Spotify account',
            details: error.message 
        });
    }
};

/**
 * Obtener estado de conexión con Spotify del usuario
 */
export const getSpotifyConnectionStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await userModel.findById(userId).select('spotifyAccount');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isConnected = user.spotifyAccount?.isConnected || false;
        let isTokenValid = false;

        if (isConnected && user.spotifyAccount.accessToken) {
            // Verificar si el token sigue siendo válido
            isTokenValid = await validateSpotifyToken(user.spotifyAccount.accessToken);
            
            // Si el token no es válido, intentar refrescarlo
            if (!isTokenValid && user.spotifyAccount.refreshToken) {
                try {
                    const newTokens = await refreshSpotifyAccessToken(user.spotifyAccount.refreshToken);
                    const newExpiry = new Date(Date.now() + (newTokens.expires_in * 1000));
                    
                    await userModel.findByIdAndUpdate(userId, {
                        'spotifyAccount.accessToken': newTokens.access_token,
                        'spotifyAccount.tokenExpiry': newExpiry
                    });
                    
                    isTokenValid = true;
                } catch (refreshError) {
                    console.error('Error refreshing token:', refreshError);
                    // Si no se puede refrescar, marcar como desconectado
                    await userModel.findByIdAndUpdate(userId, {
                        'spotifyAccount.isConnected': false
                    });
                }
            }
        }

        res.status(200).json({
            success: true,
            isConnected: isConnected && isTokenValid,
            spotifyProfile: isConnected ? {
                spotifyId: user.spotifyAccount.spotifyId,
                displayName: user.spotifyAccount.displayName,
                lastConnected: user.spotifyAccount.lastConnected
            } : null
        });
    } catch (error) {
        console.error('Error in getSpotifyConnectionStatus:', error);
        res.status(500).json({ 
            error: 'Failed to get Spotify connection status',
            details: error.message 
        });
    }
};

/**
 * Obtener playlists del usuario autenticado
 */
export const getUserSpotifyPlaylists = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 20, offset = 0 } = req.query;
        
        const user = await userModel.findById(userId).select('spotifyAccount');
        
        if (!user || !user.spotifyAccount?.isConnected || !user.spotifyAccount.accessToken) {
            return res.status(401).json({ error: 'Spotify account not connected' });
        }

        const playlists = await getUserPlaylists(user.spotifyAccount.accessToken, limit, offset);
        
        // Formatear playlists para consistencia
        const formattedPlaylists = playlists.items.map(playlist => 
            formatSpotifyContent(playlist, 'playlist')
        );

        res.status(200).json({
            success: true,
            data: formattedPlaylists,
            total: playlists.total,
            limit: playlists.limit,
            offset: playlists.offset
        });
    } catch (error) {
        console.error('Error in getUserSpotifyPlaylists:', error);
        res.status(500).json({ 
            error: 'Failed to get user playlists',
            details: error.message 
        });
    }
};

/**
 * Obtener canciones guardadas del usuario
 */
export const getUserSpotifySavedTracks = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 20, offset = 0 } = req.query;
        
        const user = await userModel.findById(userId).select('spotifyAccount');
        
        if (!user || !user.spotifyAccount?.isConnected || !user.spotifyAccount.accessToken) {
            return res.status(401).json({ error: 'Spotify account not connected' });
        }

        const savedTracks = await getUserSavedTracks(user.spotifyAccount.accessToken, limit, offset);
        
        // Formatear tracks para consistencia
        const formattedTracks = savedTracks.items.map(item => 
            formatSpotifyContent(item.track, 'track')
        );

        res.status(200).json({
            success: true,
            data: formattedTracks,
            total: savedTracks.total,
            limit: savedTracks.limit,
            offset: savedTracks.offset
        });
    } catch (error) {
        console.error('Error in getUserSpotifySavedTracks:', error);
        res.status(500).json({ 
            error: 'Failed to get user saved tracks',
            details: error.message 
        });
    }
};

/**
 * Obtener top artistas del usuario
 */
export const getUserSpotifyTopArtists = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 20, timeRange = 'medium_term' } = req.query;
        
        const user = await userModel.findById(userId).select('spotifyAccount');
        
        if (!user || !user.spotifyAccount?.isConnected || !user.spotifyAccount.accessToken) {
            return res.status(401).json({ error: 'Spotify account not connected' });
        }

        const topArtists = await getUserTopArtists(user.spotifyAccount.accessToken, limit, timeRange);
        
        // Formatear artistas para consistencia
        const formattedArtists = topArtists.items.map(artist => 
            formatSpotifyContent(artist, 'artist')
        );

        res.status(200).json({
            success: true,
            data: formattedArtists,
            total: topArtists.total,
            limit: topArtists.limit
        });
    } catch (error) {
        console.error('Error in getUserSpotifyTopArtists:', error);
        res.status(500).json({ 
            error: 'Failed to get user top artists',
            details: error.message 
        });
    }
};

/**
 * Obtener top canciones del usuario
 */
export const getUserSpotifyTopTracks = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 20, timeRange = 'medium_term' } = req.query;
        
        const user = await userModel.findById(userId).select('spotifyAccount');
        
        if (!user || !user.spotifyAccount?.isConnected || !user.spotifyAccount.accessToken) {
            return res.status(401).json({ error: 'Spotify account not connected' });
        }

        const topTracks = await getUserTopTracks(user.spotifyAccount.accessToken, limit, timeRange);
        
        // Formatear tracks para consistencia
        const formattedTracks = topTracks.items.map(track => 
            formatSpotifyContent(track, 'track')
        );

        res.status(200).json({
            success: true,
            data: formattedTracks,
            total: topTracks.total,
            limit: topTracks.limit
        });
    } catch (error) {
        console.error('Error in getUserSpotifyTopTracks:', error);
        res.status(500).json({ 
            error: 'Failed to get user top tracks',
            details: error.message 
        });
    }
};
