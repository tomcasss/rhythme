import './Login.css';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logoRblanco.png';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/home');
  };

return (
    <div className="login-container">
      <img src={logo} alt="RhythMe logo" className="logo" />

      <div className="left-section">
        <h1 className="main-title">Bienvenido a RhythMe</h1>
        <p className="main-sub">Explora, comparte y vive la música como nunca antes.</p>
      </div>

    <div className="right-section">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Correo o Usuario" required />
          <input type="password" placeholder="Contraseña" required />
          <button type="submit">Ingresar</button>
        </form>
        <p className="registro">
          ¿No tienes cuenta? <a href="#">Regístrate</a>
        </p>
      </div>
    </div>
  </div>
);

}
