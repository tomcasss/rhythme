// src/components/Edit/EditHeader.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBell } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/logoR.png';
import './EditHeader.css';
/**
 * Componente EditHeader - Header para la página de edición de usuario
 * @param {Object} props - Propiedades del componente

 */
export default function EditHeader() {
    const navigate = useNavigate();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuOpen && !event.target.closest('.user')) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
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
