// src/pages/PostDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.js';
import Navbar from '../components/Home/Navbar.jsx';
import PostCard from '../components/Home/PostCard.jsx';
import { useFollowSystem } from '../hooks/useFollowSystem.js';
import './PostDetail.css';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { followLoading, isFollowing, followUser, unfollowUser, loadFollowingUsers } = useFollowSystem(currentUser);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || !userData._id) {
      navigate('/');
      return;
    }
    setCurrentUser(userData);
    loadFollowingUsers(userData._id);
  }, [navigate, loadFollowingUsers]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(API_ENDPOINTS.GET_POST(postId));
        setPost(res.data.post || res.data);
      } catch (err) {
        console.error('Error obteniendo post:', err);
        setError('No se pudo cargar el post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  // Placeholder handlers simplificados (puedes extender luego)
  const handleLike = async () => {};
  const handleDelete = async () => {};
  const handleEdit = async () => {};

  if (loading) {
    return (
      <div className="contenedor">
        <Navbar user={currentUser} followLoading={followLoading} onFollowUser={followUser} onUnfollowUser={unfollowUser} isFollowing={isFollowing} />
        <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="contenedor">
        <Navbar user={currentUser} followLoading={followLoading} onFollowUser={followUser} onUnfollowUser={unfollowUser} isFollowing={isFollowing} />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#e74c3c' }}>{error || 'Post no encontrado'}</p>
          <button className="btn-opcion" onClick={() => navigate('/home')}>Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor">
      <Navbar user={currentUser} followLoading={followLoading} onFollowUser={followUser} onUnfollowUser={unfollowUser} isFollowing={isFollowing} />
    <div className='post-detail'>
        <h2>Detalle del Post</h2>
        <PostCard
          post={post}
          user={currentUser}
          followLoading={followLoading}
          onLike={handleLike}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onFollow={followUser}
          onUnfollow={unfollowUser}
          isFollowing={isFollowing}

        />
      </div>
    </div>
  );
}
