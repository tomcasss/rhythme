// src/pages/Home.jsx
import "./Home.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api.js";
import { useFollowSystem } from "../hooks/useFollowSystem.js";

// Componentes
import Navbar from "../components/Home/Navbar";
import CreatePostForm from "../components/Home/CreatePostForm";
import PostsList from "../components/Home/PostsList";

/**
 * Componente Home - Página principal del timeline
 */
export default function Home() {
  const navigate = useNavigate();
  
  // Estados principales
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  
  // Sistema de seguimiento usando hook personalizado
  const {
    followingUsers,
    followLoading,
    isFollowing,
    followUser,
    unfollowUser,
    loadFollowingUsers
  } = useFollowSystem(user);

  // Inicialización y carga de datos
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || !userData._id) {
      navigate("/");
      return;
    }
    
    setUser(userData);
    fetchPosts(userData._id);
    loadFollowingUsers(userData._id);
  }, [navigate, loadFollowingUsers]);

  /**
   * Obtener posts del timeline
   */
  const fetchPosts = async (userId) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API_ENDPOINTS.GET_TIMELINE_POSTS(userId));
      setPosts(res.data.timeLinePosts || []);
    } catch {
      setError("Error al cargar los posts. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar cuando se crea un nuevo post
   */
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  /**
   * Manejar like/unlike de un post
   */
  const handleLike = async (postId) => {
    if (!user || !user._id) return;
    
    try {
      await axios.put(API_ENDPOINTS.LIKE_POST(postId), {
        userId: user._id
      });
      
      setPosts((prev) => prev.map(post => {
        if (post._id === postId) {
          const hasLiked = post.likes.includes(user._id);
          return {
            ...post,
            likes: hasLiked
              ? post.likes.filter(id => id !== user._id)
              : [...post.likes, user._id]
          };
        }
        return post;
      }));
    } catch {
      alert("Error al dar like. Intenta de nuevo.");
    }
  };

  /**
   * Manejar eliminación de un post
   */
  const handleDelete = async (postId) => {
    if (!user || !user._id) return;
    
    try {
      await axios.delete(API_ENDPOINTS.DELETE_POST(postId, user._id));
      setPosts((prev) => prev.filter(post => post._id !== postId));
    } catch {
      alert("Error al eliminar el post. Intenta de nuevo.");
    }
  };

  /**
   * Manejar edición de un post
   */
  const handleEdit = async (postId, updateData) => {
    if (!user || !user._id) return;
    
    await axios.put(API_ENDPOINTS.UPDATE_POST(postId), {
      userId: user._id,
      ...updateData,
    });
    
    setPosts((prev) => prev.map(post =>
      post._id === postId ? { ...post, ...updateData } : post
    ));
  };

  return (
    <div className="home-container">
      {/* Navbar con búsqueda */}
      <Navbar
        user={user}
        followLoading={followLoading}
        onFollowUser={followUser}
        onUnfollowUser={unfollowUser}
        isFollowing={isFollowing}
      />

      {/* Feed principal */}
      <main className="feed">
        {/* Formulario para crear posts */}
        <CreatePostForm
          user={user}
          onPostCreated={handlePostCreated}
        />
        
        {/* Lista de posts */}
        <PostsList
          posts={posts}
          loading={loading}
          error={error}
          user={user}
          followingUsers={followingUsers}
          followLoading={followLoading}
          onLike={handleLike}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onFollow={followUser}
          onUnfollow={unfollowUser}
          isFollowing={isFollowing}
        />
      </main>
    </div>
  );
}
