// src/components/Home/CreatePostForm.jsx
import { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faSpotify } from "@fortawesome/free-brands-svg-icons";
import { API_ENDPOINTS } from "../../config/api.js";
import SpotifySearch from "./SpotifySearch.jsx";
import SpotifyContent from "./SpotifyContent.jsx";
import "./CreatePostForm.css";

/**
 * Componente CreatePostForm - Formulario para crear nuevos posts
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.user - Usuario actual
 * @param {Function} props.onPostCreated - Callback cuando se crea un post exitosamente
 */
export default function CreatePostForm({ user, onPostCreated }) {
  // Estados del formulario
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [spotifyContent, setSpotifyContent] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [showSpotifySearch, setShowSpotifySearch] = useState(false);

  /**
   * Manejar la selección de contenido de Spotify
   */
  const handleSpotifyContentSelect = (content) => {
    console.log('🎵 Spotify content selected:', content);
    setSpotifyContent(content);
    setShowSpotifySearch(false);
  };

  /**
   * Remover contenido de Spotify seleccionado
   */
  const removeSpotifyContent = () => {
    setSpotifyContent(null);
  };

  /**
   * Manejar la creación de un nuevo post
   */
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    console.log('📝 Creating post with data:', {
      userId: user?._id,
      desc,
      img,
      spotifyContent
    });

    if (!user || !user._id) {
      setCreateError("Debes estar autenticado para crear un post.");
      setCreating(false);
      return;
    }

    try {
      const postData = {
        userId: user._id,
        desc,
        img,
      };

      // Agregar contenido de Spotify si existe
      if (spotifyContent) {
        console.log('🎵 Adding Spotify content to post:', spotifyContent);
        postData.spotifyContent = spotifyContent;
      }

      console.log('📤 Sending post data to backend:', postData);
      const res = await axios.post(API_ENDPOINTS.CREATE_POST, postData);
      console.log('✅ Post created successfully:', res.data);

      // Crear post con userId poblado para mostrar información inmediatamente
      const newPost = {
        ...res.data.newPost,
        userId: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
        spotifyContent: spotifyContent,
      };

      console.log('🔄 Notifying parent component with new post:', newPost);
      // Notificar al componente padre
      onPostCreated(newPost);
      
      // Limpiar formulario
      setDesc("");
      setImg("");
      setSpotifyContent(null);
      setCreating(false);
    } catch (error) {
      console.error("❌ Error creando post:", error);
      console.error("📋 Error details:", error.response?.data);
      setCreateError("Error al crear el post. Intenta de nuevo.");
      setCreating(false);
    }
  };

  return (
    <>
      {/* Formulario para crear post */}
  <form className="create-post-form" onSubmit={handleCreatePost}>
        <textarea
          placeholder="¿Qué estás escuchando o pensando?"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          required
          rows={2}
          className="create-textarea"
          disabled={creating}
        />
        
        <input
          type="text"
          placeholder="URL de imagen (opcional)"
          value={img}
          onChange={e => setImg(e.target.value)}
          disabled={creating}
          className="create-image-input"
        />

        {/* Mostrar contenido de Spotify seleccionado */}
        {spotifyContent && (
          <div className="spotify-selected">
            <SpotifyContent spotifyContent={spotifyContent} size="small" />
            <button
              type="button"
              onClick={removeSpotifyContent}
              className="remove-spotify-btn"
              title="Remover contenido de Spotify"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}

        {/* Botones de acción */}
        <div className="create-actions">
          <button
            type="button"
            onClick={() => setShowSpotifySearch(true)}
            disabled={creating}
            className="btn-spotify"
            title="Agregar contenido de Spotify"
          >
            <FontAwesomeIcon icon={faSpotify} />
            Spotify
          </button>
          
          <button 
            type="submit" 
            disabled={creating || !desc} 
            className="btn-publish"
          >
            {creating ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
        
        {createError && (
          <span className="create-error">{createError}</span>
        )}
      </form>

      {/* Modal de búsqueda de Spotify */}
      <SpotifySearch
        isOpen={showSpotifySearch}
        onClose={() => setShowSpotifySearch(false)}
        onSelectContent={handleSpotifyContentSelect}
      />
    </>
  );
}
