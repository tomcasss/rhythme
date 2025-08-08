// src/components/Home/SuggestedFriends.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import userImg from '../../assets/user.png';
import { API_ENDPOINTS } from '../../config/api.js';
import './SuggestedFriends.css';
import './Sidebar.css';

export default function SuggestedFriends({ user, limit = 8, onFollow, onUnfollow, isFollowing, followLoading }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!user?._id) return;
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(API_ENDPOINTS.FRIEND_RECOMMENDATIONS(user._id, limit));
        setSuggestions(res.data.suggestions || []);
      } catch {
        setError('No se pudieron cargar sugerencias.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?._id, limit]);

  if (loading) return <p>Cargando sugerencias...</p>;
  if (error) return <p className="suggested-error">{error}</p>;
  if (!suggestions.length) return null;

  return (
    <section className="suggested-section sidebar-box">
      <h3 className="suggested-title sidebar-title">Personas que quizá conozcas</h3>
      <div className="suggested-grid">
        {suggestions.map(u => (
          <div key={u._id} className="suggested-card">
            <img src={u.profilePicture || userImg} alt={u.username || 'usuario'} className="suggested-avatar" />
            <div className="suggested-info">
              <div className="suggested-name">{u.username || 'Usuario'}</div>
              <div className="suggested-email">{u.email}</div>
            </div>
            {u._id === user._id ? (
              <span className="suggested-self">Tú</span>
            ) : isFollowing(u._id) ? (
              <button
                onClick={() => onUnfollow(u._id)}
                disabled={followLoading[u._id]}
                className="suggested-btn following"
              >
                {followLoading[u._id] ? '...' : 'Siguiendo'}
              </button>
            ) : (
              <button
                onClick={() => onFollow(u._id)}
                disabled={followLoading[u._id]}
                className="suggested-btn follow"
              >
                {followLoading[u._id] ? '...' : 'Seguir'}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
