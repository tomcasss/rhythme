// src/pages/Perfil_usuario.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from "../config/api.js";
import { useFollowSystem } from "../hooks/useFollowSystem.js";
import NavBar from "../components/Home/Navbar.jsx";
import Swal from 'sweetalert2';

// Componentes
import ProfileBanner from "../components/Profile/ProfileBanner";
import ProfileContent from "../components/Profile/ProfileContent";
import "../components/Profile/ProfileContent.css";
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
        const currentLocal = JSON.parse(localStorage.getItem('user'));
        const res = await axios.get(`${API_ENDPOINTS.GET_USER(userId)}?viewerId=${currentLocal?._id || ''}`);
        setProfileUser(res.data.user);
      } catch (error) {
        // Si es mi propio perfil y recibo 403, reintentar sin restricción (podría ser un estado inconsistente local)
        const currentLocal = JSON.parse(localStorage.getItem('user'));
        if (currentLocal?._id === userId && error?.response?.status === 403) {
          try {
            const res2 = await axios.get(`${API_ENDPOINTS.GET_USER(userId)}?viewerId=${userId}`);
            setProfileUser(res2.data.user);
            setError('');
            return;
          } catch (e2) {
            console.error('Retry failed:', e2);
          }
        }
        console.error("Error al obtener el usuario:", error);
        setError(error?.response?.status === 403 ? 'Este perfil es privado' : 'No se pudo cargar el perfil del usuario');
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
        <NavBar
          user={currentUser}
          followLoading={followLoading}
          onFollowUser={followUser}
          onUnfollowUser={unfollowUser}
          isFollowing={isFollowing}
        />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contenedor">
        <NavBar
          user={currentUser}
          followLoading={followLoading}
          onFollowUser={followUser}
          onUnfollowUser={unfollowUser}
          isFollowing={isFollowing}
        />
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
      <NavBar
        user={currentUser}
        followLoading={followLoading}
        onFollowUser={followUser}
        onUnfollowUser={unfollowUser}
        isFollowing={isFollowing}
      />
      
      <ProfileBanner
        profileUser={profileUser}
        isOwnProfile={isOwnProfile}
        onFollow={followUser}
        onUnfollow={unfollowUser}
        isFollowing={isFollowing}
        followLoading={userFollowLoading}
      />
      {/* Botón reportar (si no es propio perfil) */}
      {!isOwnProfile && currentUser && profileUser && (
        <div style={{ padding: '0 2rem', marginBottom: '1rem' }}>
          <button
            className="btn-red"
            style={{ background: '#e74c3c', padding: '0.5rem 1rem', borderRadius: 6 }}
            onClick={async () => {
              const { value: reason } = await Swal.fire({
                title: 'Reportar usuario',
                input: 'text',
                inputLabel: 'Motivo breve',
                inputPlaceholder: 'Spam, abuso, etc.',
                showCancelButton: true,
                confirmButtonText: 'Enviar',
                cancelButtonText: 'Cancelar'
              });
              if (!reason) return;
              try {
                await axios.post(API_ENDPOINTS.REPORT_USER(profileUser._id), { userId: currentUser._id, reason });
                Swal.fire('Enviado', 'Reporte registrado', 'success');
              } catch (e) {
                if (e?.response?.status === 429) {
                  Swal.fire('Ya enviado', 'Ya reportaste este usuario en las últimas 24h', 'info');
                } else {
                  Swal.fire('Error', 'No se pudo enviar el reporte', 'error');
                }
              }
            }}
          >Reportar usuario</button>
        </div>
      )}
      
      {/* Componente de conexión con Spotify */}
  <div style={{ padding: '0 2rem', flex: 1 }}>
        {/* Contenedor principal con layout side-by-side */}
  <div className="profile-content-layout">
          {/* Spotify Connection - lado izquierdo */}
          <div className="spotify-section left-panel-wide">
            <ErrorBoundary>
              <SpotifyConnection 
                userId={userId} 
                isCurrentUser={isOwnProfile} 
              />
            </ErrorBoundary>
          </div>
          
          {/* Profile Content buttons - lado derecho */}
          <div className="profile-buttons-section right-panel-narrow">
            <ProfileContent
              userId={userId}
              viewerUser={currentUser}
              followLoading={followLoading}
              isFollowing={isFollowing}
              onFollow={followUser}
              onUnfollow={unfollowUser}
            />
          </div>
        </div>
      </div>
      
      
    </div>
  );
};