import axios from 'axios';

// Lấy base URL từ env, nếu không có thì dùng mặc định
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Tự động thêm /api nếu chưa có
const API_BASE = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

export interface EmployerView {
  employer_id: number;
  company_name: string;
  company_logo: string | null;
  viewed_at: string;
  is_new: boolean;
}

export async function getVisibilityStatus(): Promise<boolean> {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_BASE}/candidate/visibility`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.allow_employer_search;
}

export async function updateVisibility(allow: boolean): Promise<void> {
  const token = localStorage.getItem('token');
  await axios.put(
    `${API_BASE}/candidate/visibility`,
    { allow_employer_search: allow },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function getProfileViews(): Promise<EmployerView[]> {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_BASE}/candidate/profile-views`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.views;
}