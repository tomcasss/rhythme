import React, { useEffect, useState } from 'react'
import "./Editar_usuario.css";
import axios from 'axios';
import spotify from '../assets/spotify.png';
import soundcloud from '../assets/soundcloud.png';
import apple from '../assets/apple.png';
import youtube from '../assets/youtube.png';
import perfil from '../assets/perfil.png';

export const Editar_usuario = () => {

const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true); 

const userId = "123"; //esta linea de codigo es importante, ya que es lo que enviara a buscar la id de la persona para cargar los datos, pero podriamos cambiarlo por algo msa dinamico o un hook
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/users/${userId}`);
      setUser(res.data.data);
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, []);


  return (
   <>
<div className="contenedor">
        <header className="encabezado">
          <div className="logo">Logo</div>
        </header>

        <div className="contenido">
          <div className="columna-izquierda">
            <h2>Mi Cuenta</h2>

            {loading ? (
              <p>Cargando datos...</p>
            ) : user ? (
              <>
                <div className="perfil">
                  <img
                    src={user.profilePicture || perfil}
                    alt="Foto de perfil"
                    className="foto-perfil"
                  />
                  <div className="info-usuario">
                    <h3>{user.nombre || user.username}</h3>
                    <p className="rol">{user.rol || "Usuario"}</p>
                    <p>{user.location}</p>
                    <p>{user.email}</p>
                    <p>{user.phone || "(sin número)"}</p>
                  </div>
                </div>

                <div className="generos">
                  {(user.generos || []).map((g, i) => (
                    <p key={i}>{g}</p>
                  ))}
                </div>

                <div className="redes">
                  {user.spotify && <a href={user.spotify}><img src={spotify} alt="Spotify" /></a>}
                  {user.soundcloud && <a href={user.soundcloud}><img src={soundcloud} alt="SoundCloud" /></a>}
                  {user.applemusic && <a href={user.applemusic}><img src={apple} alt="Apple Music" /></a>}
                  {user.youtube && <a href={user.youtube}><img src={youtube} alt="YouTube" /></a>}
                </div>
              </>
        //los parentesis de abajo es un if para que si no se encuentra la ID se carga el div de abajo
            ) : (

              /*Si la ID no existe saldra de esta manera */
              <>
                <div className="perfil">
                  <img src= {perfil} alt="Foto de perfil" className="foto-perfil"
                  />
                  <div className="info-usuario">
                    <h3>Nombre del usuario</h3>
                    <p className="rol">Rol del usuario</p>
                    <p>Ubicación del usuario</p>
                    <p>Correo electrónico</p>
                    <p>Teléfono</p>
                  </div>
                </div>

           

                <div className="redes">
                <img src={spotify} alt="Spotify" />
                <img src={soundcloud} alt="SoundCloud" />
                <img src={apple} alt="Apple Music" />
                <img src={youtube} alt="YouTube" />
                </div>
              </>
            )}
          </div>

          <div className="columna-derecha">
            <div className="opciones">
              <h3>Editar mi información</h3>
            <button className="btn-opcion">Editar mi foto de perfil</button>
            <button className="btn-opcion">Editar mi nombre</button>
            <button className="btn-opcion">Editar mi contacto</button>
              <hr />
            <button className="btn-opcion">Privacidad y Seguridad</button>
            <hr />
            <button className="btn-opcion">Mis Preferencias</button>
            <hr />
            <button className="btn-opcion">Mi Actividad</button>
            <hr />
              <div className="acciones">
                <button className="reporte">Reportar un problema</button>
                <button className="cerrar-sesion">Cerrar Sesión</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
 
  )
}

