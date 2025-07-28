# 🎵 Integración con Spotify - RhythMe

## 📋 Configuración de Spotify

### 1. Crear una aplicación en Spotify Developer

1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
2. Inicia sesión con tu cuenta de Spotify
3. Haz clic en "Create an App"
4. Completa los campos:
   - **App name**: RhythMe
   - **App description**: Red social musical con integración de Spotify
   - **Website**: http://localhost:5173 (para desarrollo)
   - **Redirect URI**: `http://localhost:5173/callback/spotify`
5. Acepta los términos y condiciones
6. Guarda el **Client ID** y **Client Secret**

### 2. Configurar variables de entorno

#### Backend (`back/.env`)
```env
# Spotify API Credentials
SPOTIFY_CLIENT_ID=tu_spotify_client_id_aqui
SPOTIFY_CLIENT_SECRET=tu_spotify_client_secret_aqui  
SPOTIFY_REDIRECT_URI=http://localhost:5173/callback/spotify

# Otras variables existentes...
MONGO_URI=tu_mongodb_connection_string
PORT=5000
```

#### Frontend (`front/.env`) - Opcional
```env
# Variables para el frontend (opcional)
VITE_SPOTIFY_CLIENT_ID=tu_spotify_client_id_aqui
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback/spotify
```

### 3. Instalar dependencias

#### Backend
```bash
cd back
npm install axios querystring
```

Las dependencias del frontend ya están incluidas.

### 4. Reiniciar los servidores

```bash
# Backend
cd back
npm start

# Frontend  
cd front
npm run dev
```

## 🎯 Funcionalidades implementadas

### ✅ Backend
- **Modelo de Post actualizado** con soporte para contenido de Spotify
- **Modelo de User actualizado** con información de cuenta de Spotify
- **Servicio de Spotify** para interactuar con la API
- **Endpoints para búsqueda** de canciones, artistas, playlists y álbumes
- **Autenticación completa con Spotify** para acceso a contenido personalizado
- **Gestión de tokens** con refresh automático
- **Endpoints para contenido personalizado** (playlists, top artistas/canciones, música guardada)
- **Formateo de datos** para compatibilidad con la base de datos

### ✅ Frontend
- **Componente SpotifySearch** - Modal de búsqueda con contenido público y personalizado
- **Componente SpotifyContent** - Visualización de contenido musical en posts
- **Componente SpotifyConnection** - Gestión de conexión con Spotify en el perfil
- **Integración en CreatePostForm** - Botón para agregar música
- **Integración en PostCard** - Mostrar contenido de Spotify
- **Integración en páginas de perfil** - Conexión y contenido musical del usuario
- **Callback de autorización** - Manejo completo de la respuesta de Spotify

## 🎵 Cómo usar

### Para usuarios:

1. **Conectar cuenta de Spotify**:
   - Ve a "Editar perfil" desde el menú de usuario
   - En la sección "Spotify", haz clic en "Conectar"
   - Autoriza la aplicación en la ventana de Spotify
   - ¡Ya puedes acceder a tu contenido personalizado!

2. **Crear un post con música**:
   - En la página de inicio, haz clic en "Spotify" al crear un post
   - **Pestaña "Buscar"**: Busca cualquier contenido público de Spotify
   - **Pestaña "Mi música"** (si tienes Spotify conectado): Accede a tus playlists, música guardada, top artistas y canciones
   - Selecciona el contenido que quieras compartir
   - Escribe tu mensaje y publica

3. **Ver contenido musical**:
   - Los posts con contenido de Spotify mostrarán una tarjeta musical
   - Puedes reproducir previews de 30 segundos (para canciones)
   - Haz clic en "Abrir en Spotify" para ir a la canción/artista completo

4. **Ver perfil musical**:
   - En cualquier perfil de usuario verás la sección "Spotify" 
   - Si el usuario tiene Spotify conectado, podrás ver su contenido musical
   - Si es tu perfil, puedes gestionar tu conexión con Spotify

### Para desarrolladores:

```javascript
// Buscar contenido en Spotify
const searchResults = await axios.get(API_ENDPOINTS.SPOTIFY_SEARCH('billie eilish'));

// Crear post con contenido de Spotify
const postData = {
    userId: user._id,
    desc: "¡Me encanta esta canción!",
    spotifyContent: {
        type: 'track',
        spotifyId: '4jPy3l0RUwlUI9T5XHBW2m',
        name: 'bad guy',
        artist: 'Billie Eilish',
        image: 'https://i.scdn.co/image/...',
        externalUrl: 'https://open.spotify.com/track/...',
        previewUrl: 'https://p.scdn.co/mp3-preview/...'
    }
};
```

## 🔧 API Endpoints

### Búsqueda pública
- `GET /api/v1/spotify/search?query=billie%20eilish&type=track&limit=20`

### Detalles específicos
- `GET /api/v1/spotify/details/track/{track_id}`
- `GET /api/v1/spotify/details/artist/{artist_id}` 
- `GET /api/v1/spotify/details/playlist/{playlist_id}`
- `GET /api/v1/spotify/details/album/{album_id}`

### Autenticación
- `GET /api/v1/spotify/auth-url` - Obtener URL de autorización
- `GET /api/v1/spotify/callback?code={auth_code}&userId={user_id}` - Manejar callback

### Gestión de cuenta
- `GET /api/v1/spotify/connection-status/{userId}` - Estado de conexión
- `DELETE /api/v1/spotify/disconnect/{userId}` - Desconectar cuenta

### Contenido personalizado del usuario
- `GET /api/v1/spotify/user/{userId}/playlists` - Playlists del usuario
- `GET /api/v1/spotify/user/{userId}/saved-tracks` - Canciones guardadas
- `GET /api/v1/spotify/user/{userId}/top-artists` - Top artistas
- `GET /api/v1/spotify/user/{userId}/top-tracks` - Top canciones

## 🎨 Personalización

### Estilos CSS
Los componentes incluyen CSS completamente personalizable:
- `SpotifySearch.css` - Modal de búsqueda
- `SpotifyContent.css` - Tarjetas de contenido musical

### Tipos de contenido soportados
- **🎵 Canciones** - Con preview de audio y duración
- **👤 Artistas** - Con imagen y perfil
- **📋 Playlists** - Con imagen de portada  
- **💿 Álbumes** - Con portada y artista

## 🚀 Próximas mejoras

- [ ] **Playlists personalizadas** del usuario autenticado
- [ ] **Top canciones/artistas** del usuario
- [ ] **Recomendaciones** basadas en gustos musicales
- [ ] **Integración con otras plataformas** (Apple Music, YouTube Music)
- [ ] **Reproductor integrado** para previews más largos

## 🔒 Notas de seguridad

- Las credenciales de Spotify se almacenan solo en el servidor
- Los tokens de usuario se pueden guardar en localStorage (opcional)
- La aplicación usa Client Credentials Flow para búsquedas públicas
- Authorization Code Flow solo si se necesita acceso a datos privados del usuario

## 📞 Soporte

Si necesitas ayuda con la configuración o tienes algún problema:

1. Verifica que las credenciales de Spotify estén correctas
2. Asegúrate de que los servidores estén ejecutándose
3. Revisa la consola del navegador para errores
4. Comprueba que la Redirect URI esté configurada correctamente en Spotify

¡Disfruta compartiendo música en RhythMe! 🎵✨
