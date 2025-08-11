# RhythMe

Proyecto Final para Diseño Web II

RhythMe es una red social musical construida con el stack MERN (MongoDB, Express.js, React, Node.js). Permite a los usuarios registrarse, iniciar sesión, compartir publicaciones sobre música, interactuar con otros usuarios y explorar contenido musical.

## Tabla de Contenidos

- [Características Principales](#características-principales)
- [Novedades](#novedades)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Rutas Principales (Backend)](#rutas-principales-backend)
- [Scripts Útiles](#scripts-útiles)
- [Licencia](#licencia)

---

## Características Principales

- Registro e inicio de sesión de usuarios con autenticación segura (local y Google OAuth).
- Integración completa con Spotify: conecta tu cuenta, comparte canciones, playlists, artistas o álbumes en tus publicaciones.
- Gestión de usuarios: registro, edición, eliminación, búsqueda, seguir/dejar de seguir usuarios.
- Feed de publicaciones y stories tipo Instagram.
- Gestión de publicaciones: crear, editar, eliminar, dar like/unlike, comentar y compartir contenido musical.
- Sistema de comentarios en posts.
- Búsqueda avanzada de usuarios y contenido musical.
- Seguimiento en tiempo real de estados de seguimiento (followers/following).
- Interfaz moderna y responsiva con React + Vite.
- Backend robusto con Node.js y Express, conexión segura a MongoDB Atlas.
- Modularización avanzada de controladores, servicios y modelos.
- Seguridad: JWT, Bcrypt, CORS, Helmet y control de permisos de usuario.
- Integración visual con FontAwesome para iconografía moderna.
- Sistema de notificaciones para likes y comentarios.
- Panel de administracion para los moderadores y admins de la red.
- Controles de privacidad avanzados por sección: cada usuario puede definir la visibilidad de su perfil, posts, seguidores, y más, incluyendo bloqueo de usuarios.
- Nuevo sistema de reportes: permite reportar usuarios y publicaciones, con gestión centralizada y workflow de revisión para administradores.
- Gestión completa de cuenta: cambio de contraseña, actualización de privacidad, bloqueo/desbloqueo de usuarios, desactivación/reactivación y eliminación (soft/hard) de cuentas.
- Acceso y visibilidad a posts y usuarios según configuración de privacidad y relación entre usuarios.
- Mejoras en administración: soporte para cuentas admin reales y lógica mejorada en acciones sensibles.

## Novedades

**Julio-Agosto 2025:**
- Nuevo modelo y controlador para reportes de usuario y post (Report).
- Nuevos endpoints: reporte de usuarios/posts, revisión de reportes, administración avanzada de cuentas y privacidad.
- Mejoras en flujos de administración y control de permisos.
- Mejoras de manejo de errores y feedback en acciones sensibles.
- Soporte para búsqueda avanzada de posts y ampliación de información de usuario.
- Configuración de Jest en VSCode para ejecución y debugging de tests.
- Refactor de lógica de visibilidad y privacidad.
- Se añadieron pruebas unitarias y de integración usando Jest para backend y frontend.
- Incremento en el límite de elementos mostrados en componentes de Spotify (de 20 a 50).
- Mejoras en el manejo de errores en servicios y controladores de posts y comentarios.
- Implementación de notificaciones para likes y comentarios.
- Integración de SweetAlert2 para notificaciones visuales en frontend.
- Panel de administración añadido.
- Limpieza de código y eliminación de componentes y hooks no usados.
- Corrección de bugs menores y optimización de rendimiento.

**Novedades (julio 2025 y posteriores):**
- Implementación del sistema de comentarios en publicaciones: ahora los usuarios pueden comentar y ver comentarios en los posts.
- Sistema de búsqueda de usuarios mejorado.
- Sistema completo de seguir/dejar de seguir usuarios, ahora con hook personalizado (useFollowSystem) y actualización en tiempo real del estado de seguimiento.
- Nuevo componente Stories para mostrar las historias tipo Instagram.
- Refactorización y optimización de componentes y hooks, mejorando el rendimiento y limpieza del código.
- Mejoras en la Navbar y navegación.
- Optimización de importaciones y eliminación de componentes/hook no usados.
- Corrección de errores tipográficos y espacios en los componentes de edición y perfil de usuario.
- Conexión del API y ajustes de endpoints en frontend y backend.
- Modularización avanzada de servicios y controladores.
- Mejoras internas en la agregación de timeline y validaciones de usuario para operaciones de post.
- Actualización de dependencias y seguridad.
- Gestión completa de publicaciones: Crear, actualizar, eliminar, dar like/unlike, obtener publicaciones individuales y obtener las publicaciones del timeline.
- Nuevos controladores y servicios para gestión avanzada de posts.
- Corrección de la lógica de seguir/dejar de seguir usuarios, asegurando que los campos de seguidores/seguidos se actualicen correctamente.
- Actualización de rutas para soportar los nuevos endpoints de publicación (PUT /update-post/:id, DELETE /delete-post/:id, GET /get-timeline-posts, etc).
- Mejoras internas en la agregación de timeline y validaciones de usuario para operaciones de post.
- Actualización de dependencias y modularización de servicios.
- Nuevo endpoint de backend: Ahora se puede obtener las publicaciones de un usuario específico mediante /get-user-posts/:userId.
- Nuevas rutas frontend: Se añaden /profile/:userId y /edit-profile para ver y editar el perfil de usuario, respectivamente.
- Nuevo componente: EditHeader para la página de edición de usuario.
- Actualización visual: Mejora de estilos en App.css para consistencia visual en toda la aplicación.
- Integración de FontAwesome: Para iconografía moderna en la interfaz.
- Actualización de dependencias: Se incluyen mejoras de seguridad y estabilidad.
- Limpieza de código: Eliminación de logs innecesarios en controladores backend.
- Integración de Spotify: permite a los usuarios buscar, compartir y reproducir canciones o playlists usando la API de Spotify desde la plataforma.
- Nuevos componentes y servicios para conectar y manejar la autenticación, búsqueda y despliegue de contenido de Spotify.
- Actualización de la interfaz para mostrar widgets y opciones de interacción con Spotify.
- Mejoras y optimizaciones internas para soportar la integración de servicios externos.
- [Ver más commits recientes](https://github.com/emrls81/rhythme/commits?sort=committer-date&direction=desc) (la lista puede estar incompleta).

Referencia del pull request: https://github.com/emrls81/rhythme/pull/28 y últimos [commits](https://github.com/emrls81/rhythme/commits?sort=committer-date&direction=desc)

## Tecnologías Utilizadas

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Autenticación:** JWT, Bcrypt, Google OAuth 2.0, Spotify OAuth 2.0
- **Testing** Jest (backend y frontend)
- **Herramientas Adicionales:** ESLint, Helmet, Morgan, CORS, dotenv, FontAwesome

## Estructura del Proyecto

```
rhythme/
│
├── back/               # Backend
│   ├── controllers/    # Lógica de controladores (auth, post, user, spotify, etc.)
│   ├── dbConnect/      # Conexión a MongoDB
│   ├── models/         # Modelos de datos (usuario, post, comentario)
│   ├── routes/         # Rutas Express (usuarios, posts, comentarios, spotify)
│   ├── services/       # Lógica de negocio/servicios
│   ├── tests/          # Pruebas unitarias e integración (nuevo)
│   ├── utils/          # Utilidades y helpers
│   └── server.js       # Entrada principal del backend
│
├── front/              # Frontend
│   ├── src/            # Componentes y páginas de React
│   │   ├── components/ # Componentes reutilizables (Navbar, Feed, Stories, SpotifyWidget, etc.)
│   │   ├── pages/      # Páginas principales (Home, Perfil, Editar perfil, etc.)
│   │   ├── App.jsx     # Definición de rutas principales
│   │   └── App.css     # Estilos globales
│   ├── public/         # Archivos estáticos
│   ├── tests/          # Pruebas frontend (nuevo)
│   └── vite.config.js  # Configuración de Vite
│
└── README.md           # Documentación principal
```

## Instalación y Ejecución

### 1. Clona el repositorio

```bash
git clone https://github.com/emrls81/rhythme.git
cd rhythme
```

### 2. Configura el backend

```bash
cd back
npm install
# Crea un archivo .env y configura tus variables (ejemplo abajo)
npm start
```

**Ejemplo de .env:**
```
# MongoDB
MONGO_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/rhythme

# JWT
JWT_SECRET=tu_secreto_super_seguro

# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Spotify OAuth
SPOTIFY_CLIENT_ID=tu_spotify_client_id
SPOTIFY_CLIENT_SECRET=tu_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5000/api/v1/spotify/callback
```

### 3. Configura el frontend

```bash
cd ../front
npm install
npm run dev
```

Accede al frontend normalmente en `http://localhost:5173` (o el puerto que indique Vite).

## Rutas Principales (Backend)

- Usuarios:
  - **Registro de usuario:** `POST /api/v1/auth/register`
  - **Inicio de sesión local:** `POST /api/v1/auth/login`
  - **Login con Google OAuth:** `GET /api/v1/auth/google`
  - **Callback Google OAuth:** `GET /api/v1/auth/google/callback`
  - **Obtener usuario por ID:** `GET /api/v1/users/:id`
  - **Actualizar usuario:** `PUT /api/v1/users/:id`
  - **Eliminar usuario:** `DELETE /api/v1/users/:id`
  - **Seguir usuario:** `POST /api/v1/users/follow/:id`
  - **Dejar de seguir usuario:** `POST /api/v1/users/unfollow/:id`
  - **Buscar usuarios:** `GET /api/v1/users/search`
  - **Reportar un usuario:** `POST /api/report/user`
  - **Reportar un post:** `POST /api/report/post`
  - **Listar reportes (solo admin):** `GET /api/report`
  - **Marcar reporte como revisado (admin):** `PUT /api/report/:id/review`
  - **Actualizar privacidad de usuario:** `PUT /api/user/privacy`
  - **Bloquear usuario:** `PUT /api/user/block/:id`
  - **Desbloquear usuario:** `PUT /api/user/unblock/:id`
  - **Desactivar cuenta:** `PUT /api/user/deactivate`
  - **Reactivar cuenta:** `PUT /api/user/reactivate`
  - **Eliminar cuenta (soft o hard):** `DELETE /api/user`
  - **Cambiar contraseña:** `PUT /api/user/password`
- Posts y comentarios:
  - **Buscar posts por descripción:** `GET /api/posts/search`
  - **Obtener post con info avanzada de usuario:** `GET /api/posts/:id/details`
  - **Crear post:** `POST /api/v1/posts/`
  - **Editar post:** `PUT /api/v1/posts/:id`
  - **Eliminar post:** `DELETE /api/v1/posts/:id`
  - **Obtener todos los posts:** `GET /api/v1/posts/`
  - **Posts de un usuario:** `GET /api/v1/posts/get-user-posts/:userId`
  - **Obtener post por ID:** `GET /api/v1/posts/:id`
  - **Agregar comentario a post:** `POST /api/v1/posts/comment-post/:id`
  - **Obtener comentarios de un post:** `GET /api/v1/posts/get-comments/:id`
  - **Like/unlike a un post:** `POST /api/v1/posts/like/:id`
  - **Timeline de publicaciones de usuario:** `GET /api/v1/posts/timeline/:userId`
  - **Obtener stories:** `GET /api/v1/stories`
- Spotify:
  - **Iniciar conexión con Spotify:** `GET /api/v1/spotify/login`
  - **Callback de autenticación Spotify:** `GET /api/v1/spotify/callback`
  - **Buscar canciones, playlists, artistas o álbumes:** `GET /api/v1/spotify/search`
  - **Obtener datos del usuario de Spotify autenticado:** `GET /api/v1/spotify/me`

## Scripts Útiles

- **Backend:**
  - `npm start` (corre el servidor en `localhost:5000`)
- **Frontend:**
  - `npm run dev` (corre Vite en modo desarrollo)
- **Tests:**
  - `npm test` (Ejecuta los tests con Jest)

## Licencia

Este proyecto está licenciado bajo los términos de la licencia MIT. Consulta el archivo [LICENSE](./LICENSE) para más detalles.

---

¿Preguntas? Abre un issue o contacta a los autores.

https://github.com/emrls81

https://github.com/jmunozc023

https://github.com/tomcasss

https://github.com/GreivinBadilla

---
