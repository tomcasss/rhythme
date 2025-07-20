// API Configuration
const BASE_URL = 'http://localhost:5000/api/v1';

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
  
  // Comment endpoints
  COMMENT_POST: (id) => `${BASE_URL}/posts/comment-post/${id}`,
  GET_COMMENTS: (id) => `${BASE_URL}/posts/get-comments/${id}`,
};

export default API_ENDPOINTS;