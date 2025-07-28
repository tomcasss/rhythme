import { getSpotifyAuthUrl } from '../services/spotify.service.js';

/**
 * Controlador temporal para diagnóstico de variables de entorno
 */
export const debugEnvironmentVariables = async (req, res) => {
    try {
        const envVars = {
            SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ? 'SET' : 'NOT SET',
            SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET ? 'SET' : 'NOT SET',
            SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI || 'DEFAULT VALUE',
            NODE_ENV: process.env.NODE_ENV || 'NOT SET',
            // Solo mostrar los primeros y últimos caracteres por seguridad
            SPOTIFY_CLIENT_ID_PREVIEW: process.env.SPOTIFY_CLIENT_ID ? 
                `${process.env.SPOTIFY_CLIENT_ID.substring(0, 4)}...${process.env.SPOTIFY_CLIENT_ID.substring(process.env.SPOTIFY_CLIENT_ID.length - 4)}` : 
                'NOT SET',
            SPOTIFY_CLIENT_SECRET_PREVIEW: process.env.SPOTIFY_CLIENT_SECRET ? 
                `${process.env.SPOTIFY_CLIENT_SECRET.substring(0, 4)}...${process.env.SPOTIFY_CLIENT_SECRET.substring(process.env.SPOTIFY_CLIENT_SECRET.length - 4)}` : 
                'NOT SET'
        };

        console.log('🔍 DEBUG - Environment Variables Check:');
        console.log('SPOTIFY_CLIENT_ID:', envVars.SPOTIFY_CLIENT_ID_PREVIEW);
        console.log('SPOTIFY_CLIENT_SECRET:', envVars.SPOTIFY_CLIENT_SECRET_PREVIEW);
        console.log('SPOTIFY_REDIRECT_URI:', envVars.SPOTIFY_REDIRECT_URI);

        res.status(200).json({
            success: true,
            message: 'Environment variables diagnostic',
            data: envVars
        });
    } catch (error) {
        console.error('Error in debug endpoint:', error);
        res.status(500).json({
            error: 'Debug endpoint failed',
            details: error.message
        });
    }
};

/**
 * Probar la generación de URL de Spotify
 */
export const debugSpotifyUrl = async (req, res) => {
    try {
        console.log('🔍 DEBUG - Testing Spotify URL generation...');
        
        const authUrl = getSpotifyAuthUrl();
        
        // Parsear la URL para verificar que contenga client_id
        const url = new URL(authUrl);
        const clientId = url.searchParams.get('client_id');
        
        res.status(200).json({
            success: true,
            message: 'Spotify URL generation test',
            data: {
                authUrl: authUrl,
                hasClientId: !!clientId,
                clientIdPresent: clientId ? `${clientId.substring(0, 4)}...${clientId.substring(clientId.length - 4)}` : 'MISSING',
                urlParams: Object.fromEntries(url.searchParams.entries())
            }
        });
    } catch (error) {
        console.error('Error testing Spotify URL generation:', error);
        res.status(500).json({
            error: 'Spotify URL generation test failed',
            details: error.message
        });
    }
};
