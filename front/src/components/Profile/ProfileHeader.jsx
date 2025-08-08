// src/components/Profile/ProfileHeader.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBell } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/logoR.png';
import './ProfileHeader.css';

/**
 * Componente ProfileHeader - Header de la página de perfil
 */
export default function ProfileHeader() {
    const navigate = useNavigate();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);



    // Cerrar menú de usuario al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
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
                <div className="logo-area logo-clickable" onClick={() => navigate("/home")}>
                    <img src={logo} alt="RhythMe logo" className="logo1" />
                </div>

                <div className="iconos-header">

                    {/* Menú de usuario */}
                    <span className="icon user user-menu-trigger">
                        <FontAwesomeIcon icon={faBell} className="icon-gap" />
                        <button
                            className="action-btn icon-btn"
                            onClick={() => setUserMenuOpen((v) => !v)}
                        >
                            <FontAwesomeIcon icon={faUser} className="icon-gap" />
                        </button>
                        {userMenuOpen && (
                            <div className="user-menu">
                                <button
                                    className="action-btn"
                                    onClick={() => navigate('/edit-profile')}
                                >
                                    Editar perfil
                                </button>
                                <button
                                    className="action-btn"
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
