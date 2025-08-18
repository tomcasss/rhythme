import "./Home.css";
import { useEffect, useState, useCallback, useRef, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api.js";
import { useFollowSystem } from "../hooks/useFollowSystem.js";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import Navbar from "../components/Home/Navbar";
import CreatePostForm from "../components/Home/CreatePostForm";
import PostsList from "../components/Home/PostsList";
import ChatSidebar from "../components/Chat/ChatSidebar";
import ChatWindow from "../components/Chat/ChatWindow";
import SuggestedFriends from "../components/Home/SuggestedFriends";
import RecommendedPosts from "../components/Home/RecommendedPosts";
import { useSocket } from "../lib/SocketContext.js";

export default function Home() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const socket = useSocket();
  const [, startTransition] = useTransition();

  const {
    followingUsers,
    followLoading,
    isFollowing,
    followUser,
    unfollowUser,
    loadFollowingUsers,
  } = useFollowSystem(user);

  const fetchPosts = useCallback(async (userId, { cursor } = {}) => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        API_ENDPOINTS.GET_TIMELINE_POSTS(userId, { limit: 20, before: cursor })
      );
      const list = Array.isArray(res.data?.timeLinePosts) ? res.data.timeLinePosts : [];
      setNextCursor(res.data?.nextCursor || null);
      setHasMore(Boolean(res.data?.hasMore));
      if (!cursor) {
        setPosts(list);
      } else {
        setPosts((prev) => {
          const ids = new Set(prev.map((p) => p._id));
          const append = list.filter((p) => !ids.has(p._id));
          return [...prev, ...append];
        });
      }
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

  // Simple notification listener (replace with UI as desired)
  useEffect(() => {
    if (!socket) return;
    const onNotif = (n) => {
      // minimal: avoid blocking UI; just log and optional toast
      console.log('[ws] notification:new', n);
      // Optional: show a basic alert; swap with your toast system
      // alert(n?.message || 'Tienes una notificación');
    };
    socket.on('notification:new', onNotif);
    return () => socket.off('notification:new', onNotif);
  }, [socket]);

  const handlePostCreated = useCallback((newPost) => {
    setPosts( prev => [newPost, ...prev]);
  }, []);

 const handleLike = useCallback(async (postId) => {
  if (!user?._id) return;
  try {
    await axios.put(API_ENDPOINTS.LIKE_POST(postId), { userId: user._id });
    setPosts(prev =>
      prev.map(post => {
        if (post._id !== postId) return post;
        const likes = Array.isArray(post.likes) ? post.likes : [];
        const hasLiked = likes.includes(user._id);
        return { ...post, likes: hasLiked ? likes.filter(id => id !== user._id) : [...likes, user._id] };
      })
    );
  } catch {
    Swal.fire({ icon: "error", title: "Error al dar like", text: "Intenta de nuevo más tarde." });
  }
}, [user?._id]);

  const handleDelete = useCallback(async (postId) => {
  if (!user?._id) return;
  try {
    await axios.delete(API_ENDPOINTS.DELETE_POST(postId, user._id));
    setPosts(prev => prev.filter(p => p._id !== postId));
  } catch {
    Swal.fire({ icon: "error", title: "Error al eliminar el post", text: "Intenta de nuevo más tarde." });
  }
}, [user?._id]);

const handleEdit = useCallback(async (postId, updateData) => {
  if (!user?._id) return;
  try {
    await axios.put(API_ENDPOINTS.UPDATE_POST(postId), { userId: user._id, ...updateData });
    setPosts(prev => prev.map(p => (p._id === postId ? { ...p, ...updateData } : p)));
  } catch {
    Swal.fire({ icon: "error", title: "Error al editar el post", text: "Intenta de nuevo más tarde." });
  }
}, [user?._id]);

  // Realtime post updates
  useEffect(() => {
  if (!socket) return;
  const onPostEvent = (payload) => {
    startTransition(() => {
      const { type, post } = payload || {};
      if (!post?._id) return;
      setPosts(prev => {
        const exists = prev.some(p => p._id === post._id);
        if (type === 'deleted') return prev.filter(p => p._id !== post._id);
        if (!exists && type === 'created') return [post, ...prev];
        return prev.map(p => {
          if (p._id !== post._id) return p;
          const merged = { ...p, ...post };
          if (typeof post.userId === 'string' && typeof p.userId === 'object') merged.userId = p.userId;
          if (typeof post.commentsCount === 'number') merged.commentsCount = post.commentsCount;
          if (!Array.isArray(merged.likes)) merged.likes = [];
          return merged;
        });
      });
    });
  };
  socket.on('post:event', onPostEvent);
  return () => socket.off('post:event', onPostEvent);
}, [socket]);
  // Chat
  const [activeConversation, setActiveConversation] = useState(null);
  const handleOpenConversation = (conversation) => setActiveConversation(conversation);
  const handleCloseChat = () => setActiveConversation(null);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    let blocked = false;
    const obs = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry.isIntersecting) return;
      if (blocked) return;
      if (!hasMore || !nextCursor || loading || !user?._id) return;
      blocked = true;
      fetchPosts(user._id, { cursor: nextCursor }).finally(() => {
        blocked = false;
      });
    }, { root: null, rootMargin: '200px', threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, nextCursor, loading, user?._id, fetchPosts]);

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
  <div ref={sentinelRef} style={{ height: 1 }} />
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