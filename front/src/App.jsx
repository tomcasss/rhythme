// src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import { Perfil_usuario } from './pages/Perfil_usuario.jsx';
import Editar_usuario from './pages/Editar_usuario.jsx';
import PostDetail from './pages/PostDetail.jsx';
import SpotifyCallback from './components/SpotifyCallback';
import PostView from './pages/PostView';
import SocketProvider from './lib/SocketProvider.jsx';

function App() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  useEffect(() => {
    const onUserUpdated = () =>
      setUser(JSON.parse(localStorage.getItem('user') || 'null'));

    window.addEventListener('user-updated', onUserUpdated);
    window.addEventListener('storage', onUserUpdated);
    return () => {
      window.removeEventListener('user-updated', onUserUpdated);
      window.removeEventListener('storage', onUserUpdated);
    };
  }, []);

  return (
    <SocketProvider key={user?._id || 'nouser'} user={user}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile/:userId" element={<Perfil_usuario />} />
          <Route path="/edit-profile" element={<Editar_usuario />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="/callback/spotify" element={<SpotifyCallback />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/post/:postId" element={<PostView />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
