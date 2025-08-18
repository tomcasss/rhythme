// API Configuration
const BASE_URL = (typeof window !== 'undefined')
  ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1`
  : 'http://localhost:5000/api/v1';

// Configuración específica para Spotify (requiere 127.0.0.1)
export const SPOTIFY_CONFIG = {
  REDIRECT_URI: 'http://127.0.0.1:5173/callback/spotify',
  FRONTEND_HOST: '127.0.0.1:5173'
};

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`,
  GOOGLE_LOGIN: `${BASE_URL}/auth/google/login`,
  GOOGLE_REGISTER: `${BASE_URL}/auth/google/register`,
  
  // User endpoints
  GET_USER: (id) => `${BASE_URL}/users/${id}`,
  UPDATE_USER: (id) => `${BASE_URL}/users/${id}`,
  DELETE_USER: (id) => `${BASE_URL}/users/${id}`,
  UPDATE_PASSWORD: (id) => `${BASE_URL}/users/${id}/password`,
  UPDATE_PRIVACY: (id) => `${BASE_URL}/users/${id}/privacy`,
  DEACTIVATE_ACCOUNT: (id) => `${BASE_URL}/users/${id}/deactivate`,
  REACTIVATE_ACCOUNT: (id) => `${BASE_URL}/users/${id}/reactivate`,
  FOLLOW_USER: (id) => `${BASE_URL}/users/follow/${id}`,
  UNFOLLOW_USER: (id) => `${BASE_URL}/users/unfollow/${id}`,
  SEARCH_USERS: (query) => `${BASE_URL}/users/search?q=${encodeURIComponent(query)}`,
  FRIEND_RECOMMENDATIONS: (userId, limit) => `${BASE_URL}/users/${userId}/recommendations/friends${limit ? `?limit=${limit}` : ''}`,
  // Reports / moderation
  REPORT_USER: (targetId) => `${BASE_URL}/users/${targetId}/report`,
  LIST_REPORTS: (status, limit) => `${BASE_URL}/users/reports/all${status ? `?status=${status}` : ''}${limit ? `${status ? '&' : '?'}limit=${limit}` : ''}`,
  REVIEW_REPORT: (reportId) => `${BASE_URL}/users/reports/${reportId}/review`,
  
  // Post endpoints
  GET_POSTS: `${BASE_URL}/posts`,
  CREATE_POST: `${BASE_URL}/posts/create-post`,
  UPDATE_POST: (id) => `${BASE_URL}/posts/update-post/${id}`,
  DELETE_POST: (id, userId) => `${BASE_URL}/posts/delete-post/${id}/${userId}`,
  LIKE_POST: (id) => `${BASE_URL}/posts/like-post/${id}`,
  GET_POST: (id) => `${BASE_URL}/posts/get-post/${id}`,
  GET_TIMELINE_POSTS: (userId, { limit, before } = {}) => {
    const qs = [];
    if (limit) qs.push(`limit=${encodeURIComponent(limit)}`);
    if (before) qs.push(`before=${encodeURIComponent(before)}`);
    return `${BASE_URL}/posts/get-timeline-posts/${userId}${qs.length ? `?${qs.join('&')}` : ''}`;
  },
  GET_USER_POSTS: (userId) => `${BASE_URL}/posts/get-user-posts/${userId}`,
  GET_RECOMMENDED_POSTS: (userId, limit) => `${BASE_URL}/posts/recommended/${userId}${limit ? `?limit=${limit}` : ''}`,
  SEARCH_POSTS: (query) => `${BASE_URL}/posts/search?q=${encodeURIComponent(query)}`,
  
  // Comment endpoints
  COMMENT_POST: (id) => `${BASE_URL}/posts/comment-post/${id}`,
  GET_COMMENTS: (id) => `${BASE_URL}/posts/get-comments/${id}`,

  //NOTIFICATION endpoints
  GET_USER_NOTIFICATIONS: (userId) => `${BASE_URL}/notifications/user/${userId}`,
  MARK_NOTIFICATION_AS_READ: (notifId) => `${BASE_URL}/notifications/${notifId}/read`,

  // Spotify endpoints
  SPOTIFY_SEARCH: (query, type, limit) => `${BASE_URL}/spotify/search?query=${encodeURIComponent(query)}&type=${type || 'track,artist,playlist,album'}&limit=${limit || 20}`,
  SPOTIFY_DETAILS: (type, id) => `${BASE_URL}/spotify/details/${type}/${id}`,
  SPOTIFY_AUTH_URL: `${BASE_URL}/spotify/auth-url`,
  SPOTIFY_CALLBACK: `${BASE_URL}/spotify/callback`,
  SPOTIFY_CONNECTION_STATUS: (userId) => `${BASE_URL}/spotify/connection-status/${userId}`,
  SPOTIFY_DISCONNECT: (userId) => `${BASE_URL}/spotify/disconnect/${userId}`,
  SPOTIFY_USER_PLAYLISTS: (userId, limit, offset) => `${BASE_URL}/spotify/user/${userId}/playlists?limit=${limit || 20}&offset=${offset || 0}`,
  SPOTIFY_USER_SAVED_TRACKS: (userId, limit, offset) => `${BASE_URL}/spotify/user/${userId}/saved-tracks?limit=${limit || 20}&offset=${offset || 0}`,
  SPOTIFY_USER_TOP_ARTISTS: (userId, limit, timeRange) => `${BASE_URL}/spotify/user/${userId}/top-artists?limit=${limit || 20}&timeRange=${timeRange || 'medium_term'}`,
  SPOTIFY_USER_TOP_TRACKS: (userId, limit, timeRange) => `${BASE_URL}/spotify/user/${userId}/top-tracks?limit=${limit || 20}&timeRange=${timeRange || 'medium_term'}`,

  // Conversations
  GET_CONVERSATIONS: (userId) => `${BASE_URL}/conversations/user/${userId}`,
  OPEN_CONVERSATION: `${BASE_URL}/conversations/open`,

  // Messages
  GET_MESSAGES: (conversationId) => `${BASE_URL}/messages/${conversationId}`,
  SEND_MESSAGE: `${BASE_URL}/messages`,

  //Password Reset
  REQUEST_PASSWORD_RESET: `${BASE_URL}/auth/password-reset/request`,
  CONFIRM_PASSWORD_RESET: `${BASE_URL}/auth/password-reset/confirm`,
};
/* export const API = {
  BASE_URL,
  AUTH: {
    REQUEST_PASSWORD_RESET: `${BASE_URL}/auth/password-reset/request`,
    CONFIRM_PASSWORD_RESET: `${BASE_URL}/auth/password-reset/confirm`,
  }
}
  

export async function requestPaswordReset(email){
  const res = await fetch(API.AUTH.REQUEST_PASSWORD_RESET, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email}),
  });
  if (!res.ok) throw new Error('No se pudo procesar la solicitud');
  return res.json();
} */

export default API_ENDPOINTS;