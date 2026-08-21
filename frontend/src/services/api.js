import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getMessages = async () => {
  const response = await api.get('/messages');
  return response.data;
};

export const createMessage = async (username, text) => {
  const response = await api.post('/messages', { username, text });
  return response.data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/messages/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const data = response.data;
  if (data.data?.imageUrl) {
    data.data.imageUrl = BASE_URL + data.data.imageUrl;
  }
  return data;
};

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
