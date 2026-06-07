const API = import.meta.env.VITE_API_URL || 'https://web-development-course-y23i.onrender.com/';

const headers = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

export const getFavoritejobs = async () => {
  const res = await fetch(`${API}/api/favorites`, { headers: headers() });
  return res.json();
};

export const addFavoriteJob = async (jobId: number) => {
  const res = await fetch(`${API}/api/favorites/${jobId}`, {
    method: 'POST', headers: headers()
  });
  return res.json();
};

export const removeFavoriteJob = async (jobId: number) => {
  const res = await fetch(`${API}/api/favorites/${jobId}`, {
    method: 'DELETE', headers: headers()
  });
  return res.json();
};

export const checkFavoriteJob = async (jobId: number) => {
  const res = await fetch(`${API}/api/favorites/check/${jobId}`, { headers: headers() });
  return res.json();
};