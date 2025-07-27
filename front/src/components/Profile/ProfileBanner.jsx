// src/components/Profile/ProfileBanner.jsx
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

        <div className="banner-musico" style={{
            position: 'relative',
            marginTop: '200px', /* Eliminar margen superior */
            marginBottom: '2rem'
        }}>
            {/* Foto de portada/banner si existe */}
            {profileUser.coverPicture ? (
                <div className="cover-banner" style={{
                    width: '100%',
                    height: '300px',
                    backgroundImage: `url(${profileUser.coverPicture})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: '10px',
                    position: 'relative'
                }}>
                    {/* Overlay oscuro para mejor legibilidad */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)',
                        borderRadius: '10px'
                    }}></div>
                </div>
            ) : (
                // Cuando no hay cover picture, crear un fondo simple
                <div className="cover-banner" style={{
                    width: '100%',
                    height: '300px',
                    background: 'linear-gradient(135deg, #ff7a00 0%, #ff9500 100%)',
                    borderRadius: '10px',
                    position: 'relative'
                }}>
                    {/* Overlay sutil */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.1)',
                        borderRadius: '10px'
                    }}></div>
                </div>
            )}

            <div className="perfil-banner" style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                right: '20px',
                zIndex: 2,
                display: 'flex',
                alignItems: 'end',
                gap: '1rem'
            }}>
                <img
                    src={profileUser.profilePicture || perfil}
                    className="foto-perfil-grande"
                    alt="Perfil"
                    style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        border: '4px solid white',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                    }}
                />
                <div className="info-banner" style={{
                    color: 'white',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    flex: 1
                }}>
                    <h2 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '2rem',
                        fontWeight: 'bold'
                    }}>
                        {profileUser.username || profileUser.name || "Usuario"}
                    </h2>
                    <p style={{
                        margin: '0 0 1rem 0',
                        fontSize: '1.1rem',
                        opacity: 0.9
                    }}>
                        {profileUser.desc || profileUser.descripcion || "Sin descripción"}
                    </p>

                    {/* Información adicional del perfil */}
                    <div className="profile-info" style={{
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap'
                    }}>
                        {profileUser.from && <span>📍 {profileUser.from}</span>}
                        {profileUser.relationship && (
                            <span>💝 {
                                profileUser.relationship === 1 ? "Soltero/a" :
                                    profileUser.relationship === 2 ? "En una relación" :
                                        profileUser.relationship === 3 ? "Casado/a" : ""
                            }</span>
                        )}
                    </div>

                    {/* Estadísticas */}
                    <div className="profile-stats" style={{
                        display: 'flex',
                        gap: '2rem',
                        marginBottom: '1rem'
                    }}>
                        <div className="stat">
                            <span className="stat-number" style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: 'white'
                            }}>
                                {profileUser.followers?.length || 0}
                            </span>
                            <span className="stat-label" style={{
                                marginLeft: '0.5rem',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                Seguidores
                            </span>
                        </div>
                        <div className="stat">
                            <span className="stat-number" style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: 'white'
                            }}>
                                {profileUser.following?.length || 0}
                            </span>
                            <span className="stat-label" style={{
                                marginLeft: '0.5rem',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                Siguiendo
                            </span>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    {!isOwnProfile && (
                        <div className="botones-banner" style={{
                            display: 'flex',
                            gap: '1rem'
                        }}>
                            {isFollowing(profileUser._id) ? (
                                <button
                                    className="btn-red"
                                    onClick={handleUnfollow}
                                    disabled={followLoading}
                                    style={{
                                        background: '#dc3545',
                                        opacity: followLoading ? 0.7 : 1,
                                        padding: '0.5rem 1rem',
                                        borderRadius: '5px',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
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
                                        background: '#ff7a00',
                                        opacity: followLoading ? 0.7 : 1,
                                        padding: '0.5rem 1rem',
                                        borderRadius: '5px',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {followLoading ? 'Cargando...' : 'Seguir'}
                                </button>
                            )}
                            <button
                                className="btn-mensaje"
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: '2px solid rgba(255,255,255,0.5)',
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                Enviar un mensaje
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>


    );
}
