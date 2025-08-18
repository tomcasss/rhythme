# RhythMe

Proyecto Final para Diseño Web II

RhythMe es una red social musical construida con el stack MERN (MongoDB, Express.js, React, Node.js). Permite a los usuarios registrarse, iniciar sesión, compartir publicaciones sobre música, interactuar con otros usuarios, y conectar su cuenta de Spotify para compartir y explorar contenido musical.

## Tabla de Contenidos

- [Características Principales](#características-principales)
- [Novedades](#novedades)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Rutas Principales (Backend)](#rutas-principales-backend)
- [Eventos en tiempo real (Sockets)](#eventos-en-tiempo-real-sockets)
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
- Sistema de notificaciones para likes y comentarios, con notificaciones en tiempo real y por correo electrónico.
- Notificaciones por correo para nuevos mensajes.
- Panel de administración para los moderadores y admins de la red.
- Controles de privacidad avanzados por sección: cada usuario puede definir la visibilidad de su perfil, posts, seguidores, y más, incluyendo bloqueo de usuarios.
- Nuevo sistema de reportes: permite reportar usuarios y publicaciones, con gestión centralizada y workflow de revisión para administradores.
- Gestión completa de cuenta: cambio de contraseña, actualización de privacidad, bloqueo/desbloqueo de usuarios, desactivación/reactivación y eliminación (soft/hard) de cuentas.
- Acceso y visibilidad a posts y usuarios según configuración de privacidad y relación entre usuarios.
- Mejoras en administración: soporte para cuentas admin reales y lógica mejorada en acciones sensibles.

## Novedades

**Agosto 2025 — PR #45 (Jose precover):**
- Autenticación:
  - Nuevo endpoint de login con Google vía API: `POST /api/v1/auth/google`.
  - Restablecimiento de contraseña:
    - Solicitar: `POST /api/v1/auth/password-reset/request`
    - Confirmar: `POST /api/v1/auth/password-reset/confirm`
- Publicaciones:
  - Emisión centralizada de eventos en tiempo real para crear, actualizar, eliminar, dar like y comentar posts.
  - Notificaciones por correo para likes y comentarios (nuevas plantillas y utilidades de correo).
- Mensajes:
  - Emisión de eventos por socket para nuevos mensajes y envío de notificaciones por correo.
- Rendimiento:
  - Nuevos índices en `posts` y `users` para mejorar timeline, recomendaciones y búsquedas.
  - Timeline con paginación y soporte de cursor para obtener publicaciones de forma más eficiente.
- Dependencias:
  - Se añadieron dependencias para envío de correo, JWT y compresión.
- Infraestructura:
  - Incorporación de utilidades de mailer y plantillas de correo.

Para ver todos los archivos modificados en este PR: https://github.com/emrls81/rhythme/pull/45/files

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
- Implementación del sistema de comentarios en publicaciones.
- Sistema de búsqueda de usuarios mejorado.
- Sistema completo de seguir/dejar de seguir usuarios, con hook personalizado (useFollowSystem) y actualización en tiempo real del estado de seguimiento.
- Nuevo componente Stories.
- Refactorización y optimización de componentes y hooks.
- Mejoras en la Navbar y navegación.
- Optimización de importaciones y eliminación de componentes/hook no usados.
- Corrección de errores tipográficos y espacios en componentes de edición y perfil.
- Conexión del API y ajustes de endpoints en frontend y backend.
- Modularización avanzada de servicios y controladores.
- Mejoras internas en la agregación de timeline y validaciones de usuario para operaciones de post.
- Actualización de dependencias y seguridad.
- Gestión completa de publicaciones (CRUD, like/unlike, timeline, etc.).
- Nuevos controladores y servicios para gestión avanzada de posts.
- Actualización de rutas para soportar nuevos endpoints de publicación.
- Endpoint para obtener publicaciones de un usuario específico: `/get-user-posts/:userId`.
- Nuevas rutas frontend: `/profile/:userId` y `/edit-profile`.
- Integración de FontAwesome.
- Integración de Spotify: búsqueda, compartir y reproducir contenido.
- [Ver más commits recientes](https://github.com/emrls81/rhythme/commits?sort=committer-date&direction=desc) (la lista puede estar incompleta).

Referencia de pull requests recientes: https://github.com/emrls81/rhythme/pull/45 y https://github.com/emrls81/rhythme/pull/28

## Tecnologías Utilizadas

- Frontend: React, Vite, CSS
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Autenticación: JWT, Bcrypt, Google OAuth 2.0, Spotify OAuth 2.0
- Notificaciones por correo: (Mailer/SMTP)
- Seguridad y utilidades: Helmet, CORS, dotenv, Morgan, Compresión (compression)
- Testing: Jest (backend y frontend)
- Iconografía: FontAwesome
- Linter: ESLint

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
│   ├── tests/          # Pruebas unitarias e integración
│   ├── utils/          # Utilidades y helpers (incluye mailer y plantillas de correo)
│   └── server.js       # Entrada principal del backend
│
├── front/              # Frontend
│   ├── src/            # Componentes y páginas de React
│   │   ├── components/ # Navbar, Feed, Stories, SpotifyWidget, etc.
│   │   ├── pages/      # Home, Perfil, Editar perfil, etc.
│   │   ├── App.jsx     # Definición de rutas principales
│   │   └── App.css     # Estilos globales
│   ├── public/         # Archivos estáticos
│   ├── tests/          # Pruebas frontend
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

# Google OAuth (si aplica para obtención de token del lado del servidor/cliente)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# Spotify OAuth
SPOTIFY_CLIENT_ID=tu_spotify_client_id
SPOTIFY_CLIENT_SECRET=tu_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5000/api/v1/spotify/callback

# Correo (SMTP) para notificaciones y restablecimiento de contraseña
SMTP_HOST=smtp.tu_proveedor.com
SMTP_PORT=587
SMTP_USER=tu_usuario_smtp
SMTP_PASS=tu_password_smtp
EMAIL_FROM="RhythMe <no-reply@tu-dominio.com>"

# URL base de la app (para construir enlaces en correos)
APP_BASE_URL=http://localhost:5173
```

Ajusta las variables de correo según tu proveedor (por ejemplo: Gmail, SendGrid, Mailgun, etc.).

### 3. Configura el frontend

```bash
cd ../front
npm install
npm run dev
```

Accede al frontend en `http://localhost:5173` (o el puerto que indique Vite).

## Rutas Principales (Backend)

- Autenticación:
  - Registro de usuario: `POST /api/v1/auth/register`
  - Inicio de sesión (local): `POST /api/v1/auth/login`
  - Login con Google: `POST /api/v1/auth/google`
  - Solicitar restablecimiento de contraseña: `POST /api/v1/auth/password-reset/request`
  - Confirmar restablecimiento de contraseña: `POST /api/v1/auth/password-reset/confirm`

- Usuarios:
  - Obtener usuario por ID: `GET /api/v1/users/:id`
  - Actualizar usuario: `PUT /api/v1/users/:id`
  - Eliminar usuario: `DELETE /api/v1/users/:id`
  - Seguir usuario: `POST /api/v1/users/follow/:id`
  - Dejar de seguir usuario: `POST /api/v1/users/unfollow/:id`
  - Buscar usuarios: `GET /api/v1/users/search`
  - Reportar un usuario: `POST /api/report/user`
  - Reportar un post: `POST /api/report/post`
  - Listar reportes (solo admin): `GET /api/report`
  - Marcar reporte como revisado (admin): `PUT /api/report/:id/review`
  - Actualizar privacidad de usuario: `PUT /api/user/privacy`
  - Bloquear usuario: `PUT /api/user/block/:id`
  - Desbloquear usuario: `PUT /api/user/unblock/:id`
  - Desactivar cuenta: `PUT /api/user/deactivate`
  - Reactivar cuenta: `PUT /api/user/reactivate`
  - Eliminar cuenta (soft o hard): `DELETE /api/user`
  - Cambiar contraseña: `PUT /api/user/password`

- Posts y comentarios:
  - Buscar posts por descripción: `GET /api/posts/search`
  - Obtener post con info avanzada de usuario: `GET /api/posts/:id/details`
  - Crear post: `POST /api/v1/posts/`
  - Editar post: `PUT /api/v1/posts/:id`
  - Eliminar post: `DELETE /api/v1/posts/:id`
  - Obtener todos los posts: `GET /api/v1/posts/`
  - Posts de un usuario: `GET /api/v1/posts/get-user-posts/:userId`
  - Obtener post por ID: `GET /api/v1/posts/:id`
  - Agregar comentario a post: `POST /api/v1/posts/comment-post/:id`
  - Obtener comentarios de un post: `GET /api/v1/posts/get-comments/:id`
  - Like/unlike a un post: `POST /api/v1/posts/like/:id`
  - Timeline de publicaciones de usuario: `GET /api/v1/posts/timeline/:userId`
  - Obtener stories: `GET /api/v1/stories`

- Spotify:
  - Iniciar conexión con Spotify: `GET /api/v1/spotify/login`
  - Callback de autenticación Spotify: `GET /api/v1/spotify/callback`
  - Buscar canciones, playlists, artistas o álbumes: `GET /api/v1/spotify/search`
  - Obtener datos del usuario de Spotify autenticado: `GET /api/v1/spotify/me`

Nota: Los prefijos pueden variar según el montaje del router (por ejemplo, `/api/v1/auth` para autenticación).

## Eventos en tiempo real (Sockets)

El backend emite eventos en tiempo real para:
- Publicaciones: creación, actualización, eliminación, like/unlike y comentarios.
- Mensajes: nuevos mensajes.

Estos eventos se utilizan para actualizar la interfaz de los clientes conectados sin recargar la página y se complementan con notificaciones por correo en acciones relevantes (por ejemplo, likes, comentarios y nuevos mensajes).

## Scripts Útiles

- Backend:
  - `npm start` (corre el servidor en `localhost:5000`)
- Frontend:
  - `npm run dev` (corre Vite en modo desarrollo)
- Tests:
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