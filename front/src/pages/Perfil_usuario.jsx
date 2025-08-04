// src/pages/Perfil_usuario.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./Perfil_usuario.css";
import { API_ENDPOINTS } from "../config/api.js";
import { useFollowSystem } from "../hooks/useFollowSystem.js";

// Componentes
import ProfileHeader from "../components/Profile/ProfileHeader";
import ProfileBanner from "../components/Profile/ProfileBanner";
import ProfileContent from "../components/Profile/ProfileContent";
import SpotifyConnection from "../components/Profile/SpotifyConnection";
import ErrorBoundary from "../components/ErrorBoundary";

/**
 * Componente Perfil_usuario - Página de perfil de usuario
 */
export const Perfil_usuario = () => {
  const { userId } = useParams(); // ID del usuario del perfil a mostrar
  const navigate = useNavigate();
  
  // Estados
  const [profileUser, setProfileUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sistema de seguimiento
  const {
    followLoading,
    isFollowing,
    followUser,
    unfollowUser,
    loadFollowingUsers
  } = useFollowSystem(currentUser);

  // Inicialización
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || !userData._id) {
      navigate("/");
      return;
    }
    
    setCurrentUser(userData);
    loadFollowingUsers(userData._id);
  }, [navigate, loadFollowingUsers]);

  // Cargar datos del usuario del perfil
  useEffect(() => {
    const fetchProfileUser = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError("");
      
      try {
        const res = await axios.get(API_ENDPOINTS.GET_USER(userId));
        setProfileUser(res.data.user);
      } catch (error) {
        console.error("Error al obtener el usuario:", error);
        setError("No se pudo cargar el perfil del usuario");
        setProfileUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileUser();
  }, [userId]);

  // Verificar si es el propio perfil
  const isOwnProfile = currentUser && profileUser && currentUser._id === profileUser._id;

  // Estado de carga del seguimiento específico para este usuario
  const userFollowLoading = profileUser ? followLoading[profileUser._id] || false : false;

  if (loading) {
    return (
      <div className="contenedor">
        <ProfileHeader />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contenedor">
        <ProfileHeader />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#e74c3c' }}>{error}</p>
          <button onClick={() => navigate('/home')} className="btn-red">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor">
      <ProfileHeader />
      
      <ProfileBanner
        profileUser={profileUser}
        isOwnProfile={isOwnProfile}
        onFollow={followUser}
        onUnfollow={unfollowUser}
        isFollowing={isFollowing}
        followLoading={userFollowLoading}
      />
      
      {/* Componente de conexión con Spotify */}
      <div style={{ padding: '0 2rem', flex: 1 }}>
        {/* Contenedor principal con layout side-by-side */}
        <div className="profile-content-layout" style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {/* Spotify Connection - lado izquierdo */}
          <div className="spotify-section" style={{ 
            flex: '2',
            minWidth: '300px',
            maxWidth: '1000px'
          }}>
            <ErrorBoundary>
              <SpotifyConnection 
                userId={userId} 
                isCurrentUser={isOwnProfile} 
              />
            </ErrorBoundary>
          </div>
          
          {/* Profile Content buttons - lado derecho */}
          <div className="profile-buttons-section" style={{ 
            flex: '1',
            minWidth: '200px'
          }}>
            <ProfileContent userId={userId} />
          </div>
        </div>
      </div>
      
      
    </div>
  );
};