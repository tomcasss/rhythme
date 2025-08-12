// src/hooks/useFollowSystem.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.js';

/**
 * Hook personalizado para manejar el sistema de seguimiento
 * @param {Object} user - Usuario actual
 * @returns {Object} - Funciones y estado del sistema de seguimiento
 */
export const useFollowSystem = (user) => {
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [followLoading, setFollowLoading] = useState({});
  const [followingLoaded, setFollowingLoaded] = useState(false);

  /**
   * Cargar lista de usuarios seguidos
   */
  const loadFollowingUsers = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      const res = await axios.get(API_ENDPOINTS.GET_USER(userId));
      if (res.data.user && res.data.user.following) {
        const followingSet = new Set(res.data.user.following);
        console.log("� Usuarios seguidos cargados:", Array.from(followingSet));
        setFollowingUsers(followingSet);
      }
      setFollowingLoaded(true);
    } catch (error) {
      console.error("Error al cargar lista de seguidos:", error);
      setFollowingLoaded(true);
    }
  }, []);

  /**
   * Verificar si sigue a un usuario
   */
  const isFollowing = useCallback((targetUserId) => {
    if (!targetUserId) return false;
    
    // Convertir a string para comparación consistente
    const targetIdStr = String(targetUserId);
    const followingArray = Array.from(followingUsers).map(id => String(id));
    const hasUser = followingArray.includes(targetIdStr);
    
    /* console.log(`🔍 isFollowing(${targetIdStr}):`, {
      followingArray,
      hasUser,
      followingUsersSize: followingUsers.size
    }); */
    
    return hasUser;
  }, [followingUsers]);

  /**
   * Seguir usuario
   */
  const followUser = useCallback(async (targetUserId) => {
    if (!user || !user._id || targetUserId === user._id) return false;
    
    // Verificar si ya sigue al usuario usando isFollowing
    if (isFollowing(targetUserId)) {
      console.log("Ya sigues a este usuario");
      return false;
    }
    
    setFollowLoading(prev => ({ ...prev, [targetUserId]: true }));
    
    try {
      await axios.put(API_ENDPOINTS.FOLLOW_USER(targetUserId), {
        userId: user._id
      });
      
      // Actualizar estado local inmediatamente
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(targetUserId);
        console.log(`✅ Usuario ${targetUserId} seguido. Nuevo estado:`, Array.from(newSet));
        return newSet;
      });
      
      return true;
      
    } catch (error) {
      console.error("Error al seguir usuario:", error);
      
      if (error.response?.status === 400) {
        // El usuario ya está siendo seguido en el servidor
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.add(targetUserId);
          return newSet;
        });
        return true;
      } else if (error.response?.status === 404) {
        alert("Usuario no encontrado.");
        return false;
      } else {
        alert("Error al seguir usuario. Intenta de nuevo.");
        return false;
      }
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  }, [user, isFollowing]);

  /**
   * Dejar de seguir usuario
   */
  const unfollowUser = useCallback(async (targetUserId) => {
    if (!user || !user._id || targetUserId === user._id) return false;
    
    // Verificar si realmente sigue al usuario usando isFollowing
    if (!isFollowing(targetUserId)) {
      console.log("No sigues a este usuario");
      return false;
    }
    
    setFollowLoading(prev => ({ ...prev, [targetUserId]: true }));
    
    try {
      await axios.put(API_ENDPOINTS.UNFOLLOW_USER(targetUserId), {
        userId: user._id
      });
      
      // Actualizar estado local inmediatamente
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        console.log(`❌ Usuario ${targetUserId} no seguido. Nuevo estado:`, Array.from(newSet));
        return newSet;
      });
      
      return true;
      
    } catch (error) {
      console.error("Error al dejar de seguir usuario:", error);
      
      if (error.response?.status === 400) {
        // El usuario ya no está siendo seguido en el servidor
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(targetUserId);
          return newSet;
        });
        return true;
      } else if (error.response?.status === 404) {
        alert("Usuario no encontrado.");
        return false;
      } else {
        alert("Error al dejar de seguir usuario. Intenta de nuevo.");
        return false;
      }
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  }, [user, isFollowing]);

  return {
    followingUsers,
    followLoading,
    followingLoaded,
    isFollowing,
    followUser,
    unfollowUser,
    loadFollowingUsers
  };
};
