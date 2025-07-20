// Test temporario para debug
// Esta es una página temporal para hacer debug del sistema de seguimiento

import React, { useEffect } from 'react';
import { useFollowSystem } from '../hooks/useFollowSystem.js';

const TestFollowSystem = () => {
  const user = { _id: "test-user-id" };
  const { followingUsers, isFollowing, loadFollowingUsers } = useFollowSystem(user);

  useEffect(() => {
    console.log("🔧 Test Component - Estado actual:", {
      followingUsers: Array.from(followingUsers),
      size: followingUsers.size
    });
  }, [followingUsers]);

  const testUserId = "test-target-user";

  return (
    <div style={{ padding: '20px' }}>
      <h2>Debug del Sistema de Seguimiento</h2>
      <p>Usuario actual: {user._id}</p>
      <p>Usuarios seguidos: {Array.from(followingUsers).join(', ')}</p>
      <p>Total seguidos: {followingUsers.size}</p>
      
      <button onClick={() => loadFollowingUsers(user._id)}>
        Cargar Following
      </button>
      
      <button onClick={() => {
        const result = isFollowing(testUserId);
        console.log(`¿Sigue a ${testUserId}?`, result);
      }}>
        Test isFollowing
      </button>
    </div>
  );
};

export default TestFollowSystem;
