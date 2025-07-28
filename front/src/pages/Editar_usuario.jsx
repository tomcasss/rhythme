import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import "./Editar_usuario.css";
import axios from 'axios';
import { API_ENDPOINTS } from "../config/api.js";

// Componentes
import EditHeader from "../components/Edit/EditHeader";
import EditProfile from "../components/Edit/EditProfile";
import EditOptions from "../components/Edit/EditOptions";
import SpotifyConnection from "../components/Profile/SpotifyConnection";

export const Editar_usuario = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Inicialización - obtener usuario actual del localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || !userData._id) {
      navigate("/");
      return;
    }

    setCurrentUser(userData);
    fetchUserData(userData._id);
  }, [navigate]);

  // Obtener datos actuales del usuario desde el backend
  const fetchUserData = async (userId) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API_ENDPOINTS.GET_USER(userId));
      setUser(response.data.user);
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
      setError("No se pudieron cargar los datos del usuario");
    } finally {
      setLoading(false);
    }
  };


  // Manejar actualización de usuario
  const handleUpdateUser = async (updatedData) => {
    if (!currentUser?._id) return { success: false, message: "Usuario no encontrado" };

    try {
      // Si es solo un refresh (datos vacíos o con flag refresh), solo recargar datos
      if (!updatedData || Object.keys(updatedData).length === 0 || updatedData.refresh) {
        await fetchUserData(currentUser._id);
        return { success: true, message: "Datos actualizados correctamente" };
      }

      // Si hay datos reales para actualizar
      const response = await axios.put(API_ENDPOINTS.UPDATE_USER(currentUser._id), updatedData);

      if (response.data && response.data.user) {
        setUser(response.data.user);

        // Actualizar localStorage con los datos completos del usuario
        const updatedUserData = { ...currentUser, ...response.data.user };
        localStorage.setItem("user", JSON.stringify(updatedUserData));
        setCurrentUser(updatedUserData);

        // Recargar datos del usuario desde el backend para asegurar sincronización
        await fetchUserData(currentUser._id);

        return { success: true, user: response.data.user, message: "Usuario actualizado correctamente" };
      } else {
        return { success: false, message: "Respuesta inválida del servidor" };
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar el usuario"
      };
    }
  };

  // Manejar logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="contenedor">
        <EditHeader onBack={() => navigate('/home')} />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contenedor">
        <EditHeader onBack={() => navigate('/home')} />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#e74c3c' }}>{error}</p>
          <button onClick={() => navigate('/home')} className="btn-opcion">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor">
      <EditHeader onBack={() => navigate('/home')} />

      <div className="contenido-editar">
        <div className='columna-izquierda'>
          <EditProfile
            user={user}
            onUpdateUser={handleUpdateUser}
          />
          
          {/* Componente de conexión con Spotify */}
          <SpotifyConnection 
            userId={user._id} 
            isCurrentUser={true} 
          />
        </div>



        <div className='columna-derecha'>
          <EditOptions
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
          />
        </div>
      </div>
    </div>

  );
}

