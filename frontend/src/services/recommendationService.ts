import axios from 'axios';

// Lấy base URL từ biến môi trường (nhớ bỏ dấu / ở cuối biến trên Vercel nhé)
const BASE_URL = import.meta.env.VITE_API_URL || 'https://web-development-course-y23i.onrender.com';
const API_URL = `${BASE_URL}/api/recommendations`;

export const getRecommendations = async () => {
  return axios.get(API_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
};

export const notifyRecommendationsRefresh = () => {
  window.dispatchEvent(new CustomEvent('criteria-updated'));
};