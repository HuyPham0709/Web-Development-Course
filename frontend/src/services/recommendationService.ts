// services/recommendationService.ts — thêm hàm invalidate

import axios from 'axios';

const API_URL = 'https://web-development-course-y23i.onrender.com/api/recommendations';

export const getRecommendations = async () => {
  return axios.get(API_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
};

// Dispatch event để báo cho sidebar biết cần refresh
export const notifyRecommendationsRefresh = () => {
  window.dispatchEvent(new CustomEvent('criteria-updated'));
};