// src/components/Home/CreatePostForm.jsx
import { useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api.js";

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
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  /**
   * Manejar la creación de un nuevo post
   */
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    if (!user || !user._id) {
      setCreateError("Debes estar autenticado para crear un post.");
      setCreating(false);
      return;
    }

    try {
      const res = await axios.post(API_ENDPOINTS.CREATE_POST, {
        userId: user._id,
        desc,
        img,
      });

      // Crear post con userId poblado para mostrar información inmediatamente
      const newPost = {
        ...res.data.newPost,
        userId: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      };

      // Notificar al componente padre
      onPostCreated(newPost);
      
      // Limpiar formulario
      setDesc("");
      setImg("");
      setCreating(false);
    } catch (error) {
      console.error("Error creando post:", error);
      setCreateError("Error al crear el post. Intenta de nuevo.");
      setCreating(false);
    }
  };

  return (
    <>
      {/* Información del timeline */}
      <div style={{
        background: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        <h3 style={{margin: '0 0 0.5rem 0', color: '#495057', fontSize: '1.1rem'}}>
          📱 Tu Timeline
        </h3>
        <p style={{margin: 0, color: '#6c757d', fontSize: '0.9rem'}}>
          Aquí ves tus posts y los posts de las personas que sigues. 
          ¡Sigue a más usuarios para ver más contenido!
        </p>
      </div>

      {/* Formulario para crear post */}
      <form 
        onSubmit={handleCreatePost} 
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <textarea
          placeholder="¿Qué estás escuchando o pensando?"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          required
          rows={2}
          style={{
            resize: 'none', 
            borderRadius: 8, 
            padding: 8, 
            border: '1px solid #eee'
          }}
          disabled={creating}
        />
        
        <input
          type="text"
          placeholder="URL de imagen (opcional)"
          value={img}
          onChange={e => setImg(e.target.value)}
          disabled={creating}
          style={{
            borderRadius: 8, 
            padding: 8, 
            border: '1px solid #eee'
          }}
        />
        
        <button 
          type="submit" 
          disabled={creating || !desc} 
          style={{
            borderRadius: 8, 
            padding: 8, 
            background: 'linear-gradient(90deg, #fb7202, #e82c0b)', 
            color: '#fff', 
            border: 'none', 
            cursor: 'pointer'
          }}
        >
          {creating ? 'Publicando...' : 'Publicar'}
        </button>
        
        {createError && (
          <span style={{color: '#ff3333'}}>{createError}</span>
        )}
      </form>
    </>
  );
}
