import axios from 'axios';
import { API_URL, BASE_URL, isConfigured } from './config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 12000,
});

export const CONNECTION_ERROR_MESSAGE = 'Server connection unavailable. Please try again.';

export const getFriendlyError = (error) => {
  if (!error?.response) {
    return CONNECTION_ERROR_MESSAGE;
  }

  const serverMessage = error.response?.data?.message;

  if (typeof serverMessage === 'string' && serverMessage.trim()) {
    return serverMessage;
  }

  if (error.response.status >= 500) {
    return 'Server error. Please try again in a moment.';
  }

  return CONNECTION_ERROR_MESSAGE;
};

export const getMessages = async () => {
  const response = await api.get('/messages');
  return response.data;
};

export const sendMessage = async (username, text) => {
  const response = await api.post(
    '/messages',
    { username, text },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/messages/upload', formData, {
    timeout: 30000,
  });
  return response.data;
};

export const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const checkServer = async () => {
  if (!isConfigured) {
    throw new Error('Server address is not configured');
  }
  const response = await api.get('/health', { timeout: 8000 });
  return response.data;
};

export default api;
