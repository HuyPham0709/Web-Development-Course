// frontend/src/services/profileService.ts

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Hàm tạo header chuẩn (Cho các request dạng JSON)
function authHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// 🎯 BỔ SUNG: Hàm tạo header riêng khi UPLOAD FILE (FormData)
// Khi dùng FormData, trình duyệt cần tự định nghĩa 'Content-Type' kèm theo 'boundary' của file,
// nếu ta cố tình ép 'Content-Type': 'application/json' thì backend sẽ không đọc được file.
function authMultipartHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ─── Types khớp với DB schema ─────────────────────────────────────────────────

export interface PersonalInfo {
    id?: number;
    user_id?: number;
    full_name: string;
    title: string;
    bio: string;
    location: string;
    phone: string;
    gender: 'male' | 'female' | 'other' | '';
    dob: string;          // 'YYYY-MM-DD'
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
    start_date: string;   // 'YYYY-MM-DD'
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

// ─── Types cho tính năng Tìm kiếm CV (CVSearch) ───────────────────────

export interface SearchCandidateParams {
    keyword?: string;
    location?: string;
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

// ─── API calls ────────────────────────────────────────────────────────────────

/** Lấy toàn bộ profile theo userId */
export async function getProfile(userId: number | string): Promise<ProfileData> {
    const res = await fetch(`${BASE_URL}/api/profile/${userId}`, {
        headers: authHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Không thể tải hồ sơ');
    }
    return res.json();
}

/** Lưu toàn bộ profile (1 request duy nhất) */
export async function saveProfile(
    userId: number | string,
    data: Omit<ProfileData, 'personalInfo'> & { personalInfo: PersonalInfo }
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

/** 🎯 Upload file CV — Đã đồng bộ qua authMultipartHeaders() */
export async function uploadCV(file: File): Promise<{ cv_url: string; original_name: string; size: number }> {
    const formData = new FormData();
    formData.append('cv', file);

    const res = await fetch(`${BASE_URL}/api/profile/cv/upload`, {
        method: 'POST',
        headers: authMultipartHeaders(), // Dùng header riêng cho file để tránh lỗi format
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Upload CV thất bại');
    }
    const json = await res.json();
    
    return {
        cv_url: json.cv_url,
        original_name: file.name, 
        size: file.size           
    };
}

/** Xóa CV */
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

/** 🎯 Upload ảnh Avatar / Cover — Đã sửa lỗi 403 bằng cách găm Token vào Header */
export const uploadProfileImage = async (
  file: File,
  type: 'avatar' | 'cover'
) => {
  const formData = new FormData();
  formData.append(type, file); 

  const res = await fetch(
    `${BASE_URL}/api/profile/upload-${type}`, // Đồng bộ dùng biến BASE_URL nhất quán
    {
      method: 'POST',
      headers: authMultipartHeaders(), // 🔥 THÊM DÒNG NÀY: Khóa giải quyết tận gốc lỗi 403 Forbidden
      body: formData
    }
  );

  if (!res.ok) {
     const err = await res.json();
     throw new Error(err.message || 'Upload ảnh thất bại');
  }

  return res.json(); // { success, avatar_url/cover_url, message }
};

// ─── Hàm kết nối API Tìm kiếm ứng viên ────────────────────────────────
export async function searchCandidates(params: SearchCandidateParams): Promise<Candidate[]> {
    try {
        const queryParams = new URLSearchParams();
        if (params.keyword) queryParams.append('keyword', params.keyword);
        if (params.location) queryParams.append('location', params.location);

        const url = `${BASE_URL}/api/profile/search-cv?${queryParams.toString()}`;

        const res = await fetch(url, {
            method: 'GET',
            headers: authHeaders(),
        });
        
        if (!res.ok) {
            console.warn("API tìm kiếm ứng viên trả về status lỗi:", res.status);
            return [];
        }
        
        const json = await res.json();
        return json.data || [];
    } catch (error) {
        console.error("Lỗi kết nối hàm searchCandidates:", error);
        return [];
    }
}