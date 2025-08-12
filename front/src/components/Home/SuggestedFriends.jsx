// src/components/Home/SuggestedFriends.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import './SuggestedFriends.css';
import './Sidebar.css';


export default function SuggestedFriends({ user, limit = 5, onFollow, onUnfollow, isFollowing, followLoading }) {
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
        {suggestions.map(friendSuggestion => (
          <div key={friendSuggestion._id} className="suggested-card">
            {friendSuggestion.profilePicture ? (
              <img
                src={friendSuggestion.profilePicture}
                alt={friendSuggestion.username || 'usuario'}
                className="suggested-avatar"
              />
            ) : (
              <FontAwesomeIcon icon={faCircleUser} className="suggested-avatar" />
            )}
            <div className="suggested-info">
              <div className="suggested-name">{friendSuggestion.username || 'Usuario'}</div>
              <div className="suggested-email">{friendSuggestion.email}</div>
            </div>
            {friendSuggestion._id === user._id ? (
              <span className="suggested-self">Tú</span>
            ) : isFollowing(friendSuggestion._id) ? (
              <button
                onClick={() => onUnfollow(friendSuggestion._id)}
                disabled={followLoading[friendSuggestion._id]}
                className="suggested-btn following"
              >
                {followLoading[friendSuggestion._id] ? '...' : 'Siguiendo'}
              </button>
            ) : (
              <button
                onClick={() => onFollow(friendSuggestion._id)}
                disabled={followLoading[friendSuggestion._id]}
                className="suggested-btn follow"
              >
                {followLoading[friendSuggestion._id] ? '...' : 'Seguir'}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
