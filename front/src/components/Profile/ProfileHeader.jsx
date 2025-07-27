// src/components/Profile/ProfileHeader.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBell } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/logoR.png';

/**
 * Componente ProfileHeader - Header de la página de perfil
 */
export default function ProfileHeader() {
    const navigate = useNavigate();
    const [userMenuOpen, setUserMenuOpen] = useState(false);



    // Cerrar menú de usuario al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuOpen && !userMenuOpen.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [userMenuOpen]);

    /**
     * Cerrar sesión del usuario
     */
    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <div className="contenedor">
            <header className="navbar">
                <div className="logo-area" style={{ cursor: "pointer" }} onClick={() => navigate("/home")}>
                    <img src={logo} alt="RhythMe logo" className="logo1" />
                </div>

                <div className="iconos-header">

                    {/* Menú de usuario */}
                    <span className="icon user" style={{ position: 'relative' }}>
                        <FontAwesomeIcon icon={faBell} style={{ marginRight: "1rem" }} />
                        <button
                            className="action-btn"
                            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
                            onClick={() => setUserMenuOpen((v) => !v)}
                        >
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: "1rem" }} />
                        </button>
                        {userMenuOpen && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 30,
                                    right: 0,
                                    background: '#fff',
                                    border: '1px solid #eee',
                                    borderRadius: 8,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    padding: '0.5rem',
                                    minWidth: 120,
                                    zIndex: 10
                                }}
                            >
                                <button
                                    className="action-btn"
                                    style={{ width: '100%', textAlign: 'left', padding: '0.5rem', color: '#e82c0b', borderBottom: '1px solid #eee' }}
                                    onClick={() => navigate('/edit-profile')}
                                >
                                    Editar perfil
                                </button>
                                <button
                                    className="action-btn"
                                    style={{ width: '100%', textAlign: 'left', color: '#e82c0b' }}
                                    onClick={handleLogout}
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        )}
                    </span>
                </div>
            </header>
        </div>
    );
}
