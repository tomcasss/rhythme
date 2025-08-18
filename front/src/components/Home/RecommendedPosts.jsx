import { Virtuoso } from 'react-virtuoso';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api.js';
import PostCard from './PostCard';

import './RecommendedPosts.css';
import './Sidebar.css';

export default function RecommendedPosts({ user, limit = 5, followLoading, onLike, onFollow, onUnfollow, isFollowing }) {
  const [reco, setReco] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!user?._id) return;
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(API_ENDPOINTS.GET_RECOMMENDED_POSTS(user._id, limit));
        setReco(res.data.posts || []);
      } catch {
        setError('No se pudieron cargar las recomendaciones.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?._id, limit]);

  if (loading) return <p>Cargando recomendaciones...</p>;
  if (error) return <p className="reco-error">{error}</p>;
  if (!reco.length) return null;

  return (
    <section className="reco-section sidebar-box">
      <h3 className="reco-title sidebar-title">Recomendados para ti</h3>
      <Virtuoso
        data={reco}
        useWindowScroll
        computeItemKey={(index, post) => post._id}
        itemContent={(index, post) => (
          <div style={{ marginBottom: 12 }}>
            <PostCard
              post={post}
              user={user}
              followLoading={followLoading}
              onLike={onLike}
              onFollow={onFollow}
              onUnfollow={onUnfollow}
              isFollowing={isFollowing}
            />
          </div>
        )}
      />
    </section>
  );
}
