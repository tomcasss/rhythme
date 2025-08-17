// src/components/Profile/ProfileBanner.jsx
import perfil from '../../assets/perfil.png';
import './ProfileBanner.css';
import MusicPreferencesChips from './MusicPreferencesChips.jsx';
import { useState } from 'react';
import ImageModal from '../common/ImageModal.jsx';

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
    const [showAvatarModal, setShowAvatarModal] = useState(false);

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
        <div className="banner-musico profile-banner-container">
            {/* Foto de portada/banner si existe */}
            {profileUser.coverPicture ? (
                <div className="cover-banner has-image" style={{ backgroundImage: `url(${profileUser.coverPicture})` }}>
                    {/* Overlay oscuro para mejor legibilidad */}
                    <div className="cover-overlay" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' }}></div>
                </div>
            ) : (
                // Cuando no hay cover picture, crear un fondo simple
                <div className="cover-banner">
                    {/* Overlay sutil */}
                    <div className="cover-overlay"></div>
                </div>
            )}

            <div className="perfil-banner">
                <img
                    src={profileUser.profilePicture || perfil}
                    className="foto-perfil-grande"
                    alt="Perfil"
                    onClick={() => (profileUser.profilePicture ? setShowAvatarModal(true) : null)}
                    style={{ cursor: profileUser.profilePicture ? 'pointer' : 'default' }}
                    title={profileUser.profilePicture ? 'Ver imagen' : undefined}
                />
                <div className="info-banner">
                    <h2>
                        {profileUser.username || profileUser.name || "Usuario"}
                    </h2>
                    <p>
                        {profileUser.desc || profileUser.descripcion || "Sin descripción"}
                    </p>

                    {/* Información adicional del perfil */}
                    <div className="profile-info">
                        {profileUser.from && <span>📍 {profileUser.from}</span>}
                        {profileUser.relationship && (
                            <span>🎵 {
                                profileUser.relationship === 1 ? "Creador de música" :
                                    profileUser.relationship === 2 ? "Promotor" :
                                        profileUser.relationship === 3 ? "Amante de la música" :
                                            profileUser.relationship === 4 ? "Educador" :
                                                profileUser.relationship === 5 ? "Comunidad y cultura" :
                                                    ""
                            }</span>
                        )}
                        <MusicPreferencesChips musicPreferences={profileUser.musicPreferences} />
                    </div>

                    {/* Estadísticas */}
                    <div className="profile-stats">
                        <div className="stat">
                            <span className="stat-number">
                                {profileUser.followers?.length || 0}
                            </span>
                            <span className="stat-label">
                                Seguidores
                            </span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">
                                {profileUser.following?.length || 0}
                            </span>
                            <span className="stat-label">
                                Siguiendo
                            </span>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    {!isOwnProfile && (
                        <div className="botones-banner">
                            {isFollowing(profileUser._id) ? (
                                <button
                                    className="btn-red btn-unfollow"
                                    onClick={handleUnfollow}
                                    disabled={followLoading}
                                >
                                    {followLoading ? 'Cargando...' : 'Dejar de seguir'}
                                </button>
                            ) : (
                                <button
                                    className="btn-red btn-follow"
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                >
                                    {followLoading ? 'Cargando...' : 'Seguir'}
                                </button>
                            )}
                            <button className="btn-mensaje">
                                Enviar un mensaje
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {showAvatarModal && (
                <ImageModal src={profileUser.profilePicture} alt="Foto de perfil" onClose={() => setShowAvatarModal(false)} />
            )}
        </div>
    );
}
