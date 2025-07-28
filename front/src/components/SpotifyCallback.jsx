import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

/**
 * Componente para manejar el callback de autorización de Spotify
 * Maneja la redirección desde 127.0.0.1 (requerido por Spotify) a localhost
 */
export default function SpotifyCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const error = searchParams.get('error');
            const state = searchParams.get('state'); // El userId viene en el state

            if (error) {
                console.error('Spotify authorization error:', error);
                // Redirigir de vuelta al home con un mensaje de error
                // Si estamos en 127.0.0.1, redirigir a localhost
                if (window.location.hostname === '127.0.0.1') {
                    window.location.href = 'http://localhost:5173/home?spotify_error=authorization_denied';
                } else {
                    navigate('/home?spotify_error=authorization_denied');
                }
                return;
            }

            if (code && state) {
                try {
                    // Intercambiar código por tokens - el state contiene el userId
                    const response = await axios.get(`${API_ENDPOINTS.SPOTIFY_CALLBACK}?code=${code}&state=${state}`);
                    
                    if (response.data.success) {
                        // Cerrar la ventana popup si existe
                        if (window.opener) {
                            window.opener.postMessage({ type: 'SPOTIFY_AUTH_SUCCESS' }, '*');
                            window.close();
                        } else {
                            // Redirigir de vuelta al perfil con éxito
                            // Si estamos en 127.0.0.1, redirigir a localhost
                            if (window.location.hostname === '127.0.0.1') {
                                window.location.href = 'http://localhost:5173/edit-profile?spotify_connected=true';
                            } else {
                                navigate('/edit-profile?spotify_connected=true');
                            }
                        }
                    } else {
                        throw new Error('Failed to exchange authorization code');
                    }
                } catch (error) {
                    console.error('Error exchanging Spotify code:', error);
                    if (window.opener) {
                        window.opener.postMessage({ type: 'SPOTIFY_AUTH_ERROR' }, '*');
                        window.close();
                    } else {
                        // Si estamos en 127.0.0.1, redirigir a localhost
                        if (window.location.hostname === '127.0.0.1') {
                            window.location.href = 'http://localhost:5173/edit-profile?spotify_error=token_exchange_failed';
                        } else {
                            navigate('/edit-profile?spotify_error=token_exchange_failed');
                        }
                    }
                }
            } else {
                // Sin código de autorización, redirigir al perfil
                if (window.opener) {
                    window.close();
                } else {
                    navigate('/edit-profile');
                }
            }
        };

        handleCallback();
    }, [navigate, searchParams]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #1DB954',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <p>Conectando con Spotify...</p>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
