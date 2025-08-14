import "./Home.css";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api.js";
import { useFollowSystem } from "../hooks/useFollowSystem.js";
import Swal from "sweetalert2";
import Navbar from "../components/Home/Navbar";
import CreatePostForm from "../components/Home/CreatePostForm";
import PostsList from "../components/Home/PostsList";
import ChatSidebar from "../components/Chat/ChatSidebar";
import ChatWindow from "../components/Chat/ChatWindow";
import SuggestedFriends from "../components/Home/SuggestedFriends";
import RecommendedPosts from "../components/Home/RecommendedPosts";

export default function Home() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const {
    followingUsers,
    followLoading,
    isFollowing,
    followUser,
    unfollowUser,
    loadFollowingUsers,
  } = useFollowSystem(user);

  const fetchPosts = useCallback(async (userId) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API_ENDPOINTS.GET_TIMELINE_POSTS(userId));
      const list = Array.isArray(res.data?.timeLinePosts)
        ? [...res.data.timeLinePosts]
        : [];
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(list);
    } catch {
      setError("Error al cargar los posts. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || !userData._id) {
      navigate("/");
      return;
    }
    setUser(userData);
  }, [navigate]);

  useEffect(() => {
    if (!user?._id) return;
    fetchPosts(user._id);
    loadFollowingUsers(user._id);
  }, [user?._id, fetchPosts, loadFollowingUsers]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleLike = async (postId) => {
    if (!user?._id) return;
    try {
      await axios.put(API_ENDPOINTS.LIKE_POST(postId), { userId: user._id });
      setPosts((prev) =>
        prev.map((post) => {
          if (post._id === postId) {
            const likes = Array.isArray(post.likes) ? post.likes : [];
            const hasLiked = likes.includes(user._id);
            return {
              ...post,
              likes: hasLiked
                ? likes.filter((id) => id !== user._id)
                : [...likes, user._id],
            };
          }
          return post;
        })
      );
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al dar like",
        text: "Intenta de nuevo más tarde.",
      });
    }
  };

  const handleDelete = async (postId) => {
    if (!user?._id) return;
    try {
      await axios.delete(API_ENDPOINTS.DELETE_POST(postId, user._id));
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al eliminar el post",
        text: "Intenta de nuevo más tarde.",
      });
    }
  };

  const handleEdit = async (postId, updateData) => {
    if (!user?._id) return;
    try {
      await axios.put(API_ENDPOINTS.UPDATE_POST(postId), {
        userId: user._id,
        ...updateData,
      });
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, ...updateData } : p))
      );
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al editar el post",
        text: "Intenta de nuevo más tarde.",
      });
    }
  };

  // Chat
  const [activeConversation, setActiveConversation] = useState(null);
  const handleOpenConversation = (conversation) => setActiveConversation(conversation);
  const handleCloseChat = () => setActiveConversation(null);

return (
  <div className="home-container">
    <Navbar
      user={user}
      followLoading={followLoading}
      onFollowUser={followUser}
      onUnfollowUser={unfollowUser}
      isFollowing={isFollowing}
    />

    <div className="home-grid">
      {/* IZQUIERDA: sugerencias y recomendados */}
      <aside className="left-sidebar">
        <SuggestedFriends
          user={user}
          onFollow={followUser}
          onUnfollow={unfollowUser}
          isFollowing={isFollowing}
          followLoading={followLoading}
        />
        <RecommendedPosts
          user={user}
          followingUsers={followingUsers}
          followLoading={followLoading}
          onLike={handleLike}
          onFollow={followUser}
          onUnfollow={unfollowUser}
          isFollowing={isFollowing}
        />
      </aside>

      {/* CENTRO: feed */}
      <main className="feed">
        <CreatePostForm user={user} onPostCreated={handlePostCreated} />
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

      {/* DERECHA: chat/mensajes */}
      <aside className="right-sidebar">
        {user && (
          <ChatSidebar
            currentUser={user}
            onOpenConversation={handleOpenConversation}
          />
        )}
      </aside>
    </div>

    {user && activeConversation && (
      <ChatWindow
        currentUser={user}
        conversation={activeConversation}
        onClose={handleCloseChat}
      />
    )}
  </div>
);
}