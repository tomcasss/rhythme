// src/components/Home/CommentsSection.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api.js";
import userImg from '../../assets/user.png';

/**
 * Componente CommentsSection - Sección de comentarios de un post
 * @param {Object} props - Propiedades del componente
 * @param {string} props.postId - ID del post
 * @param {Object} props.user - Usuario actual
 */
export default function CommentsSection({ postId, user }) {
  // Estados para comentarios
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Cargar comentarios al montar el componente
  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_ENDPOINTS.GET_COMMENTS(postId));
        setComments(res.data.comments || []);
      } catch (error) {
        console.error("Error al cargar comentarios:", error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [postId]);

  /**
   * Agregar nuevo comentario
   */
  const handleAddComment = async () => {
    const text = commentText.trim();
    if (!text || !user?._id) return;

    setSubmitting(true);
    try {
      await axios.post(API_ENDPOINTS.COMMENT_POST(postId), {
        userId: user._id,
        text
      });

      // Agregar comentario localmente
      const newComment = {
        _id: Date.now().toString(),
        userId: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture
        },
        text,
        createdAt: new Date().toISOString()
      };

      setComments(prev => [...prev, newComment]);
      setCommentText("");
    } catch (error) {
      console.error("Error al agregar comentario:", error);
      alert("Error al agregar comentario");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Manejar tecla Enter para enviar comentario
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !submitting) {
      handleAddComment();
    }
  };

  return (
    <div className="comments-section">
      {/* Formulario para agregar comentario */}
      <div className="comment-form">
        <input
          type="text"
          placeholder="Escribe un comentario..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={submitting}
          className="comment-input"
        />
        <button
          onClick={handleAddComment}
          disabled={submitting || !commentText.trim()}
          className="comment-submit-btn"
        >
          {submitting ? '...' : 'Enviar'}
        </button>
      </div>

      {/* Lista de comentarios */}
      {loading ? (
        <div className="comments-loading">Cargando comentarios...</div>
      ) : (
        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="comments-empty">
              No hay comentarios aún. ¡Sé el primero en comentar!
            </div>
          ) : (
            comments.map((comment, index) => (
              <div key={comment._id || index} className="comment-item">
                <img 
                  src={comment.userId?.profilePicture || userImg} 
                  alt="user" 
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">
                      {comment.userId?.username || comment.userId?.email || 'Usuario'}
                    </span>
                    <span className="comment-time">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
