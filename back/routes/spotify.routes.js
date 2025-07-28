import express from "express";
import { 
    searchSpotifyContent, 
    getSpotifyItemDetails, 
    getSpotifyAuthorizationUrl, 
    handleSpotifyCallback,
    disconnectSpotifyAccount,
    getSpotifyConnectionStatus,
    getUserSpotifyPlaylists,
    getUserSpotifySavedTracks,
    getUserSpotifyTopArtists,
    getUserSpotifyTopTracks
} from "../controllers/spotify.controller.js";

const router = express.Router();

// Ruta para buscar contenido en Spotify
router.get("/search", searchSpotifyContent);

// Ruta para obtener detalles específicos de un elemento
router.get("/details/:type/:id", getSpotifyItemDetails);

// Ruta para obtener la URL de autorización de Spotify
router.get("/auth-url", getSpotifyAuthorizationUrl);

// Ruta para manejar el callback de autorización de Spotify
router.get("/callback", handleSpotifyCallback);

// Rutas para gestión de cuenta de usuario
router.get("/connection-status/:userId", getSpotifyConnectionStatus);
router.delete("/disconnect/:userId", disconnectSpotifyAccount);

// Rutas para contenido personalizado del usuario
router.get("/user/:userId/playlists", getUserSpotifyPlaylists);
router.get("/user/:userId/saved-tracks", getUserSpotifySavedTracks);
router.get("/user/:userId/top-artists", getUserSpotifyTopArtists);
router.get("/user/:userId/top-tracks", getUserSpotifyTopTracks);

export default router;
