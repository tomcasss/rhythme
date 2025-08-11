// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import { Perfil_usuario } from './pages/Perfil_usuario.jsx';
import Editar_usuario from './pages/Editar_usuario.jsx';
import SpotifyCallback from './components/SpotifyCallback';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile/:userId" element={<Perfil_usuario />} />
        <Route path="/edit-profile" element={<Editar_usuario />} />
        <Route path="/callback/spotify" element={<SpotifyCallback />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
