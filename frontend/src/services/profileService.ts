// frontend/src/services/profileService.ts

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function authHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
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

// ─── BỔ SUNG: Types cho tính năng Tìm kiếm CV (CVSearch) ───────────────────────

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
    return res.json(); // { success, personalInfo, experiences, education, skills }
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

export async function uploadCV(file: File): Promise<{ cv_url: string }> {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('cv', file); // 'cv' phải khớp với upload.single('cv')

    const res = await fetch(`${BASE_URL}/api/profile/cv/upload`, {
        method: 'POST',
        headers: {
            // KHÔNG set 'Content-Type': 'application/json' ở đây!
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    const json = await res.json();

    if (!res.ok) {
        throw new Error(json.message || 'Upload CV thất bại');
    }

    // Nếu backend trả về { success: true, cv_url: "..." } 
    // thì return json trực tiếp hoặc json.cv_url tùy bạn cấu hình
    return json; 
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

export const uploadProfileImage = async (
  file: File,
  type: 'avatar' | 'cover'
) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  
  // Tùy thuộc vào Backend backend dùng upload.single('avatar') hay upload.single('image')
  // Đảm bảo tên key này khớp với backend của bạn!
  formData.append(type, file); // Gửi tên key linh hoạt theo biến type ('avatar' hoặc 'cover')

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/profile/upload-${type}`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {}, // Thêm Token vào đây
      body: formData,
    }
  );

  if (!res.ok) throw new Error('Upload thất bại');

  return res.json();
};

// ─── BỔ SUNG: Hàm kết nối API Tìm kiếm ứng viên (Đã gia cố an toàn) ───────────────
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
        
        // Nếu không thành công (ví dụ lỗi kết nối hoặc chưa sửa route backend), 
        // trả về mảng rỗng để Frontend hiển thị "Không tìm thấy ứng viên..." thay vì crash giao diện
        if (!res.ok) {
            console.warn("API tìm kiếm ứng viên trả về status lỗi:", res.status);
            return [];
        }
        
        const json = await res.json();
        return json.data || []; // Trả về danh sách ứng viên (đảm bảo luôn là mảng)
    } catch (error) {
        console.error("Lỗi kết nối hàm searchCandidates:", error);
        return []; // Trả về mảng rỗng nếu mất mạng hoặc sập server
    }
}