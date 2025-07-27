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

- Registro e inicio de sesión de usuarios con autenticación segura
- Autenticación con Google OAuth: Permite a los usuarios iniciar sesión de manera rápida y segura usando su cuenta de Google.
- Gestión de usuarios: Registro, actualización, eliminación, seguimiento y dejar de seguir a otros usuarios.
- Gestión de publicaciones: Crear, obtener y eliminar posts relacionados con la música.
- Base de datos MongoDB Atlas: Almacena de manera segura usuarios y publicaciones en la nube.
- Publicaciones estilo "feed" y "stories" para compartir experiencias musicales
- Interacción mediante likes, comentarios y seguimiento a usuarios
- Interfaz de usuario moderna y responsiva usando React + Vite
- Backend robusto con Express.js y MongoDB, siguiendo buenas prácticas de seguridad
- Interfaz web responsiva: Utiliza HTML y CSS moderno para una experiencia de usuario óptima.

## Novedades

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
- [Ver más commits recientes](https://github.com/emrls81/rhythme/commits?sort=committer-date&direction=desc) (la lista puede estar incompleta).

Referencia del pull request: https://github.com/emrls81/rhythme/pull/6 y últimos [commits](https://github.com/emrls81/rhythme/commits?sort=committer-date&direction=desc)

## Tecnologías Utilizadas

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Autenticación:** JWT, Bcrypt, Google OAuth 2.0
- **Herramientas Adicionales:** ESLint, Helmet, Morgan, CORS, dotenv

## Estructura del Proyecto

```
rhythme/
│
├── back/               # Backend
│   ├── controllers/    # Lógica de controladores (auth, post, user, etc.)
│   ├── dbConnect/      # Conexión a MongoDB
│   ├── models/         # Modelos de datos (usuario, post, comentario)
│   ├── routes/         # Rutas Express (incluye rutas de usuario, post, comentarios)
│   ├── services/       # Lógica de negocio/servicios
│   └── server.js       # Entrada principal del backend
│
├── front/              # Frontend
│   ├── src/            # Componentes y páginas de React
│   │   ├── components/         # Componentes reutilizables
│   │   ├── pages/              # Páginas principales (Home, Editar_usuario, Perfil_usuario, etc.)
│   │   ├── App.jsx             # Definición de rutas principales (ahora incluye /profile/:userId, /edit-profile)
│   │   └── App.css             # Estilos globales
│   ├── public/         # Archivos estáticos
│   ├── index.html      # HTML principal
│   └── vite.config.js  # Configuración de Vite
│
└── README.md           # Este archivo
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
MONGO_URI=mongodb://localhost:27017/rhythme
JWT_SECRET=tu_secreto
```

### 3. Configura el frontend

```bash
cd ../front
npm install
npm run dev
```

Accede al frontend normalmente en `http://localhost:5173` (o el puerto que indique Vite).

## Rutas Principales (Backend)

- **Registro:** `POST /api/v1/auth/register`
- **Login:** `POST /api/v1/auth/login`
- **Obtener usuario por ID:** `GET /api/v1/users/:id`
- **Actualizar usuario:** `PUT /api/v1/users/:id`
- **Eliminar usuario:** `DELETE /api/v1/users/:id`
- **Seguir usuario:** `POST /api/v1/users/follow/:id`
- **Dejar de seguir usuario:** `POST /api/v1/users/unfollow/:id`
- **Buscar usuarios:** `GET /api/v1/users/search`
- **Crear post:** `POST /api/v1/posts/`
- **Actualizar usuario:** `PUT /api/v1/users/:id`
- **Obtener todos los posts:** `GET /api/v1/posts/`
- **Obtener publicaciones de usuario:** `GET /api/v1/posts/get-user-posts/:userId`
- **Obtener post por ID:** `GET /api/v1/posts/:id`
- **Eliminar post:** `DELETE /api/v1/posts/:id`
- **Agregar comentario:** `POST /api/v1/comments/:postId`
- **Obtener comentarios de un post:** `GET /api/v1/comments/:postId`
- **Obtener stories:** `GET /api/v1/stories`
- **Timeline de publicaciones:** `GET /api/v1/posts/timeline/:userId`
- **Agregar comentario:** `POST /api/v1/posts/comment-post/:id`
- **Obtener comentarios de un post:** `GET /api/v1/posts/get-comments/:id`

(Agrega más rutas conforme crezcas el proyecto)

## Scripts Útiles

- **Backend:**
  - `npm start` (corre el servidor en `localhost:5000`)
- **Frontend:**
  - `npm run dev` (corre Vite en modo desarrollo)

## Licencia

Actualmente este proyecto no tiene una licencia asignada.

---

¿Preguntas? Abre un issue o contacta a los autores.

https://github.com/emrls81

https://github.com/jmunozc023

---
