// API Configuration
const BASE_URL = 'http://localhost:5000/api/v1';

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
  FOLLOW_USER: (id) => `${BASE_URL}/users/follow/${id}`,
  UNFOLLOW_USER: (id) => `${BASE_URL}/users/unfollow/${id}`,
  SEARCH_USERS: (query) => `${BASE_URL}/users/search?q=${encodeURIComponent(query)}`,
  
  // Post endpoints
  GET_POSTS: `${BASE_URL}/posts`,
  CREATE_POST: `${BASE_URL}/posts/create-post`,
  UPDATE_POST: (id) => `${BASE_URL}/posts/update-post/${id}`,
  DELETE_POST: (id, userId) => `${BASE_URL}/posts/delete-post/${id}/${userId}`,
  LIKE_POST: (id) => `${BASE_URL}/posts/like-post/${id}`,
  GET_POST: (id) => `${BASE_URL}/posts/get-post/${id}`,
  GET_TIMELINE_POSTS: (userId) => `${BASE_URL}/posts/get-timeline-posts/${userId}`,
  GET_USER_POSTS: (userId) => `${BASE_URL}/posts/get-user-posts/${userId}`,
  
  // Comment endpoints
  COMMENT_POST: (id) => `${BASE_URL}/posts/comment-post/${id}`,
  GET_COMMENTS: (id) => `${BASE_URL}/posts/get-comments/${id}`,

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
};

export default API_ENDPOINTS;