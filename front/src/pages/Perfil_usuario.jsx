import React, { useEffect, useState } from 'react'
import "./Perfil_usuario.css";
import spotify from '../assets/spotify.png';
import soundcloud from '../assets/soundcloud.png';
import apple from '../assets/apple.png';
import youtube from '../assets/youtube.png';
import perfil from '../assets/perfil.png';


export const Perfil_usuario = () => {
  
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
        {/* Header */}
        <header className="encabezado">
          <div className="logo">Logo</div>
          <div className="barra-busqueda"></div>
          <div className="iconos-header">
            <i className="fas fa-user"></i>
            <i className="fas fa-bell"></i>
          </div>
        </header>

        {loading ? (
          <p>Cargando datos...</p>
        ) : user ? (
          <>
           
            <div className="banner-musico">
              <div className="perfil-banner">
                <img
                  src={user.profilePicture || perfil}
                  className="foto-perfil-grande"
                  alt="Perfil"
                />
                <div className="info-banner">
                  <h2>{user.nombre || "Juan Pérez Vargas"}</h2>
                  <p>{user.descripcion || "Cantante / Compositor"}</p>
                  <div className="botones-banner">
                    <button className="btn-red">Añadir a mi red</button>
                    <button className="btn-mensaje">Enviar un mensaje</button>
                  </div>
                  <div className="redes-banner">
                    {user.spotify && <a href={user.spotify}><img src={spotify} alt="Spotify" /></a>}
                    {user.soundcloud && <a href={user.soundcloud}><img src={soundcloud} alt="SoundCloud" /></a>}
                    {user.applemusic && <a href={user.applemusic}><img src={apple} alt="Apple Music" /></a>}
                    {user.youtube && <a href={user.youtube}><img src={youtube} alt="YouTube" /></a>}
                  </div>
                </div>
              </div>
            </div>

            
        <div className="contenido-musico">
            <div className="galeria-musico">
            <button className="tarjeta tarjeta-btn">
            <h4>Albums</h4>
            <img src={perfil} alt="Album" />
            </button>

            <button className="tarjeta tarjeta-btn">
            <h4>Playlists</h4>
            <img src={perfil} alt="Playlist" />
            </button>

            <button className="tarjeta tarjeta-btn">
            <h4>Fotos</h4>
            <img src={perfil} alt="Fotos" />
            </button>
        </div>

            </div>
          </>
          //los parentesis de abajo es un if para que si no se encuentra la ID se carga el div de abajo
        ) : ( 
            /*Si la ID no existe saldra de esta manera */
          <>
            
            <div className="banner-musico">
              <div className="perfil-banner">
                <img
                  src={perfil}
                  className="foto-perfil-grande"
                  alt="Perfil"
                />
                <div className="info-banner">
                  <h3>Nombre del usuario</h3>
                  <p className="rol">Rol del usuario</p>
                  <div className="botones-banner">
                    <button className="btn-red">Añadir a mi red</button>
                    <button className="btn-mensaje">Enviar un mensaje</button>
                  </div>
                  <div className="redes-banner">
                    <img src={spotify} alt="Spotify" />
                    <img src={soundcloud} alt="SoundCloud" />
                    <img src={apple} alt="Apple Music" />
                    <img src={youtube} alt="YouTube" />
                  </div>
                </div>
              </div>
            </div>

           
           <div className="contenido-musico">
            <div className="galeria-musico">
            <button className="tarjeta tarjeta-btn">
            <h4>Albums</h4>
            <img src={perfil} alt="Album" />
            </button>

            <button className="tarjeta tarjeta-btn">
            <h4>Playlists</h4>
            <img src={perfil} alt="Playlist" />
            </button>

            <button className="tarjeta tarjeta-btn">
            <h4>Fotos</h4>
            <img src={perfil} alt="Fotos" />
            </button>
        </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};