// frontend/src/services/profileService.ts

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Headers ────────────────────────────────────────────────────────────────

// Header cho request JSON
function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Header cho upload file (FormData)
function authMultipartHeaders(): HeadersInit {
  const token = localStorage.getItem('token');

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PersonalInfo {
  id?: number;
  user_id?: number;
  full_name: string;
  title: string;
  bio: string;
  location: string;
  phone: string;
  gender: 'male' | 'female' | 'other' | '';
  dob: string;
  cv_url?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  social_links?: Record<string, string>;
}

export interface WorkExperience {
  id?: number;
  company_name: string;
  position: string;
  description: string;
  start_date: string;
  end_date?: string | null;
}

export interface Education {
  id?: number;
  school_name: string;
  major: string;
  description?: string;
  start_date: string;
  end_date?: string | null;
}

export interface ProfileData {
  personalInfo: PersonalInfo;
  experiences: WorkExperience[];
  education: Education[];
  skills: string[];
}

// ─── CV Search Types ───────────────────────────────────────────────────────

export interface SearchCandidateParams {
  keyword?: string;
  location?: string;
  exp_min?: number;
  exp_max?: number;
  skills?: string;
}

export interface Candidate {
  id: number;
  name: string;
  title: string;
  exp: string;
  location: string;
  skills: string[];
  avatar: string;
  avatar_url?: string;
}

// ─── API Calls ─────────────────────────────────────────────────────────────

// Lấy profile
export async function getProfile(
  userId: number | string
): Promise<ProfileData> {
  const res = await fetch(`${BASE_URL}/api/profile/${userId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Không thể tải hồ sơ');
  }

  return res.json();
}

// Lưu profile
export async function saveProfile(
  userId: number | string,
  data: Omit<ProfileData, 'personalInfo'> & {
    personalInfo: PersonalInfo;
  }
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/profile/update`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ userId, ...data }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Không thể lưu hồ sơ');
  }
}

// ─── Upload CV ─────────────────────────────────────────────────────────────

export async function uploadCV(
  file: File
): Promise<{
  cv_url: string;
  original_name: string;
  size: number;
}> {
  const formData = new FormData();
  formData.append('cv', file);

  const res = await fetch(`${BASE_URL}/api/profile/cv/upload`, {
    method: 'POST',
    headers: authMultipartHeaders(),
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || 'Upload CV thất bại');
  }

  return {
    cv_url: json.cv_url,
    original_name: file.name,
    size: file.size,
  };
}

// ─── Delete CV ─────────────────────────────────────────────────────────────

export async function deleteCV(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/profile/cv`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Xóa CV thất bại');
  }
}

// ─── Upload Avatar / Cover ─────────────────────────────────────────────────

export const uploadProfileImage = async (
  file: File,
  type: 'avatar' | 'cover'
) => {
  const formData = new FormData();
  formData.append(type, file);

  // ✅ ĐÃ ĐỔI: `/api/profile/upload-${type}` -> `/api/profile/${type}`
  // Khi chạy thực tế sẽ sinh ra đúng endpoint: `/api/profile/avatar` hoặc `/api/profile/cover`
  const res = await fetch(
    `${BASE_URL}/api/profile/${type}`,
    {
      method: 'POST',
      headers: authMultipartHeaders(),
      body: formData,
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Upload ảnh thất bại');
  }

  return res.json();
};

// ─── Search Candidates ─────────────────────────────────────────────────────

export async function searchCandidates(
  params: SearchCandidateParams
): Promise<Candidate[]> {
  try {
    const queryParams = new URLSearchParams();

    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.location) queryParams.append('location', params.location);
    if (params.exp_min !== undefined && params.exp_min !== null)
      queryParams.append('exp_min', params.exp_min.toString());
    if (params.exp_max !== undefined && params.exp_max !== null)
      queryParams.append('exp_max', params.exp_max.toString());
    if (params.skills) queryParams.append('skills', params.skills);

    const url = `${BASE_URL}/api/profile/search-cv?${queryParams.toString()}`;
    const res = await fetch(url, { method: 'GET', headers: authHeaders() });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('Lỗi kết nối hàm searchCandidates:', error);
    return [];
  }
}