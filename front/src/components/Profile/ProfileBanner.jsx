// src/components/Profile/ProfileBanner.jsx
import spotify from '../../assets/spotify.png';
import soundcloud from '../../assets/soundcloud.png';
import apple from '../../assets/apple.png';
import youtube from '../../assets/youtube.png';
import perfil from '../../assets/perfil.png';

/**
 * Componente ProfileBanner - Banner principal del perfil de usuario
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.profileUser - Datos del usuario del perfil
 * @param {Object} props.currentUser - Usuario actual logueado
 * @param {boolean} props.isOwnProfile - Si es el propio perfil del usuario
 * @param {Function} props.onFollow - Función para seguir usuario
 * @param {Function} props.onUnfollow - Función para dejar de seguir usuario
 * @param {Function} props.isFollowing - Función para verificar si sigue al usuario
 * @param {boolean} props.followLoading - Estado de carga del seguimiento
 */
export default function ProfileBanner({
    profileUser,
    isOwnProfile,
    onFollow,
    onUnfollow,
    isFollowing,
    followLoading
}) {

    /**
     * Manejar seguir usuario
     */
    const handleFollow = () => {
        if (profileUser && profileUser._id) {
            onFollow(profileUser._id);
        }
    };

    /**
     * Manejar dejar de seguir usuario
     */
    const handleUnfollow = () => {
        if (profileUser && profileUser._id) {
            onUnfollow(profileUser._id);
        }
    };

    if (!profileUser) {
        return (
            <div className="banner-musico">
                <div className="perfil-banner">
                    <img src={perfil} className="foto-perfil-grande" alt="Perfil" />
                    <div className="info-banner">
                        <h3>Usuario no encontrado</h3>
                        <p className="rol">El perfil que buscas no existe</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="banner-musico">
                <div className="perfil-banner">
                    <img
                        src={profileUser.profilePicture || perfil}
                        className="foto-perfil-grande"
                        alt="Perfil"
                    />
                    <div className="info-banner">
                        <h2>{profileUser.username || profileUser.name || "Usuario"}</h2>
                        <p>{profileUser.desc || profileUser.descripcion || "Sin descripción"}</p>

                        {/* Botones de acción */}
                        {!isOwnProfile && (
                            <div className="botones-banner">
                                {isFollowing(profileUser._id) ? (
                                    <button
                                        className="btn-red"
                                        onClick={handleUnfollow}
                                        disabled={followLoading}
                                        style={{
                                            background: '#dc3545',
                                            opacity: followLoading ? 0.7 : 1
                                        }}
                                    >
                                        {followLoading ? 'Cargando...' : 'Dejar de seguir'}
                                    </button>
                                ) : (
                                    <button
                                        className="btn-red"
                                        onClick={handleFollow}
                                        disabled={followLoading}
                                        style={{
                                            opacity: followLoading ? 0.7 : 1
                                        }}
                                    >
                                        {followLoading ? 'Cargando...' : 'Seguir'}
                                    </button>
                                )}
                                <button className="btn-mensaje">Enviar un mensaje</button>
                            </div>
                        )}

                        {/* Redes sociales */}
                        <div className="redes-banner">
                            {profileUser.spotify && (
                                <a href={profileUser.spotify} target="_blank" rel="noopener noreferrer">
                                    <img src={spotify} alt="Spotify" />
                                </a>
                            )}
                            {profileUser.soundcloud && (
                                <a href={profileUser.soundcloud} target="_blank" rel="noopener noreferrer">
                                    <img src={soundcloud} alt="SoundCloud" />
                                </a>
                            )}
                            {profileUser.applemusic && (
                                <a href={profileUser.applemusic} target="_blank" rel="noopener noreferrer">
                                    <img src={apple} alt="Apple Music" />
                                </a>
                            )}
                            {profileUser.youtube && (
                                <a href={profileUser.youtube} target="_blank" rel="noopener noreferrer">
                                    <img src={youtube} alt="YouTube" />
                                </a>
                            )}
                        </div>

                        {/* Estadísticas */}
                        <div className="profile-stats">
                            <div className="stat">
                                <span className="stat-number">{profileUser.followers?.length || 0}</span>
                                <span className="stat-label"> Seguidores</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">{profileUser.following?.length || 0}</span>
                                <span className="stat-label"> Siguiendo</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}
